"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Header from "@/pages/Header";
import Footer from "@/pages/Footer";

const BASE_URL = "https://faxriddin.bobur-dev.uz";

interface PatientProfile {
  bio?: string;
  age?: number;
  month?: number;
  phoneNumber?: string;
  profileImg?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

const PatientDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id;
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    if (!patientId) return router.push("/");

    const token = localStorage.getItem("accessToken") || "";
    setLoading(true);

    axios
      .get(`${BASE_URL}/doctor-profile/doctor/patient/profile/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPatient(res.data.data);
      })
      .catch((err) => {
        const status = err?.response?.status;
        setErrorStatus(status || 500);
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1321] text-gray-600 dark:text-gray-200">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Maʼlumot yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // ❌ Agar xato bo‘lsa (404, 403, 400)
  if (errorStatus === 404 || errorStatus === 400 || errorStatus === 403 || !patient ||  errorStatus === 401 ) {
    return (
      <div className="relative min-h-screen bg-gray-900/90 backdrop-blur-md flex items-center justify-center flex-col text-center">
        <h2 className="text-white text-2xl font-semibold mb-3">
          Bemor topilmadi yoki kirish ruxsati yo‘q.
        </h2>
        <button
          onClick={() => router.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md"
        >
          🔙 Orqaga qaytish
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Maʼlumot topilmadi.</p>
      </div>
    );
  }

  const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
  const profileImg = patient.profileImg
    ? `${BASE_URL}/${patient.profileImg}`
    : "/img/user.png";

  return (
    <div className="bg-gray-50 dark:bg-[#0b1321] min-h-screen text-gray-900 dark:text-gray-200 mt-[70px]">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-24">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-all hover:cursor-pointer"
        >
          <span>⬅</span> Orqaga
        </button>

        <div className="flex flex-col md:flex-row gap-10 items-start bg-white dark:bg-[#111827] shadow-lg rounded-2xl p-6">
          {/* Profil rasmi */}
          <div className="flex-1 flex justify-center">
            <img
              src={profileImg}
              alt={fullName}
              className="w-72 h-72 rounded-2xl object-cover border-4 border-blue-600 shadow-md"
            />
          </div>

          {/* Asosiy ma’lumotlar */}
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-bold text-blue-600">{fullName}</h1>

            <div className="text-gray-600 dark:text-gray-400 text-base space-y-1">
              <p>
                <strong>Email:</strong> {patient.email || "Ko‘rsatilmagan"}
              </p>
              <p>
                <strong>Telefon:</strong> {patient.phoneNumber || "Ko‘rsatilmagan"}
              </p>
              <p>
                <strong>Yoshi:</strong> {patient.age ? `${patient.age} yosh` : "Ko‘rsatilmagan"}
              </p>
          
              <p>
                <strong>Qo‘shilgan sana:</strong>{" "}
                {patient.createdAt
                  ? new Date(patient.createdAt).toLocaleDateString("uz-UZ")
                  : "Noma’lum"}
              </p>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PatientDetailPage;
