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
import Slider from "react-slick";
import { useRouter } from "next/navigation";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useUserStore } from "@/store/UseUserStore";
import Header from "@/pages/Header";
import Footer from "@/pages/Footer";

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

const Home: React.FC = () => {
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
    <Box sx={{ bgcolor: isDark ? "#0b1321" : "#fff", color: isDark ? "#fff" : "#000" }}>
      <Header />

      {/* Biz haqimizda */}
      <Box
        sx={{
          py: 20,
          pt: 32,
          px: 4,
          background: isDark
            ? "#0b1321"
            : "linear-gradient(to bottom, #fff, #f2f2f2)",
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 10,
            alignItems: "center",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
              ShifoYoli: Sog'ligingizga E'tiborli Yo'l
            </Typography>
            <Typography sx={{ fontSize: "1.125rem", opacity: 0.9 }}>
              ShifoYoli kompaniyasi bemorlarga qulay va tezkor tibbiy xizmatlarni taqdim etish
              maqsadida tashkil etilgan. Bizning asosiy faoliyatimiz: Yuqori malakali doktorlarni
              topish, onlayn konsultatsiyalar va sog'liqni saqlash sohasida innovatsion yechimlar.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <img
              src="./img/home.jpg"
              alt="Tibbiy xizmatlar"
              style={{ width: "100%", borderRadius: 16, boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}
            />
          </Box>
        </Box>
      </Box>

      {/* Tajribali Doktorlar */}
      <Box sx={{ py: 16, px: 4 }}>
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          color="primary"
          sx={{ mb: 4 }}
        >
          Bizning Tajribali Doktorlarimiz
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Slider {...sliderSettings}>
            {doctors.map((doctor) => {
              const fullName = `${doctor.firstName} ${doctor.lastName}`;
              const bio = doctor.doctorProfile?.bio || "Ma'lumot mavjud emas";
              const category = doctor.doctorProfile?.category?.name || "Shifokor";
              const img = doctor.profileImg
                ? doctor.profileImg
                : doctor.doctorProfile?.images?.[0]
                ? `https://faxriddin.bobur-dev.uz/${doctor.doctorProfile.images[0]}`
                : "https://via.placeholder.com/400x400";

              return (
                <Box key={doctor.id} px={1}>
                  <Card
                    sx={{
                      borderRadius: "20px",
                      overflow: "hidden",
                      position: "relative",
                      transition: "0.3s",
                      maxWidth: 425,
                      mx: "auto",
                      bgcolor: isDark ? "#120C0B" : "#fff",
                      color: isDark ? "#fff" : "#000",
                      boxShadow: isDark
                        ? "0 6px 12px rgba(0,0,0,0.5)"
                        : "0 6px 12px rgba(0,0,0,0.1)",
                      "&:hover .hoverBox": { opacity: 1 },
                      cursor: "pointer",
                    }}
                    onClick={() => router.push(`/doctors/about/${doctor.id}`)}
                  >
                    <CardMedia
                      component="img"
                      image={img}
                      alt={fullName}
                      sx={{ height: 320, objectFit: "cover", filter: isDark ? "brightness(0.9)" : "none" }}
                    />
                    <CardContent sx={{ textAlign: "center", pt: 2, pb: 3 }}>
                      <Typography variant="h6" fontWeight="bold">
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
                    </CardContent>

                    <Box
                      className="hoverBox"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: "rgba(0,0,0,0.75)",
                        color: "white",
                        p: 2,
                        opacity: 0,
                        transition: "opacity 0.3s ease-in-out",
                        borderRadius: "0 0 20px 20px",
                        minHeight: 80,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2" gutterBottom noWrap>
                        {bio}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ mt: 1, alignSelf: "flex-start" }}
                        onClick={() => router.push(`/doctors/about/${doctor.id}`)}
                      >
                        Batafsil
                      </Button>
                    </Box>
                  </Card>
                </Box>
              );
            })}
          </Slider>
        )}

        {page < totalPages && !loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Button variant="contained" color="primary" onClick={() => fetchDoctors(page + 1)}>
              Ko‘proq ko‘rish
            </Button>
          </Box>
        )}
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
