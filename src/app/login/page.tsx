"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import axios from "axios";
import Link from "next/link";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// ✅ Snackbar wrapper
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  status?: boolean;
  message?: string;
  tokens?: {
    AccessToken: string;
    RefreshToken: string;
  };
}

export default function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Snackbar holati
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");

  // Field xatolari
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Xatolikni tozalash
    if (name === "email") setEmailError("");
    if (name === "password") setPasswordError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");

    if (!form.email) {
      setEmailError("Email kiritilishi shart");
      return;
    }
    if (!form.password) {
      setPasswordError("Parol kiritilishi shart");
      return;
    }

    setSubmitting(true);
    // "https://faxriddin.bobur-dev.uz/auth/login",

    try {
      const res = await axios.post<LoginResponse>(
        "https://faxriddin.bobur-dev.uz/auth/login",
        form
      );

      if (res.data.status && res.data.tokens) {
        localStorage.setItem("accessToken", res.data.tokens.AccessToken);
        localStorage.setItem("refreshToken", res.data.tokens.RefreshToken);

        setAlertMessage(res.data.message || "Kirish muvaffaqiyatli");
        setAlertSeverity("success");
        setAlertOpen(true);

        
        router.push("/doctor/profile/about");
      } else {
        setAlertMessage(res.data.message || "Kirish muvaffiyatsiz");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
      let msg = "Xatolik yuz berdi.";
      if (axios.isAxiosError(error)) {
        const errData = error.response?.data as {
          message?:
            | string
            | { message?: string; error?: string; statusCode?: number };
        };

        if (typeof errData?.message === "string") {
          msg = errData.message;
        } else if (typeof errData?.message === "object") {
          msg = errData.message.message || errData.message.error || msg;
        } else {
          msg = error.message;
        }
      }

      if ( typeof msg =="string" && msg.toLowerCase().includes("email")) {
        setEmailError(msg);
      } else if (typeof msg =="string" && msg.toLowerCase().includes("password")) {
        setPasswordError(msg);
      } else {
        setAlertMessage(msg);
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 text-gray-800 dark:text-gray-200">
        <h2 className="text-lg font-semibold mb-4">Kirish</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:border-gray-600 ${
                emailError ? "border-red-500" : ""
              }`}
              placeholder="you@company.com"
              disabled={submitting}
              required
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Parol</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full rounded-lg border p-2 pr-10 text-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:border-gray-600 ${
                  passwordError ? "border-red-500" : ""
                }`}
                placeholder="******"
                disabled={submitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg py-2 font-medium shadow-sm hover:shadow-md transition bg-teal-600 text-white disabled:opacity-60"
          >
            {submitting ? "..." : "Kirish"}
          </button>
        </form>

        <p className="text-sm mt-3 text-center text-gray-600 dark:text-gray-400">
          Ro‘yxatdan o‘tmaganmisiz?{" "}
          <Link href="/register" className="text-teal-600 font-medium hover:underline">
            Ro‘yxatdan o‘tish
          </Link>
        </p>

        <p className="text-sm mt-3 text-center text-gray-600 dark:text-gray-400">
          Parolni unutdingizmi?{" "}
          <Link href="/edit/code/email" className="text-teal-600 font-medium hover:underline">
            Parolni tiklash
          </Link>
        </p>

        {/* Snackbar umumiy xabarlar uchun */}
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
