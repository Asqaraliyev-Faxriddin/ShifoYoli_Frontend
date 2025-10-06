"use client";


import { useUserStore } from '@/store/UseUserStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback, useMemo, ReactNode } from 'react';

type Lang = "uz" | "en" | "ru";

type FormData = {
  firstName: string;
  lastName: string;
  age: string;
  month: number | ''; // Store month as number (1-12)
  day: string;
  email: string;
  password: string;
  repeatPassword: string;
};



// --- Translation Data ---

const monthNames: Record<Lang, string[]> = {
  uz: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};



type Errors = {
    firstName?: string;
    lastName?: string;
    age?: string;
    month?: string;
    day?: string;
    email?: string;
    password?: string;
    repeatPassword?: string;
  };
  
const translations: Record<Lang, Record<string, string>> = {
  uz: {
    register: "Ro‘yxatdan o‘tish",
    firstname: "Ism",
    lastname: "Familiya",
    age: "Yosh",
    month: "Oy",
    day: "Kun",
    email: "Email",
    login: "Ro'yxatdan o'tganmisiz? Kirish",
    password: "Parol",
    repeatPassword: "Parolni takrorlang",
    required: "majburiy",
    invalidEmail: "Email noto‘g‘ri",
    invalidAge: "Yosh noto‘g‘ri",
    invalidMonth: "Oy noto‘g‘ri",
    invalidDay: "Kun noto‘g‘ri",
    passwordTooShort: "Parol juda qisqa",
    passwordsDontMatch: "Parollar mos emas",
    note: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak. Email yagona bo‘lishi kerak.",
    registerToContinue: "Davom etish uchun ro‘yxatdan o‘ting",
    selectMonth: "Oyni tanlang",
    formError: "Kiritilgan malumotlarda xatolik mavjud!",
    successMsg: "Ro‘yxatdan o‘tish muvaffaqiyatli. Code yuborish simulyatsiya qilindi.",
    errorMsg: "Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.",
  },
  en: {
    register: "Register",
    firstname: "Firstname",
    lastname: "Lastname",
    age: "Age",
    month: "Month",
    day: "Day",
    login: "Already registered? Login",
    email: "Email",
    password: "Password",
    repeatPassword: "Repeat password",
    required: "required",
    invalidEmail: "Invalid email",
    invalidAge: "Invalid age",
    invalidMonth: "Invalid month",
    invalidDay: "Invalid day",
    passwordTooShort: "Password too short",
    passwordsDontMatch: "Passwords do not match",
    note: "Password must be at least 6 characters. Email must be unique.",
    registerToContinue: "Register to continue",
    selectMonth: "Select Month",
    formError: "There are errors in the entered data!",
    successMsg: "Registration successful. Code sending simulated.",
    errorMsg: "An error occurred. Please try again.",
  },
  ru: {
    register: "Регистрация",
    firstname: "Имя",
    lastname: "Фамилия",
    age: "Возраст",
    month: "Месяц",
    day: "День",
    login: "Уже зарегистрированы? Войти",
    email: "Эл. почта",
    password: "Пароль",
    repeatPassword: "Повторите пароль",
    required: "обязательное",
    invalidEmail: "Неверный email",
    invalidAge: "Неверный возраст",
    invalidMonth: "Неверный месяц",
    invalidDay: "Неверный день",
    passwordTooShort: "Пароль слишком короткий",
    passwordsDontMatch: "Пароли не совпадают",
    note: "Пароль должен содержать не менее 6 символов. Email должен быть уникальным.",
    registerToContinue: "Зарегистрируйтесь, чтобы продолжить",
    selectMonth: "Выберите месяц",
    formError: "Введенные данные содержат ошибки!",
    successMsg: "Регистрация успешна. Отправка кода симулирована.",
    errorMsg: "Произошла ошибка. Пожалуйста, попробуйте снова.",
  },
};

