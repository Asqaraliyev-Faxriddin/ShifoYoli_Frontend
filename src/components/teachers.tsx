"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useUserStore } from "@/store/UseUserStore";

interface DoctorProfile {
  bio: string;
  images: string[];
  category: { name: string };
  salary?: { monthly?: string }[];
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profileImg?: string;
  doctorProfile?: DoctorProfile;
}

const TopDoctors: React.FC = () => {
  const { isDark } = useUserStore();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Doctor[]>("https://faxriddin.bobur-dev.uz/User/top-doctors")
      .then((res) => setDoctors(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) {
    return (
      <Box
        sx={{
          py: 10,
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isDark ? "#0b1321" : "#fff",
        }}
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 10,
        px: { xs: 2, md: 6 },
        bgcolor: isDark ? "#0b1321" : "#fff",
        color: isDark ? "#f1f5f9" : "#111827",
      }}
      className="top-doctors-section"
    >
      {/* Slick style overrides */}
      <style jsx>{`
        .top-doctors-section :global(.slick-dots li button:before) {
          color: ${isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"};
          opacity: 1;
        }
        .top-doctors-section :global(.slick-dots li.slick-active button:before) {
          color: #3b82f6;
        }
        .top-doctors-section :global(.slick-prev),
        .top-doctors-section :global(.slick-next) {
          width: 36px;
          height: 36px;
          z-index: 4;
          background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"};
          border-radius: 999px;
        }
        .top-doctors-section :global(.slick-prev:before),
        .top-doctors-section :global(.slick-next:before) {
          color: ${isDark ? "#cbd5e1" : "#111827"};
          font-size: 18px;
        }
      `}</style>

      <Typography
        variant="h4"
        align="center"
        gutterBottom
        fontWeight="700"
        sx={{ mb: 4, color: isDark ? "#60a5fa" : "primary.main" }}
      >
        Eng zo‘r Shifokorlar
      </Typography>

      <Slider {...settings}>
        {doctors.map((doctor) => {
          const fullName = `${doctor.firstName} ${doctor.lastName}`;
          const category = doctor.doctorProfile?.category?.name || "Shifokor";
          const bio = doctor.doctorProfile?.bio || "Ma'lumot mavjud emas";
          const salary = doctor.doctorProfile?.salary?.[0]?.monthly || "Noma'lum";
          const img =
            doctor.profileImg && doctor.profileImg.length
              ? doctor.profileImg
              : doctor.doctorProfile?.images?.[0]
              ? `https://faxriddin.bobur-dev.uz/${doctor.doctorProfile.images[0]}`
              : "https://via.placeholder.com/800x800";

          return (
            <Box key={doctor.id} px={1} sx={{ py: 2 }}>
              <Card
                onClick={() => router.push(`/doctors/about/${doctor.id}`)}
                sx={{
                  borderRadius: "20px",
                  overflow: "visible",
                  position: "relative",
                  width: "100%",
                  maxWidth: 440,
                  mx: "auto",
                  transition: "transform .25s ease, box-shadow .25s ease",
                  bgcolor: isDark ? "#0f1724" : "#fff",
                  color: isDark ? "#f8fafc" : "#0f1720",
                  boxShadow: isDark
                    ? "0 10px 30px rgba(2,6,23,0.6)"
                    : "0 6px 18px rgba(13,38,59,0.06)",
                  "&:hover": { transform: "translateY(-6px)" },
                  "&:hover .hoverBox": { opacity: 1, transform: "translateY(0)" },
                }}
              >
                {/* Image */}
                <Box
                  sx={{
                    width: "100%",
                    height: 360,
                    overflow: "hidden",
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px",
                    position: "relative",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={img}
                    alt={fullName}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>

                {/* Rounded bottom panel overlapping image (like screenshot) */}
                <Box
                  sx={{
                    mt: -6,
                    mx: 2,
                    borderRadius: "14px",
                    bgcolor: isDark ? "#08121a" : "#f8fafc",
                    px: 3,
                    py: 3,
                    boxShadow: isDark
                      ? "0 -8px 30px rgba(2,6,23,0.5) inset"
                      : "none",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {fullName}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Box
                      sx={{
                        px: 1.8,
                        py: 0.5,
                        borderRadius: "999px",
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                        color: isDark ? "#cbd5e1" : "#374151",
                      }}
                    >
                      {category}
                    </Box>
                  </Box>
                </Box>

                {/* hover overlay (hidden by default) */}
                <Box
                  className="hoverBox"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    p: 3,
                    bgcolor: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)",
                    opacity: 0,
                    transform: "translateY(6px)",
                    transition: "opacity 0.25s ease, transform 0.25s ease",
                    borderRadius: "20px",
                    color: "#fff",
                    pointerEvents: "none", // keep click to card
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                    {bio}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        backgroundColor: "#3b82f6",
                        "&:hover": { backgroundColor: "#2563eb" },
                        pointerEvents: "auto",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/doctors/about/${doctor.id}`);
                      }}
                    >
                      Batafsil
                    </Button>
                    <Box sx={{ ml: "auto", color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>
                      Oylik: {salary} so‘m
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Box>
          );
        })}
      </Slider>
    </Box>
  );
};

export default TopDoctors;

