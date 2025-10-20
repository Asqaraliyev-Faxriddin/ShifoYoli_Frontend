"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import axios, { AxiosError, isAxiosError } from "axios";
import { ArrowLeft, Loader2, DollarSign, CheckCircle } from "lucide-react";
import { Snackbar, Alert } from "@mui/material";

// --- SHADCN/UI Analoglari ---
const useToast = () => {
  const toast = (options: {
    title: string;
    description: string;
    variant?: "default" | "destructive" | "success";
  }) => {
    console.log(
      `[TOAST - ${options.variant?.toUpperCase() || "DEFAULT"}]: ${options.title} - ${options.description}`
    );
  };
  return { toast };
};

const Dialog = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
        <div className="p-6">{children}</div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
// --- SHADCN/UI Analoglari tugadi ---

interface Category {
  id: string;
  name: string;
  img?: string | null;
  doctors: {
    doctorId: string;
    id: string;
    bio: string;
  }[];
}

interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  doctorProfile: {
    categoryId: string;
  };
}

const Base_url = "https://faxriddin.bobur-dev.uz";

export default function PaymentDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const selectedDoctorId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    selectedDoctorId || ""
  );
  const [countday, setCountday] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Snackbar holati
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      setToken(storedToken);

      if (!storedToken) {
        showSnackbar(
          "To‘lovni amalga oshirish uchun tizimga kiring!",
          "error"
        );
        setTimeout(() => router.push("/login"), 2000);
      }
    }
  }, [router]);

  // Snackbar ko‘rsatish uchun helper
  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      const [categoryRes, doctorRes] = await Promise.all([
        axios.get(`${Base_url}/doctor-category/all?limit=10&offset=0`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${Base_url}/User/doctors/all?limit=10&page=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCategories(categoryRes.data);
      setDoctors(doctorRes.data.data);

      const defaultDoctor = doctorRes.data.data.find(
        (d: Doctor) => d.id === selectedDoctorId
      );

      if (defaultDoctor) {
        setSelectedCategory(defaultDoctor.doctorProfile.categoryId);
        setSelectedDoctor(defaultDoctor.id);
      } else if (selectedDoctorId) {
        showSnackbar("URL orqali berilgan shifokor topilmadi.", "warning");
      }
    } catch (error) {
      console.error("Ma'lumotlarni olishda xatolik:", error);
      showSnackbar("Ma'lumotlarni yuklashda xatolik yuz berdi.", "error");
    }
  }, [selectedDoctorId, token]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, fetchData]);

  const handleSubmit = async () => {
    if (!token) {
      showSnackbar("Token topilmadi. Tizimga kiring!", "error");
      router.push("/login");
      return;
    }

    if (!selectedDoctor || countday < 1) {
      showSnackbar("Iltimos, shifokor va kunlar sonini kiriting.", "warning");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${Base_url}/payment/Payment/create/user`,
        { countday, doctorId: selectedDoctor },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showSnackbar("To‘lov so‘rovi yuborildi!", "success");
      setIsModalOpen(true);
    } catch (err) {

      if(isAxiosError(err)) {
    
        if(err.response?.status === 401) {
          showSnackbar("Avtorizatsiya xatoligi. Iltimos, tizimga kiring.", "error");
          router.push("/login");
          return;
        }
        if(err.response?.status === 403) {
          showSnackbar("Sizda ushbu amalni bajarish uchun ruxsat yo‘q.", "error");
          return;
        }
        if(err.response?.status === 500) {
          showSnackbar("Serverda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.", "error");
          return;
        }

       showSnackbar(err.response?.data.message.message, "error");


      }
      // showSnackbar("To‘lovni amalga oshirishda xato yuz berdi.", "error");

      showSnackbar( isAxiosError(err)? err.response?.data.message.message:"Tizimda xatolik yuz berdi.", "error");

    } finally {
      setLoading(false);
    }
  };
  
  const filteredDoctors = doctors.filter(
    (d) => d.doctorProfile?.categoryId === selectedCategory
  );

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto min-h-screen bg-gray-50">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft size={20} /> Orqaga
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        <DollarSign className="inline-block mr-2 text-green-600" size={28} />{" "}
        Shifokorga to‘lov
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg space-y-5">
        {/* --- Category select --- */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Kategoriya tanlang
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedDoctor("");
            }}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Kategoriya tanlang</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* --- Doctor select --- */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Shifokor tanlang
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            disabled={!selectedCategory || filteredDoctors.length === 0}
            className="w-full border border-gray-300 p-3 rounded-lg disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">
              {selectedCategory && filteredDoctors.length === 0
                ? "Bu kategoriyada shifokor yo'q"
                : "Shifokor tanlang"}
            </option>
            {filteredDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.firstName} {doc.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* --- Day input --- */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Necha kun suhbatlashmoqchisiz?
          </label>
          <input
            type="number"
            value={countday}
            onChange={(e) =>
              setCountday(Math.max(1, Number(e.target.value)))
            }
            className="w-full border border-gray-300 p-3 rounded-lg"
            min={1}
          />
        </div>

        {/* --- Submit button --- */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedDoctor || countday < 1}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-3 mt-6"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <>
              <DollarSign size={20} /> To‘lovni amalga oshirish
            </>
          )}
        </button>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* --- Success Dialog --- */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          router.push("/doctor/profile/about");
        }}
      >
        <div className="text-center">
          <CheckCircle
            size={50}
            className="text-green-500 mx-auto mb-4"
          />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            To‘lov qabul qilindi!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Shifokor bilan suhbatlashish uchun so‘rovingiz yuborildi.
          </p>
          <button
            onClick={() => {
              setIsModalOpen(false);
              router.push("/doctor/profile/about");
            }}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Davom etish
          </button>
        </div>
      </Dialog>

      {/* --- Snackbar --- */}

    </div>
  );
}
