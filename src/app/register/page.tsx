"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UseUserStore";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";


// MUI Alert komponenti
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

type FormData = {
  firstName: string;
  lastName: string;
  age: string;
  email: string;
  password: string;
  repeatPassword: string;
};

type Errors = Partial<FormData> & { form?: string };
type Lang = "uz" | "en" | "ru";

const translations: Record<Lang, Record<string, string>> = {
  uz: {
    register: "Ro‘yxatdan o‘tish",
    firstname: "Ism",
    lastname: "Familiya",
    age: "Yosh",
    email: "Email",
    login:"Ro'yxatdan o'tganmisiz? Kirish",
    password: "Parol",
    repeatPassword: "Parolni takrorlang",
    required: "majburiy",
    invalidEmail: "Email noto‘g‘ri",
    invalidAge: "Yosh noto‘g‘ri",
    passwordTooShort: "Parol juda qisqa",
    passwordsDontMatch: "Parollar mos emas",
    or: "yoki",
    google: "Google orqali",
    github: "GitHub orqali",
    note: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak. Email yagona bo‘lishi kerak.",
    registerToContinue: "Davom etish uchun ro‘yxatdan o‘ting",
  },
  en: {
    register: "Register",
    firstname: "Firstname",
    lastname: "Lastname",
    age: "Age",
    login:"Already registered? Login",

    email: "Email",
    password: "Password",
    repeatPassword: "Repeat password",
    required: "required",
    invalidEmail: "Invalid email",
    invalidAge: "Invalid age",
    passwordTooShort: "Password too short",
    passwordsDontMatch: "Passwords do not match",
    or: "or",
    google: "Sign in with Google",
    github: "Sign in with GitHub",
    note: "Password must be at least 6 characters. Email must be unique.",
    registerToContinue: "Register to continue",
  },
  ru: {
    register: "Регистрация",
    firstname: "Имя",
    login:"Уже зарегистрированы? Войти",

    lastname: "Фамилия",
    age: "Возраст",
    email: "Эл. почта",
    password: "Пароль",
    repeatPassword: "Повторите пароль",
    required: "обязательное",
    invalidEmail: "Неверный email",
    invalidAge: "Неверный возраст",
    passwordTooShort: "Пароль слишком короткий",
    passwordsDontMatch: "Пароли не совпадают",
    or: "или",
    google: "Войти через Google",
    github: "Войти через GitHub",
    note: "Пароль должен содержать не менее 6 символов. Email должен быть уникальным.",
    registerToContinue: "Зарегистрируйтесь, чтобы продолжить",
  },
};