// --- Icons (Inline SVG) ---

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a1.86 1.86 0 0 1 1-1" />
    <path d="M22 12s-3 7-10 7a9.7 9.7 0 0 1-2.7-.49" />
    <path d="M12 9a3 3 0 1 0 3 3" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const LogoSVG: React.FC = () => (
  <svg width="56" height="56" viewBox="0 0 120 120" aria-hidden>
    <g fill="none" fillRule="evenodd">
      <rect width="120" height="120" rx="12" fill="transparent" />
      <g transform="translate(10 8)">
        <path d="M8 6h20v8H8z" fill="#047857" />
        <path d="M16 0h8v20h-8z" fill="#047857" />
        <path d="M62 6s-18 30-28 34c-8 3-12 3-12 12v6h48V6z" fill="#059669" />
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

// --- Custom Components ---

type InputFieldProps = {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  <div className={`mb-3 ${className}`}>
    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</label>
    <div className="relative">
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`block w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={showToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition"
        >
          {toggleState ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      )}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

type MonthDropdownProps = {
  label: string;
  lang: Lang;
  value: number | '';
  onChange: (monthNumber: number) => void;
  error?: string;
  placeholder: string;
};

const MonthDropdown: React.FC<MonthDropdownProps> = ({ label, lang, value, onChange, error, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[lang];
  const months = monthNames[lang];
  const selectedMonthName = value ? months[value - 1] : placeholder;

  const handleSelect = (monthNumber: number) => {
    onChange(monthNumber);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-3">
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</label>
      
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center rounded-lg border p-2 text-sm text-left transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            error ? "border-red-400" : "border-gray-300"
        } ${!value ? 'text-gray-400 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}
      >
        {selectedMonthName}
        <svg 
          className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg shadow-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
          <div className="max-h-28 overflow-y-auto custom-scrollbar rounded-lg">
            {months.map((month, index) => (
              <div
                key={index}
                onClick={() => handleSelect(index + 1)}
                className={`p-2 text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-gray-600 transition-colors ${
                  value === index + 1 ? 'bg-teal-100 dark:bg-teal-900 font-medium' : 'dark:text-white'
                }`}
              >
                {month}
              </div>
            ))}
          </div>
        </div>
      )}
       {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// --- Alert/Snackbar Replacement ---

type CustomAlertProps = {
    message: ReactNode;   // string emas, ReactNode
    severity: "success" | "error";
    onClose: () => void;
  };

  
  const CustomAlert: React.FC<CustomAlertProps> = ({ message, severity, onClose }) => {
    const baseClasses =
      severity === "success"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
  
    const icon =
      severity === "success" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
  
    return (
      <div
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-2xl font-medium flex items-center gap-3 transition-opacity duration-300 ${baseClasses}`}
        style={{ minWidth: "300px" }}
        role="alert"
      >
        {icon}
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto opacity-70 hover:opacity-100 transition"
        >
          &times;
        </button>
      </div>
    );
  };
  

// --- Main App Component ---

