"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UseUserStore";
import Header from "@/pages/Header";
import Footer from "@/pages/Footer";
import FullTeachers from "@/components/full-teachers";

interface DoctorProfile {
  bio: string;
  images: string[];
  category: { name: string; img?: string };
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profileImg: string;
  doctorProfile?: DoctorProfile;
}

interface DoctorsResponse {
  data: Doctor[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const Base_url = "https://faxriddin.bobur-dev.uz"


const Home: React.FC = () => {
  const { isDark } = useUserStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchDoctors = async (limitValue = 10) => {
    setLoading(true);
    try {
      const res = await axios.get<DoctorsResponse>(
        `${Base_url}/User/doctors/All?limit=${limitValue}&page=1`
      );
      setDoctors(res.data.data);
      setTotal(res.data.meta.total);
    } catch (err) {
      console.error("Doktorlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(limit);
  }, [limit]);

  const handleShowMore = () => {
    setLimit((prev) => prev + 10);
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? "#0b1321" : "#fff",
        color: isDark ? "#fff" : "#000",
      }}
    >
      <Header />


      <section className={`pt-[100px] ${isDark ? "bg-gray-900 text-white" : "bg-white text-black"} py-10 px-4`}>
      <FullTeachers/>
    </section>

      <Footer />

     
    </div>
  );
};

export default Home;