export default function RegisterForm() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [lang, setLang] = useState<Lang>("uz");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Snackbar
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");

  const t = translations[lang];
  const login = translations[lang];


  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate(): Errors {
    const errs: Errors = {};
    if (!form.firstName.trim()) errs.firstName = `${t.firstname} ${t.required}`;
    if (!form.lastName.trim()) errs.lastName = `${t.lastname} ${t.required}`;
    if (!form.email.trim()) errs.email = `${t.email} ${t.required}`;
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = t.invalidEmail;
    if (!form.age.trim()) errs.age = `${t.age} ${t.required}`;
    else if (!/^[0-9]{1,3}$/.test(form.age) || Number(form.age) <= 0)
      errs.age = t.invalidAge;
    if (!form.password) errs.password = `${t.password} ${t.required}`;
    else if (form.password.length < 6) errs.password = t.passwordTooShort;
    if (form.password !== form.repeatPassword)
      errs.repeatPassword = t.passwordsDontMatch;
    return errs;
  }

  // ✅ Backend javobidan xabar chiqaruvchi helper
  function extractBackendMessage(data: unknown, fallback?: unknown): string {
    if (!data) {
      if (fallback && typeof fallback === "string") return fallback;
      return "Xatolik yuz berdi.";
    }

    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed?.message === "string") return parsed.message;
        return data;
      } catch {
        return data;
      }
    }

    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      if (typeof obj.message === "string") return obj.message;
      if (typeof obj.error === "string") return obj.error;
      if (Array.isArray(obj.errors)) {
        return obj.errors
          .map((e: unknown) => {
            if (
              typeof e === "object" &&
              e !== null &&
              "message" in e &&
              typeof (e as { message?: string }).message === "string"
            ) {
              return (e as { message: string }).message;
            }
            return JSON.stringify(e);
          })
          .join(", ");
      }
      try {
        return JSON.stringify(obj);
      } catch {
        return "Xatolik yuz berdi.";
      }
    }

    return String(data);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      setAlertMessage("Formada xatolik mavjud!");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      setUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        age: Number(form.age),
      });

      await axios.post("https://faxriddin.bobur-dev.uz/verification/send", {
        type: "register",
        email: form.email,
      });

      setAlertMessage("Emailingizga code yuborildi!");
      setAlertSeverity("success");
      setAlertOpen(true);

      router.push("/sms/email/code");
    } catch (err: unknown) {
      console.error(err);

      let backendMsg = "Xatolik yuz berdi.";
      if (axios.isAxiosError(err)) {
        backendMsg = extractBackendMessage(err.response?.data, err.message);
      } else if (err && typeof err === "object" && "message" in err) {
        backendMsg = String((err as { message?: string }).message);
      } else {
        backendMsg = String(err ?? "Xatolik yuz berdi.");
      }

      setAlertMessage(backendMsg);
      setAlertSeverity("error");
      setAlertOpen(true);

      if (typeof backendMsg === "string" && /email/i.test(backendMsg)) {
        setErrors((prev) => ({ ...prev, email: backendMsg }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleOAuth(provider: "google" | "github") {
    window.location.href = `https://faxriddin.bobur-dev.uz/auth/${provider}`;
  }

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 text-gray-800 dark:text-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <LogoSVG />
              <div>
                <h1 className="text-xl font-semibold">SHIFO YOLI</h1>
                <p className="text-sm">{t.registerToContinue}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="text-sm rounded-lg border px-1 py-0.5 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="uz">UZ</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label={t.firstname}
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="John"
              />
              <InputField
                label={t.lastname}
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Doe"
              />
            </div>

            <InputField
              label={t.age}
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              error={errors.age}
              placeholder="30"
              className="mt-3 w-32"
            />

            <InputField
              label={t.email}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@company.com"
              className="mt-3"
            />

            <InputField
              label={t.password}
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="******"
              className="mt-3"
              showToggle={() => setShowPassword((prev) => !prev)}
              toggleState={showPassword}
            />

            <InputField
              label={t.repeatPassword}
              name="repeatPassword"
              type={showRepeatPassword ? "text" : "password"}
              value={form.repeatPassword}
              onChange={handleChange}
              error={errors.repeatPassword}
              placeholder="******"
              className="mt-3"
              showToggle={() => setShowRepeatPassword((prev) => !prev)}
              toggleState={showRepeatPassword}
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-lg py-2 font-medium shadow-sm hover:shadow-md transition bg-teal-600 text-white"
            >
              {submitting ? "..." : t.register}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-4 flex items-center gap-3">
            <hr className="flex-1" />
            <span className="text-xs text-gray-400">{t.or}</span>
            <hr className="flex-1" />
          </div>

          {/* OAuth */}
          <div className="mt-4 grid gap-2">
            <OAuthButton
              provider="google"
              onClick={() => handleOAuth("google")}
              label={t.google}
            />
            <OAuthButton
              provider="github"
              onClick={() => handleOAuth("github")}
              label={t.github}
            />
          </div>

          <p className="mt-4 text-xs text-gray-400">{t.note}</p>
          <Link
       href="/login"
      className="  text-blue-500 font-medium hover:underline transition-colors duration-200 "
     >
      {t.login}
    </Link>



          {/* MUI Snackbar Alert */}
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
    </div>
  );
}

// Input Field component
type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  showToggle?: () => void;
  toggleState?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  className,
  showToggle,
  toggleState,
}) => (
  <div className={className}>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div className="relative">
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`block w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:border-gray-600 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={showToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
          {toggleState ? <Visibility /> : <VisibilityOff />}
        </button>
      )}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// OAuth Button
const OAuthButton: React.FC<{
  provider: "google" | "github";
  onClick: () => void;
  label: string;
}> = ({ provider, onClick, label }) => (
  <button
    onClick={onClick}
    className="w-full rounded-lg border p-2 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
  >
    <Image
      src={
        provider === "google"
          ? "/img/icons8-google-48.png"
          : "/img/icons8-github-48.png"
      }
      alt={provider}
      width={20}
      height={20}
    />
    {label}
  </button>
);

// Logo component
const LogoSVG: React.FC = () => (
  <svg width="56" height="56" viewBox="0 0 120 120" aria-hidden>
    <g fill="none" fillRule="evenodd">
      <rect width="120" height="120" rx="12" fill="transparent" />
      <g transform="translate(10 8)">
        <path d="M8 6h20v8H8z" fill="#0F7F7A" />
        <path d="M16 0h8v20h-8z" fill="#0F7F7A" />
        <path d="M62 6s-18 30-28 34c-8 3-12 3-12 12v6h48V6z" fill="#0F7F7A" />
        <path
          d="M10 64c6-2 26-18 38-34"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </g>
  </svg>
);
