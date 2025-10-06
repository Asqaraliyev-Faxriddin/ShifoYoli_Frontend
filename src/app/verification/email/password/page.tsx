"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useUserStore } from "@/store/UseUserStore"; // sizning store path

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const API_BASE = "https://faxriddin.bobur-dev.uz";

export default function VerificationEmailPasswordPage() {
  const router = useRouter();

  // Global email
  const email = useUserStore((s) => s.email);
  // const setEmail = useUserStore((s) => s.setEmail); // agar kerak bo'lsa

  // Form
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI / state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");

  // timer: 5 minutes = 300 seconds
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const timerRef = useRef<number | null>(null);

  // resend control (disable briefly to avoid spam)
  const [resendDisabled, setResendDisabled] = useState(false);

  // --- Helpers ---
  function showToast(message: string, severity: AlertColor = "info") {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  interface BackendErrorResponse {
    response?: {
      data?: {
        message?: string | { message?: string | string[] };
      };
    };
    message?: string;
  }
  
  function extractErrorMsg(err: unknown): string {
    const error = err as BackendErrorResponse;
  
    if (!error) return "Xatolik yuz berdi";
  
    const resp = error.response?.data;
    if (!resp) return error.message || "Xatolik yuz berdi";
  
    if (typeof resp.message === "string") return resp.message;
  
    if (resp.message && typeof resp.message === "object") {
      const inner = resp.message.message;
      if (Array.isArray(inner)) return inner.join(", ");
      if (typeof inner === "string") return inner;
    }
  
    return JSON.stringify(resp);
  }
  
  

  // --- mount: email check + timer start ---
  useEffect(() => {
    // If email missing or invalid, redirect to email-sending page
    const isValidEmail = (e?: string) =>
      !!e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    if (!email || !isValidEmail(email)) {
      showToast("Email topilmadi yoki noto'g'ri — iltimos email kiriting", "error");
      // kichik timeout berib yo'naltirish
      setTimeout(() => router.replace("/verification/email"), 1200);
      return;
    }

    // start countdown
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // tugadi — tozalash va yo'naltirish
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          showToast("Vaqt tugadi — login sahifasiga yo'naltiriladi", "error");
          setTimeout(() => router.replace("/login"), 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Resend kod
  async function handleResend() {
    if (!email) {
      showToast("Email topilmadi — iltimos avval emailni kiriting", "error");
      router.replace("/verification/email");
      return;
    }
    try {
      setResendDisabled(true);
      await axios.post(`${API_BASE}/verification/send`, {
        type: "reset_password",
        email,
      });

      showToast("Kod qayta yuborildi — 5 daqiqa ichida tekshiring", "success");
      setSecondsLeft(300); // reset 5 daqiqa

      // kichik cheklov: 10s ichida qayta bosilmasin
      setTimeout(() => setResendDisabled(false), 10000);
    } catch (err) {
      showToast(extractErrorMsg(err), "error");
      setTimeout(() => setResendDisabled(false), 3000);
    }
  }

  // Verify OTP then reset password
  async function handleVerifyAndReset(e?: React.FormEvent) {
    e?.preventDefault();

    if (!otp || otp.trim().length < 4) {
      showToast("Iltimos kodni to'liq kiriting", "error");
      return;
    }
    if (!password || password.length < 6) {
      showToast("Parol kamida 6 ta belgidan iborat bo'lishi kerak", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Parollar mos emas", "error");
      return;
    }
    if (!email) {
      showToast("Email topilmadi — qayta yuborish sahifasiga o'tiladi", "error");
      router.replace("/verification/email");
      return;
    }

    setLoading(true);

    try {
      // 1) Verify OTP
      await axios.post(`${API_BASE}/verification/verify`, {
        type: "reset_password",
        email,
        otp,
      });

      // 2) If success, reset password
      await axios.post(`${API_BASE}/auth/reset-password`, {
        email,
        otp,
        password,
      });

      showToast("Parol tiklandi — login sahifasiga yo'naltiriladi", "success");
      setTimeout(() => router.replace("/login"), 900);
    } catch (err) {
      const msg = extractErrorMsg(err);

      // Agar backend xatosi "email must be an email" bo'lsa, foydalanuvchini qayta email kiritish sahifasiga yo'naltiramiz
      if (typeof msg === "string" && msg.toLowerCase().includes("email must be an email")) {
        showToast("Email noto'g'ri — iltimos emailni qayta kiriting", "error");
        setTimeout(() => router.replace("/verification/email"), 1400);
      } else {
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleVerifyAndReset}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-96 text-gray-800 dark:text-gray-200"
      >
        <h2 className="text-2xl font-bold text-center text-teal-600">
          OTP orqali parol tiklash
        </h2>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Iltimos {email} manziliga yuborilgan kodni kiriting. Vaqt:{" "}
          <strong>{formatTime(secondsLeft)}</strong>
        </p>

        {/* OTP */}
        <div>
          <label className="block text-sm font-medium mb-1">Kod (OTP)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={8}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700"
            required
          />
        </div>

        {/* New password */}
        <div>
          <label className="block text-sm font-medium mb-1">Yangi parol</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Yangi parol"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium mb-1">Parolni tasdiqlang</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Yangi parolni qaytaring"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700"
            required
            minLength={6}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 items-center">
          <button
            type="submit"
            disabled={loading || secondsLeft <= 0}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Tekshirilmoqda..." : "Tasdiqlash va tiklash"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendDisabled}
            className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50"
          >
            Qayta yuborish
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Agar kodni olmadingizmi? Qayta yuborish tugmasini bosing.
        </p>
      </form>

      {/* Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
