"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useUserStore } from "@/store/UseUserStore";
import Header from "@/pages/Header";
import Footer from "@/pages/Footer";

interface DoctorSalary {
  id?: string;
  doctorId?: string;
  free?: boolean;
  daily?: string;
  weekly?: string;
  monthly?: string;
  yearly?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DoctorProfile {
  bio: string;
  images: string[];
  videos?: string[];
  files?: string[];
  category: { name: string; img?: string };
  futures?: string[];
  salary?: DoctorSalary[];
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg: string;
  doctorProfile?: DoctorProfile;
}

const BASE_URL = "https://faxriddin.bobur-dev.uz"

const formatPrice = (priceString?: string) => {
  if (!priceString) return "Ko‘rsatilmagan";
  const num = parseInt(priceString);
  if (isNaN(num)) return "Ko‘rsatilmagan";
  return new Intl.NumberFormat("uz-UZ").format(num);
};

const DoctorDetailPage: React.FC = () => {
  const { isDark } = useUserStore();
  const router = useRouter();
  const params = useParams();
  const doctorId = params?.id;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return router.push("/");
    setLoading(true);
    axios
      .get(`${BASE_URL}/User/doctorOne/${doctorId}`)
      .then((res) => setDoctor(res.data.data))
      .catch((err) => {
        console.error("Xato:", err);
        router.push("/");
      })
      .finally(() => setLoading(false));

      console.log(doctor);
  }, [doctorId]);

  if (loading)
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: isDark ? "#0b1321" : "#f9f9f9",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (!doctor) return null;

  const profile = doctor.doctorProfile;
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const fullName = `${doctor.firstName} ${doctor.lastName}`;
  const category = profile?.category?.name || "Shifokor";
  const images = Array.isArray(profile?.images)
  ? profile.images.map((p) => `${BASE_URL}/${p}`)
  : [];

  const videos = Array.isArray(profile?.videos)
  ? profile.videos.map((p) => `${BASE_URL}/${p}`)
  : [];

  const futures = profile?.futures || [];
  const salary = profile?.salary?.[0];

  return (
    <Box sx={{ bgcolor: isDark ? "#0b1321" : "#fff", color: isDark ? "#fff" : "#000" }}>
      {/* <Header /> */}

      {/* Orqaga tugma */}
      <Box sx={{ px: 4, pt: 7, maxWidth: 1200, mx: "auto" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            color: isDark ? "#60a5fa" : "#2563eb",
            fontWeight: 600,
            mb: 4,
          }}
        >
          Orqaga
        </Button>
      </Box>

      {/* Asosiy kontent */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 5,
          maxWidth: 1200,
          mx: "auto",
          px: 4,
          pb: 6,
        }}
      >
        {/* Chap tomonda rasm */}
        <div
          style={{
            flex: 1.3,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: isDark
              ? "0 10px 30px rgba(0,0,0,0.6)"
              : "0 6px 18px rgba(0,0,0,0.15)",
          }}
        >
          <img
            src={doctor.profileImg || "/img/user.png"}
            alt={fullName}
            style={{
              width: "100%",
              height: "420px",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* O‘ng tomonda ma’lumotlar */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: isDark ? "#60a5fa" : "#1d4ed8", mb: 1 }}
          >
            {fullName}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              display: "inline-block",
              px: 2,
              py: 0.5,
              borderRadius: "10px",
              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6",
              color: isDark ? "#d1d5db" : "#374151",
              mb: 2,
            }}
          >
            {category}
          </Typography>

          <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
            {profile?.bio || "Ma’lumot mavjud emas"}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Email:</strong> {doctor.email}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Kunlik narx:</strong> {formatPrice(salary?.daily)} so‘m
          </Typography>
          <Typography variant="body2">
            <strong>Oylik narx:</strong> {formatPrice(salary?.monthly)} so‘m
          </Typography>
        </Box>
      </Box>

      {/* Qo‘shimcha ma’lumotlar */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 4, py: 6 }}>
        {futures.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: isDark ? "#60a5fa" : "#1d4ed8", mb: 2 }}
            >
              Qo‘shimcha ma’lumotlar
            </Typography>
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              {futures.map((f, i) => (
                <li key={i}>
                  <Typography variant="body1" sx={{ py: 0.5 }}>
                    {f}
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}

        {/* Rasmlar */}
        {images.length > 0 && (
  <Box sx={{ mb: 5 }}>
    <Typography
      variant="h5"
      fontWeight="bold"
      sx={{ color: isDark ? "#60a5fa" : "#1d4ed8", mb: 2 }}
    >
      Doktor Rasmlari
    </Typography>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
        gap: "20px",
      }}
    >
      {images.map((url, i) => (
        <div
          key={i}
          className="w-1/2 max-[760px]:w-full"
          style={{
            borderRadius: "12px",
            overflow: "hidden",

            boxShadow: isDark
              ? "0 4px 12px rgba(0,0,0,0.4)"
              : "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease",
          }}
        >
          <img
            src={url}
            alt={`rasm-${i}`}
            style={{
              width: "100%",
              height: "280px", 
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      ))}
    </div>
  </Box>
)}

{/* 🔸 Videolar */}
{videos.length > 0 && (
  <Box sx={{ mb: 5 }}>
    <Typography
      variant="h5"
      fontWeight="bold"
      sx={{ color: isDark ? "#60a5fa" : "#1d4ed8", mb: 2 }}
    >
      Videolar
    </Typography>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
      }}
    >
      {videos.map((v, i) => (
        <div
          key={i}
          className="w-1/2 max-[760px]:w-full"

            style={{
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: isDark
              ? "0 4px 12px rgba(0,0,0,0.4)"
              : "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease",
          }}
        >
          <video
      controls
      style={{
        width: "100%",
        height: "280px", // 🔹 rasmlar bilan bir xil
        objectFit: "cover",
        borderRadius: "8px",
        background: "#000",
      }}
    >
      <source src={v} type="video/mp4" />
      Brauzer videoni qo‘llamaydi.
    </video>
        </div>
      ))}
    </div>
  </Box>
)}


        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#2563eb",
            borderRadius: "12px",
            px: 4,
            py: 1.5,
            fontSize: "16px",
            fontWeight: 600,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
          onClick={() => router.push("/doctor/profile/about")}
        >
          Shifokor bilan suhbatlashish
        </Button>
      </Box>

      <Footer />
    </Box>
  );
};

export default DoctorDetailPage;
