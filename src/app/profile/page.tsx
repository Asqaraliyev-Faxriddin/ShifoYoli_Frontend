"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import DevicesIcon from "@mui/icons-material/Devices";
import LockIcon from "@mui/icons-material/Lock"; // Rollarni ko'rsatish uchun

// --- TypeScript Interfeyslari ---

interface Device {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImg: string | null;
  age: number;
  devices: Device[];
  createdAt: string;
  _count: {
    devices: number;
    meetingsAsUser: number;
  };
}

// ✅ Snackbar uchun alohida alert component
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// --- Asosiy Komponent ---
export default function Profile() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Snackbar
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>("error");

  // ✅ Ma'lumotlarni API dan yuklash
  useEffect(() => {
    async function fetchProfile() {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setAlertMessage("Autentifikatsiya uchun token topilmadi. Iltimos, qayta kiring.");
        setAlertSeverity("warning");
        setAlertOpen(true);
        // Token bo'lmasa, login sahifasiga yo'naltirish
        setTimeout(() => router.replace("/login"), 1500);
        return;
      }

      try {
        const response = await axios.get(
          "https://faxriddin.bobur-dev.uz/profile/my/profile",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data.succase) {
          setProfileData(response.data.data);
        } else {
          throw new Error(response.data.message || "Profil ma'lumotlarini yuklashda xato.");
        }
      } catch (err) {
        const error = err as unknown as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const errMessage =
          error.response?.data?.message || error.message || "Profil ma'lumotlarini yuklashda kutilmagan xatolik.";
        
        setAlertMessage(errMessage);
        setAlertSeverity("error");
        setAlertOpen(true);
        // Token muddati o'tgan bo'lsa, login sahifasiga yo'naltirish
        setTimeout(() => router.replace("/login"), 3000);
        
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  // Yuklanish holati
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-teal-600 dark:text-teal-400">Ma&apos;lumotlar yuklanmoqda...</div>
      </div>
    );
  }

  // Ma'lumotlar bo'lmasa, qayta urinishni so'rash
  if (!profileData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-red-600 dark:text-red-400">
          Profil ma&apos;lumotlari topilmadi.
        </div>
      </div>
    );
  }

  // ✅ Profil avatari (rasm yo'q bo'lsa, bosh harflar)
  const getAvatarContent = () => {
    if (profileData.profileImg && !profileData.profileImg.includes("null")) {
      return (
        <img
          src={profileData.profileImg}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      );
    }
    // Bosh harflarni olish
    const firstInitial = profileData.firstName[0] || "";
    const lastInitial = profileData.lastName[0] || "";

    return (
      <div className="text-4xl font-bold text-white">
        {firstInitial.toUpperCase()}{lastInitial.toUpperCase()}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-10">
        <h1 className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mb-8 text-center border-b pb-4">
          Shaxsiy Profil
        </h1>

        {/* Profil Bosh Qismi: Avatar va Asosiy Ma'lumotlar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b pb-8 mb-8">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full bg-teal-500 dark:bg-teal-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
            {getAvatarContent()}
          </div>

          {/* Ma'lumotlar */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className={`text-sm font-medium mt-1 inline-flex items-center px-3 py-1 rounded-full ${profileData.role === 'SUPERADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                <LockIcon className="w-4 h-4 mr-1" />
                {profileData.role}
            </p>
            
            <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
              <p className="flex items-center">
                <EmailIcon className="w-5 h-5 mr-2 text-teal-500" />
                <span className="font-semibold">Email:</span> {profileData.email}
              </p>
              <p className="flex items-center">
                <CalendarTodayIcon className="w-5 h-5 mr-2 text-teal-500" />
                <span className="font-semibold">Yoshi:</span> {profileData.age} yosh
              </p>
              <p className="flex items-center">
                <BadgeIcon className="w-5 h-5 mr-2 text-teal-500" />
                <span className="font-semibold">Ro&apos;yxatdan o&apos;tgan:</span> {formatDate(profileData.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Qurilmalar va Hisob-kitoblar */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Qurilmalar (Devices) */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center border-b pb-2">
              <DevicesIcon className="w-6 h-6 mr-2 text-teal-500" />
              Faol Qurilmalar ({profileData._count.devices})
            </h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {profileData.devices.map((device, index) => (
                <div
                  key={device.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {device.name || "Noma'lum Qurilma"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    IP: {device.address}
                  </p>
                  <p className="text-xs text-teal-500 dark:text-teal-400 mt-1">
                    Kirish vaqti: {formatDate(device.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hisob-kitoblar */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center border-b pb-2">
              <AccountCircleIcon className="w-6 h-6 mr-2 text-teal-500" />
              Faoliyat Statistikasi
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 dark:bg-teal-900 rounded-lg shadow-md flex justify-between items-center">
                <span className="font-medium text-teal-800 dark:text-teal-200">
                  Uchrashuvlar soni (Foydalanuvchi sifatida):
                </span>
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {profileData._count.meetingsAsUser}
                </span>
              </div>
              {/* Qo'shimcha statistikalarni shu yerga qo'shishingiz mumkin */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md flex justify-between items-center">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Umumiy Faol Qurilmalar:
                </span>
                <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {profileData._count.devices}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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