const App = () => {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    age: "",
    month: '',
    day: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

let router = useRouter()

let {setUser} = useUserStore()


  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [lang, setLang] = useState<Lang>("uz");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>("success");
  
  const t = translations[lang];

  // Auto-close alert after 4 seconds
  React.useEffect(() => {
    if (alertOpen) {
      const timer = setTimeout(() => {
        setAlertOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertOpen]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setForm(prevForm => {
        // Only allow numbers for age and day
        if ((name === "age" || name === "day") && value && !/^\d*$/.test(value)) {
            return prevForm;
        }

        // Limit age to 3 digits and day to 2 digits max
        if (name === "age" && value.length > 3) return prevForm;
        if (name === "day" && value.length > 2) return prevForm;

        return { ...prevForm, [name]: value };
    });
  }, []);

  const handleMonthChange = useCallback((monthNumber: number) => {
    setForm(prevForm => ({ ...prevForm, month: monthNumber }));
  }, []);

 
  const validate = useCallback((): Errors => {
    const errs: Errors = {};
  
    if (!form.firstName.trim()) errs.firstName = `${t.firstname} ${t.required}`;
    if (!form.lastName.trim()) errs.lastName = `${t.lastname} ${t.required}`;
  
    if (!form.email.trim()) errs.email = `${t.email} ${t.required}`;
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = t.invalidEmail;
  
    if (!form.age) errs.age = `${t.age} ${t.required}`;
    else if (Number(form.age) < 1 || Number(form.age) > 120)
      errs.age = t.invalidAge;
  
    if (!form.month) errs.month = `${t.month} ${t.required}`;
    else if (Number(form.month) < 1 || Number(form.month) > 12)
      errs.month = t.invalidMonth;
  
    if (!form.day) errs.day = `${t.day} ${t.required}`;
    else if (Number(form.day) < 1 || Number(form.day) > 31)
      errs.day = t.invalidDay;
  
    // Oddiy qo‘shimcha checklar
    const dayNum = Number(form.day);
    const monthNum = Number(form.month);
  
    if (dayNum > 29 && monthNum === 2) {
      errs.day = "Fevralda bunday kun yo'q.";
    //   @ts-ignore
    } else if (dayNum === 31 && [4, 6, 9, 11].includes(monthNum)) {
      errs.day = "Bu oyda 31 kun yo'q.";
    }
  
    if (!form.password) errs.password = `${t.password} ${t.required}`;
    else if (form.password.length < 6) errs.password = t.passwordTooShort;
  
    if (form.password !== form.repeatPassword)
      errs.repeatPassword = t.passwordsDontMatch;
  
    return errs;
  }, [form, t]);
  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    
    if (Object.keys(v).length > 0) {
      setErrors(v);
      setAlertMessage(t.formError);
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }
    
    setErrors({});
    setSubmitting(true);
    
    // Simulate API call (since external APIs are not available)
    try {
      

      setUser({...form,day:Number(form.day),month:Number(form.month),age:Number(form.age)})

      await axios.post(
        "https://faxriddin.bobur-dev.uz/verification/send",
        {email:form.email,type:"register"}, 
       
      );
      

      // Mock API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      setAlertMessage(t.successMsg);
      setAlertSeverity("success");
      setAlertOpen(true);

      // Simulate navigation to the code verification page
      console.log("Simulating navigation to /sms/email/code");

      router.push("sms/email/code")

    } catch (err: unknown) {
      console.error("Submission Error:", err);
      setAlertMessage(t.errorMsg);
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 font-sans">
      <style>{`
        /* Custom scrollbar for MonthDropdown */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #A1A1AA; /* gray-400 */
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #E5E7EB; /* gray-200 */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4B5563; /* gray-600 */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #1F2937; /* gray-800 */
        }
        /* Mobile specific adjustments */
        @media (max-width: 640px) {
            .sm\\:grid-cols-2 {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 md:p-8 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LogoSVG />
            <div>
              <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">SHIFO YOLI</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.registerToContinue}</p>
            </div>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="text-sm rounded-lg border px-3 py-1.5 font-medium shadow-sm cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="uz">O'zbekcha</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* First/Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label={t.firstname}
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="John"
              className="mb-0"
            />
            <InputField
              label={t.lastname}
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              error={errors.lastName}
              placeholder="Doe"
              className="mb-0"
            />
          </div>

          {/* Age and Birth Date */}
          <div className="grid grid-cols-5 gap-3 mt-3">
            <div className="col-span-1">
                <InputField
                    label={t.age}
                    name="age"
                    type="tel"
                    value={form.age}
                    onChange={handleChange}
                    error={errors.age}
                    placeholder="30"
                    className="mb-0"
                />
            </div>
            <div className="col-span-2">
                <MonthDropdown
                    label={t.month}
                    lang={lang}
                    value={form.month}
                    onChange={handleMonthChange}
                    error={errors.month}
                    placeholder={t.selectMonth}
                />
            </div>
            <div className="col-span-2">
                <InputField
                    label={t.day}
                    name="day"
                    type="tel"
                    value={form.day}
                    onChange={handleChange}
                    error={errors.day}
                    placeholder="15"
                    className="mb-0"
                />
            </div>
          </div>
          
          {/* Email */}
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

          {/* Password */}
          <InputField
            label={t.password}
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••"
            className="mt-3"
            showToggle={() => setShowPassword((prev) => !prev)}
            toggleState={showPassword}
          />

          {/* Repeat Password */}
          <InputField
            label={t.repeatPassword}
            name="repeatPassword"
            type={showRepeatPassword ? "text" : "password"}
            value={form.repeatPassword}
            onChange={handleChange}
            error={errors.repeatPassword}
            placeholder="••••••"
            className="mt-3"
            showToggle={() => setShowRepeatPassword((prev) => !prev)}
            toggleState={showRepeatPassword}
          />

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.note}</p>

          <button
            type="submit"
            disabled={submitting}
            className={`mt-6 w-full rounded-xl py-3 font-semibold shadow-lg transition-all duration-200 transform 
              ${submitting ? 'bg-teal-700 cursor-not-allowed opacity-70' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-xl'} 
              text-white focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-800`}
          >
            {submitting ? (
                <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.register}...
                </div>
            ) : t.register}
          </button>





        </form>


                  {/* Google Sign Up */}
                  <div className="mt-4">
  <button
    onClick={() => window.location.href = "https://faxriddin.bobur-dev.uz/auth/google"}
    className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
  >
    <img
      src="/img/icons8-google-48.png"
      alt="Google"
      className="w-5 h-5"
    />
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
      Google orqali kirish
    </span>
  </button>
</div>

        <div className="mt-6 text-center">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); console.log('Navigating to login page...'); }}
            className="text-teal-600 dark:text-teal-400 font-medium hover:underline transition-colors duration-200"
          >
            {t.login}
          </a>
        </div>
      </div>
      
      {alertOpen && (
  <CustomAlert
    message={
      <span className="text-gray-800 dark:text-gray-200">
        {alertMessage}
      </span>
    }
    severity={alertSeverity}
    onClose={() => setAlertOpen(false)}
  />
)}


    </div>
  );
}

export default App;
