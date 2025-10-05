"use client";

import React, {
  useState,
  FormEvent,
  ChangeEvent,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"; // Dropdown uchun icon

// ✅ Snackbar uchun alohida alert component
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Oylik mapping
const months: { name: string; value: number }[] = [
  { name: "Yanvar", value: 1 },
  { name: "Fevral", value: 2 },
  { name: "Mart", value: 3 },
  { name: "Aprel", value: 4 },
  { name: "May", value: 5 },
  { name: "Iyun", value: 6 },
  { name: "Iyul", value: 7 },
  { name: "Avgust", value: 8 },
  { name: "Sentyabr", value: 9 },
  { name: "Oktyabr", value: 10 },
  { name: "Noyabr", value: 11 },
  { name: "Dekabr", value: 12 },
];

export default function GooglePasswordForm() {
  const router = useRouter();
  const monthDropdownRef = useRef<HTMLDivElement>(null); // Oy dropdown uchun ref

  const [form, setForm] = useState({
    password: "",
    age: "",
    day: "",
    month: "",
    year: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false); // Oy dropdown holati

  // Tokens
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Snackbar
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("success");

  // ✅ querydan tokenlarni olish
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const access = params.get("accessToken");
      const refresh = params.get("refreshToken");

      if (access) {
        setAccessToken(access);
        localStorage.setItem("accessToken", access);
      }
      if (refresh) {
        localStorage.setItem("refreshToken", refresh);
      }

      // accestoken yoki ekkalasidan biri bolmasa refresh tokenni tekshirish
      if(!access || !refresh) {
        setAlertMessage("Noto'g'ri so'rov");
        setAlertSeverity("error");
        setAlertOpen(true);

        router.back(); 
      }
    }
  }, []);

  // ✅ Boshqa joyni bosish (Click outside) funksiyasi
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMonthDropdownOpen(false);
      }
    }

    // Event listener qo'shish
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Component yo'qolganida listenerni o'chirish
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [monthDropdownRef]);

  // input change handler
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    // Validatsiya
    if (name === "age") {
      const num = Number(value);
      if (num < 1) return; // ❌ 0 yoki manfiy qabul qilinmaydi
    }

    if (name === "day") {
      const num = Number(value);
      if (num < 1 || num > 31) return; // ❌ 1–31 oralig‘ida bo‘lishi kerak
    }

    if (name === "year") {
      const num = Number(value);
      const currentYear = new Date().getFullYear();
      if (num < 1900 || num > currentYear) return; // ❌ faqat 1900–hozirgi yil oralig‘ida
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Oy tanlash funksiyasi
  function handleMonthSelect(value: number) {
    setForm((prev) => ({ ...prev, month: String(value) }));
    setIsMonthDropdownOpen(false); // Tanlangandan so'ng yopish
  }

  // ✅ form submit
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!accessToken) throw new Error("Token topilmadi");
      if (!form.month) throw new Error("Oy tanlanishi shart");

      await axios.post(
        "https://faxriddin.bobur-dev.uz/auth/google/password",
        {
          password: form.password,
          age: Number(form.age),
          day: Number(form.day),
          month: Number(form.month),
          year: Number(form.year),
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setAlertMessage("Muvaffaqiyatli ro‘yxatdan o‘tdingiz!");
      setAlertSeverity("success");
      setAlertOpen(true);

      setTimeout(() => router.replace("/profile"), 900);
    } catch (err) {
      const error = err as unknown as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errMessage =
        error.response?.data?.message || error.message || "Xatolik yuz berdi";
      setAlertMessage(errMessage);
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }

  // Tanlangan oyni nomini olish
  const selectedMonthName =
    months.find((m) => m.value === Number(form.month))?.name || "Tanlang";

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-96 text-gray-800 dark:text-gray-200"
      >
        <h2 className="text-2xl font-bold text-center text-teal-600">
          Shifo Yoli
        </h2>
        <p className="text-sm text-center mb-2">
          Davom etish uchun ma’lumot kiriting
        </p>

        {/* Yosh (Kenglik qisqartirildi) */}
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">Yosh</label>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            min={1}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700"
            placeholder="18"
            required
          />
        </div>

        {/* Tug‘ilgan kun */}
        <div className="grid grid-cols-3 gap-2">
          {/* Kun */}
          <div>
            <label className="block text-sm font-medium mb-1">Kun</label>
            <input
              type="number"
              name="day"
              value={form.day}
              onChange={handleChange}
              min={1}
              max={31}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700"
              placeholder="1"
              required
            />
          </div>

          {/* Oy (Custom Dropdown) */}
          <div ref={monthDropdownRef}>
            <label className="block text-sm font-medium mb-1">Oy</label>
            <div className="relative">
              {/* Dropdownni ochish/yopish tugmasi */}
              <button
                type="button"
                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                className={`w-full border rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 transition duration-150 flex justify-between items-center ${
                  isMonthDropdownOpen
                    ? "border-teal-500 ring-2 ring-teal-500"
                    : "border-gray-300 dark:border-gray-600"
                } dark:bg-gray-700`}
                aria-expanded={isMonthDropdownOpen}
              >
                <span className={form.month ? "text-current" : "text-gray-500"}>
                  {selectedMonthName}
                </span>
                <KeyboardArrowDownIcon
                  className={`h-5 w-5 transition-transform ${
                    isMonthDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown menyu */}
              {isMonthDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg shadow-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 max-h-32 overflow-y-auto">
                  {/* max-h-32 (taxminan 3 ta element) + overflow-y-auto */}
                  {months.map((m) => (
                    <div
                      key={m.value}
                      onClick={() => handleMonthSelect(m.value)}
                      className={`cursor-pointer px-3 py-2 hover:bg-teal-100 dark:hover:bg-gray-600 ${
                        Number(form.month) === m.value
                          ? "bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {m.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Form submit uchun hidden input orqali required validatsiya ta'minlanadi */}
            <input
              type="hidden"
              name="month"
              value={form.month}
              required
              readOnly
            />
          </div>

          {/* Yil */}
          <div>
  <label className="block text-sm font-medium mb-1">Yil</label>
  <input
    type="text"
    name="year"
    value={form.year}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, ""); // faqat raqam
      const num = Number(value);
      const currentYear = new Date().getFullYear();

      if (num > currentYear || num < 0) return; // yildan oshsa yoki manfiy bo‘lsa, yozilmaydi

      setForm((prev) => ({ ...prev, year: value }));
    }}
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={4}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700"
    placeholder="2000"
    required
  />
</div>

        </div>

        {/* Parol */}
        <div>
          <label className="block text-sm font-medium mb-1">Parol</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700"
              placeholder="******"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </button>
          </div>
        </div>

        {/* Submit */}
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