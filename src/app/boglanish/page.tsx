"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import axios, { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useUserStore } from "@/store/UseUserStore";
import Header from "@/pages/Header";
import Footer from "@/pages/Footer";

interface ContactFormData {
  email: string;
  phone: string;
  message: string;
}

interface BackendError {
  message: string;
  error: string;
  statusCode: number;
}

export default function Contact(): JSX.Element {
  const { isDark } = useUserStore();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [formData, setFormData] = useState<ContactFormData>({
    email: "",
    phone: "",
    message: "",
  });

  interface BackendErrorData {
    message: {
      message: string;
      error: string;
      statusCode: number;
    };
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOpen(true);
    setLoading(true);
    setSuccess(null);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "https://faxriddin.bobur-dev.uz/contacts/create",
        {
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
        {
          headers: { "Content-Type": "application/json", accept: "*/*" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setFormData({ email: "", phone: "", message: "" });
      } else {
        setSuccess(false);
        setErrorMessage("Jo'natishda xatolik yuz berdi");
      }
    } catch (err) {
        const axiosError = err as AxiosError<BackendErrorData>;

        if (axiosError.response && axiosError.response.data) {
          const data = axiosError.response.data;
          if (data.message) {
            setErrorMessage(data.message.message);
          } else {
            setErrorMessage("Jo'natilmadi, iltimos qayta urinib ko'ring");
          }
          setSuccess(false);
        }
      
      setSuccess(false);
    } finally {
      setLoading(false);
      setTimeout(() => setOpen(false), 2000);
    }
  };

  return (
    <>
      <Header />
      <div
        className={`min-h-screen pt-26 p-6 transition-colors duration-300 ${
          isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        {/* Header Title */}
        <div className="max-w-[1200px] ml-[14%] mr-[17%] mt-8 flex flex-wrap justify-center md:justify-start gap-4 px-4">
          <h1 className="text-3xl font-bold mb-12 lg:text-[26px]">
            Savollaringiz bo‘lsa murojaat qiling
          </h1>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <div
            className={`flex flex-col items-center p-6 rounded-xl shadow ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <Phone size={36} className="text-blue-500 mb-3" />
            <h3 className="font-semibold">Telefon</h3>
            <p className="text-sm text-gray-500 mt-1">+998 (90) 364 12 07</p>
          </div>

          <div
            className={`flex flex-col items-center p-6 rounded-xl shadow ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <Mail size={36} className="text-blue-500 mb-3" />
            <h3 className="font-semibold">Elektron Pochta</h3>
            <p className="text-sm text-gray-500 mt-1">
              asqaraliyevfaxriddin2010@gmail.com
            </p>
          </div>

          <div
            className={`flex flex-col items-center p-6 rounded-xl shadow ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <MapPin size={36} className="text-blue-500 mb-3" />
            <h3 className="font-semibold">Manzil</h3>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Farg'ona vil., Farg'ona sh., 1-mavze, ShifoYoli
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div
          className={`shadow-lg rounded-2xl p-8 w-full max-w-lg mx-auto ${
            isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
          }`}
        >
          <h3 className="text-xl font-bold mb-6 text-center">
            Murojaatlarni shu yerdan jo‘nating!
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="user@example.com"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="+998901234567"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Xabar</label>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Matn"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Yuborish
            </button>
          </form>
        </div>

        {/* Status Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogContent sx={{ textAlign: "center", p: 4 }}>
            {loading ? (
              <>
                <CircularProgress size={60} sx={{ color: "blue" }} />
                <Typography mt={2} fontWeight="bold">
                  Yuborilmoqda...
                </Typography>
              </>
            ) : success ? (
              <>
                <CheckCircleIcon sx={{ fontSize: 60, color: "green" }} />
                <Typography mt={2} fontWeight="bold">
                  Muvaffaqiyatli jo'natildi
                </Typography>
              </>
            ) : (
              <>
                <ErrorOutlineIcon sx={{ fontSize: 60, color: "red" }} />
                <Typography mt={2} fontWeight="bold">
                  {errorMessage || "Jo'natilmadi"}
                </Typography>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </>
  );
}
