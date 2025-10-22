"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import { useUserStore } from "@/store/UseUserStore";
import { Days_One } from "next/font/google";

// Snackbar uchun wrapper
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Backend response type-lar
type VerifyResponse = {
  success?: boolean;
  succase?: boolean; // sizning backendda shunday yozilgan bo'lishi mumkin
  ok?: boolean;
  message?: string;
};

type RegisterResponse = {
  tokens?: {
    AccessToken: string;
    RefreshToken: string;
  };
  message?: string;
};


export default function VerifyPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
    

  const OTP_LENGTH = 5;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [submitting, setSubmitting] = useState(false);

  // Snackbar state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");

  // sahifa ochilganda
  useEffect(() => {
    console.log(user);
    
    if (!user) {
      router.push("/");
    } else {
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    }
  }, [user, router]);

  const focusInput = (index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    const char = value.slice(-1);
    newOtp[index] = char || "";
    setOtp(newOtp);

    if (char && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key;
    if (key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        focusInput(index - 1);
      }
    } else if (key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusInput(index + 1);
    } else if (key === "Enter") {
      e.preventDefault();
      submitOtp();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "");
    if (!pasted) return;

    const digits = pasted.split("");
    const newOtp = [...otp];
    for (let i = 0; i < digits.length && index + i < OTP_LENGTH; i++) {
      newOtp[index + i] = digits[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    focusInput(nextIndex);
  };

  const submitOtp = async () => {
    if (!user) {
      setAlertMessage("Ro'yxat ma'lumotlari topilmadi. Iltimos qayta ro'yxatdan o'ting.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
  
    const code = otp.join("");
    if (code.length !== OTP_LENGTH || otp.some((v) => v === "")) {
      setAlertMessage("Iltimos to'liq kodni kiriting.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
  
    setSubmitting(true);
  
    try {
      // 1) verification/verify
      let vdata;
      try {
        const verifyRes = await axios.post<VerifyResponse>(
          "https://faxriddin.bobur-dev.uz/verification/verify",
          {
            type: "register",
            email: user.email,
            otp: code,
          }
        );
        vdata = verifyRes.data;
  
        const verified =
          vdata.success ??
          vdata.succase ??
          vdata.ok ??
          (verifyRes.status >= 200 && verifyRes.status < 300);
  
        if (!verified) {
          setAlertMessage(vdata.message || "Kod tasdiqlanmadi");
          setAlertSeverity("error");
          setAlertOpen(true);
          return; // ❌ register chaqirilmaydi
        }
      } catch (error) {
        // ❌ verify xato qaytarsa shu yerda to‘xtaymiz
        console.log(error);
        
        if (axios.isAxiosError(error)) {
          const data = error.response?.data;
          let msg = "Kod noto‘g‘ri yoki muddati tugagan";
  
          if (data) {
            if (Array.isArray(data.message)) {
              msg = data.message.join("\n");
            } else if (typeof data.message === "string") {
              msg = data.message;
            }
          }
  
          setAlertMessage(msg);
          setAlertSeverity("error");
          setAlertOpen(true);
          return; // ❌ faqat alert chiqadi, register ga o‘tmaydi
        }
  
        setAlertMessage("Kod tasdiqlanmadi");
        setAlertSeverity("error");
        setAlertOpen(true);
        return;
      }
  
      // 2) faqat verify muvaffaqiyatli bo‘lsa auth/register chaqiramiz
      try {
        const registerRes = await axios.post<RegisterResponse>(
          "https://faxriddin.bobur-dev.uz/auth/register",
          {
            email: user.email,
            password: user.password,
            lastName: user.lastName,
            firstName: user.firstName,
            age: user.age ?? 0,
            otp: code,
            day: user.day,
            month: user.month,
          }
        );
  
        const rdata = registerRes.data;
        const accessToken = rdata.tokens?.AccessToken;
        const refreshToken = rdata.tokens?.RefreshToken;
  
        if (accessToken && refreshToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        }
  
        setAlertMessage("Muvaffaqiyatli! Profilga yo'naltirilmoqda...");
        setAlertSeverity("success");
        setAlertOpen(true);
  
        router.push("/doctor/profile/about");
      } catch (error) {
        console.log(error);
        
        if (axios.isAxiosError(error)) {
          const data = error.response?.data;
          let msg = "Ro'yxatdan o'tishda xatolik";
  
          if (data) {
            if (Array.isArray(data.message)) {
              msg = data.message.join("\n");
            } else if (typeof data.message === "string") {
              msg = data.message;
            }
          }
  
          setAlertMessage(msg);
          setAlertSeverity("error");
          setAlertOpen(true);
  
          // ❌ faqat register xatolik bo‘lsa register sahifasiga qaytariladi
          setTimeout(() => {
            router.replace("/register");
          }, 22000);
        } else {
          setAlertMessage("Ro'yxatdan o'tishda noma'lum xatolik yuz berdi");
          setAlertSeverity("error");
          setAlertOpen(true);
  
          setTimeout(() => {
            router.replace("/register");
          }, 22000);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 text-gray-800 dark:text-gray-200">
        <h2 className="text-lg font-semibold mb-4">Kod kiriting</h2>

        <p className="text-sm text-gray-500 mb-4">
          Elektron pochtangizga yuborilgan {OTP_LENGTH} xonali kodni kiriting
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitOtp();
          }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={otp[idx]}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={(e) => handlePaste(e, idx)}
                className="w-12 h-12 text-center rounded-lg border text-lg font-medium focus:outline-none focus:ring-2"
                disabled={submitting}
                aria-label={`otp-${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg py-2 font-medium shadow-sm hover:shadow-md transition bg-teal-600 text-white disabled:opacity-60"
          >
            {submitting ? "..." : "Tasdiqlash"}
          </button>
        </form>

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
    </div>
  );
}
