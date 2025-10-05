"use client";

import React, { useState, FormEvent } from "react";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UseUserStore"; // ✅ Zustand store

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function EmailVerificationPage() {
  const router = useRouter();
  const { setEmail } = useUserStore(); // ✅ emailni saqlash
  const [email, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Emailni store ga saqlaymiz
      setEmail(email);

      // ✅ OTP yuborish so‘rovi
      await axios.post("https://faxriddin.bobur-dev.uz/verification/send", {
        type: "reset_password",
        email,
      });

      setAlertMessage("Tasdiqlash kodi emailga yuborildi ✅");
      setAlertSeverity("success");
      setAlertOpen(true);

      // ✅ 2 soniyadan keyin OTP verification sahifasiga o‘tamiz
      setTimeout(() => router.push("/verification/email/password"), 1500);
    } catch (err) {
      const error = err as unknown as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setAlertMessage(
        error.response?.data?.message || "Xatolik yuz berdi ❌"
      );
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-96 text-gray-800 dark:text-gray-200"
      >
        <h2 className="text-2xl font-bold text-center text-teal-600">
          Parolni Tiklash
        </h2>
        <p className="text-sm text-center mb-2">
          Email manzilingizni kiriting — sizga tasdiqlash kodi yuboriladi
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmailInput(e.target.value)}
            required
            placeholder="example@gmail.com"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Yuborilmoqda..." : "Davom etish"}
        </button>
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
