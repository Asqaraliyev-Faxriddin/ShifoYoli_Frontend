"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Loader2, DollarSign, CheckCircle } from "lucide-react";

// --- SHADCN/UI Analoglari: Haqiqiy loyihada siz ularni import qilishingiz kerak ---
// (Bu misolda oddiy HTML elementlarga Tailwind class'lar yordamida chiroyli ko'rinish berildi)

// Bu komponentni loyihangizda useToast hook va ToastProvider bilan ishlatishingiz kerak.
// Bu yerda men shartli ravishda toast funksiyasini yozdim.
const useToast = () => {
  const toast = (options: { title: string; description: string; variant?: 'default' | 'destructive' | 'success' }) => {
    // Haqiqiy loyihada bu yerda toastni ko'rsatish logikasi bo'ladi.
    console.log(`[TOAST - ${options.variant?.toUpperCase() || 'DEFAULT'}]: ${options.title} - ${options.description}`);
    // Vaqtincha oddiy alert ishlatish
    // alert(`${options.title}: ${options.description}`); 
  };
  return { toast };
};

// Dialog komponenti
const Dialog = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
        <div className="p-6">
          {children}
        </div>
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


// Interfaces
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

const Base_url = "https://faxriddin.bobur-dev.uz"


export default function PaymentDoctorPage() {
  const router = useRouter();
  
  // useParams xatosini tuzatish: 
  // useParams<T>() chaqiruvi Next.js 13/14 App Router'da to'g'ri ishlatilishi kerak.
  // Bu yerda 'id' ning mavjudligini tekshiramiz.
  const params = useParams();
  const selectedDoctorId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(selectedDoctorId || "");
  const [countday, setCountday] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Tokenni olish: Client tomonida ishlashni ta'minlaymiz
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      setToken(storedToken);

      // Token yo'q bo'lsa, /login ga yo'naltirish
      if (!storedToken) {
        toast({
          title: "Tizimga kirish talab qilinadi",
          description: "To'lovni amalga oshirish uchun avval tizimga kiring.",
          variant: "destructive"
        });
        // 2 soniyadan keyin login sahifasiga yo'naltirish
        setTimeout(() => router.push("/login"), 2000); 
      }
    }
  }, [router, toast]);


  // Doktorlar va kategoriyalarni olish
  const fetchData = useCallback(async () => {
    if (!token) return; // Token yo'q bo'lsa, so'rov yubormaymiz

    try {
      const [categoryRes, doctorRes] = await Promise.all([
        axios.get(`${Base_url}/doctor-category/all?limit=10&offset=0`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`${Base_url}/User/doctors/all?limit=10&page=1`, 
          { headers: { Authorization: `Bearer ${token}` } }
        ),
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
        // Agar tanlangan doktor topilmasa, lekin ID bo'lsa, xabardor qilish
        toast({
          title: "Diqqat",
          description: "URL orqali berilgan shifokor topilmadi.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Ma'lumotlarni olishda xatolik:", error);
      toast({
        title: "Xatolik",
        description: "Shifokorlar yoki kategoriyalarni yuklashda xatolik yuz berdi.",
        variant: "destructive"
      });
    }
  }, [selectedDoctorId, token, toast]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  const handleSubmit = async () => {
    if (!token) {
      // Bu holat useEffect da allaqachon tekshirilgan, lekin ishonch uchun:
      toast({
        title: "Xato",
        description: "Token topilmadi, iltimos tizimga kiring!",
        variant: "destructive"
      });
      router.push("/login");
      return;
    }
    
    if (!selectedDoctor || countday < 1) {
      toast({
        title: "Ma'lumotlarni to'ldiring",
        description: "Iltimos, shifokorni tanlang va kunlar sonini kiriting.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${Base_url}/payment/Payment/create/user`,
        {
          countday,
          doctorId: selectedDoctor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      toast({
        title: "Muvaffaqiyatli",
        description: "To'lov so'rovi yuborildi. Keyingi qadamga o'ting.",
        variant: "success"
      });
      setIsModalOpen(true); // Modalni ochish
      
    } catch (err) {
      console.error("To'lov xatoligi:", err);
      toast({
        title: "Xatolik yuz berdi!",
        description: "To'lovni amalga oshirishda kutilmagan xato yuz berdi.",
        variant: "destructive"
      });
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
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={20} className="w-5 h-5" /> Orqaga
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        <DollarSign className="inline-block mr-2 text-green-600" size={28} /> Shifokorga to‘lov
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg space-y-5">
        
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Kategoriya tanlang</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedDoctor(""); 
            }}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white appearance-none"
          >
            <option value="">Kategoriya tanlang</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Shifokor tanlang</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            disabled={!selectedCategory || filteredDoctors.length === 0}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white appearance-none disabled:bg-gray-100 disabled:text-gray-500"
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
          {!selectedCategory && <p className="mt-1 text-xs text-red-500">Avval kategoriyani tanlang.</p>}
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-700">Necha kun suhbatlashmoqchisiz?</label>
          <input
            type="number"
            value={countday}
            onChange={(e) => setCountday(Math.max(1, Number(e.target.value)))} // Eng kamida 1 kun
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            min={1}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !selectedDoctor || countday < 1}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 flex items-center justify-center gap-3 mt-6"
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
      
      <Dialog isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        router.push("/doctor/profile/about");
      }}>
        <div className="text-center">
          <CheckCircle size={50} className="text-green-500 mx-auto mb-4" />
          <p className="text-xs font-medium text-gray-500 mb-2">ShifoYoli xizmati</p>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
             To'lov qabul qilindi!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Shifokor bilan suhbatlashish uchun so'rovingiz muvaffaqiyatli yuborildi. 
            Tez orada shifokor sizga javob beradi.
          </p>
          <div className="text-xl font-extrabold mb-4">
             <span className="text-blue-600">Shifo</span><span className="text-green-600">Yoli</span>
          </div>
          <button 
            onClick={() => {
              setIsModalOpen(false);
              router.push("/doctor/profile/about");
            }} 
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Davom etish
          </button>
        </div>
      </Dialog>
    </div>
  );
}

