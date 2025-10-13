"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UseUserStore";

// Sliderni faqat client-side render qilish
const Slider = dynamic(() => import("react-slick"), { ssr: false });

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface DoctorProfile {
  bio: string;
  images: string[];
  category: { name: string; img?: string };
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profileImg?: string;
  doctorProfile?: DoctorProfile;
}

interface DoctorsResponse {
  data: Doctor[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const FullTeachers: React.FC = () => {
  const { isDark } = useUserStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const limit = 10;

  const fetchDoctors = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get<DoctorsResponse>(
        `https://faxriddin.bobur-dev.uz/User/doctors/All?limit=${limit}&page=${pageNumber}`
      );
      setDoctors(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.error("Doctorlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box
    sx={{
      display: "grid",
      gap: 3,
      gridTemplateColumns: {
        xs: "1fr", // telefon
        sm: "repeat(2, 1fr)", // planshet
        md: "repeat(3, 1fr)", // kompyuter
      },
    }}
  >
    {doctors.map((doctor) => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`;
      const bio = doctor.doctorProfile?.bio || "Ma'lumot mavjud emas";
      const category = doctor.doctorProfile?.category?.name || "Shifokor";
      
      const img = doctor.profileImg
        ? doctor.profileImg
        : "./img/user.png";

        console.log(img);
        
  
      return (
        <Box key={doctor.id} sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
        <Card
          sx={{
            borderRadius: "20px",
            overflow: "hidden",
            cursor: "pointer",
            transition: "transform 0.3s, box-shadow 0.3s",
            bgcolor: isDark ? "#120C0B" : "#fff",
            color: isDark ? "#fff" : "#000",
            boxShadow: isDark
              ? "0 6px 12px rgba(0,0,0,0.5)"
              : "0 6px 12px rgba(0,0,0,0.1)",
            "&:hover": { transform: "translateY(-5px)" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CardMedia
            component="img"
            image={img }
            alt={fullName}
            sx={{
              width: "100%",
              height: 320,
              objectFit: "cover",
              filter: isDark ? "brightness(0.9)" : "none",
            }}
          />
      
          <CardContent sx={{ textAlign: "center", pt: 2, pb: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {fullName}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                display: "inline-block",
                px: 1.5,
                py: 0.5,
                borderRadius: "12px",
                fontWeight: 500,
                color: isDark ? "#ccc" : "#555",
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              {category}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: isDark ? "#ddd" : "#333" }}
              noWrap
            >
              {doctor.doctorProfile?.bio || "Ma'lumot mavjud emas"}
            </Typography>
      
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 2 }}
              onClick={() => router.push(`/doctors/about/${doctor.id}`)}  
            >
              Batafsil
            </Button>
          </CardContent>
        </Card>
      </Box>
      
      );
    })}
  </Box>
  
  );
};

export default FullTeachers;
