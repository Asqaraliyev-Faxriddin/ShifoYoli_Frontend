"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
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

  const sliderSettings = {
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
          justifyContent: "center",
          alignItems: "center",
          bgcolor: isDark ? "#0b1321" : "#fff",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 10, px: { xs: 2, md: 6 }, bgcolor: isDark ? "bg-gray-900" : "#fff" }}>
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 6, color: isDark ? "#60a5fa" : "primary.main" }}
      >
        Eng zo‘r Shifokorlar
      </Typography>

      <Slider {...sliderSettings}>
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
              : "https://via.placeholder.com/400x400";

          return (
            <Box key={doctor.id} px={1}>
              <Card
                sx={{
                  position: "relative",
                  maxWidth: 420,
                  mx: "auto",
                  borderRadius: "20px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "0.3s",
                  bgcolor: isDark ? "#120C0B" : "#fff",
                  color: isDark ? "#fff" : "#000",
                  boxShadow: isDark
                    ? "0 6px 12px rgba(0,0,0,0.5)"
                    : "0 6px 12px rgba(0,0,0,0.1)",
                  "&:hover .hoverBox": { opacity: 1 },
                  "&:hover": { transform: "translateY(-5px)" },
                }}
                onClick={() => router.push(`/doctors/about/${doctor.id}`)}
              >
                <CardMedia
                  component="img"
                  image={img}
                  alt={fullName}
                  sx={{
                    height: 320,
                    objectFit: "cover",
                    filter: isDark ? "brightness(0.9)" : "none",
                  }}
                />

                <CardContent sx={{ textAlign: "center", pt: 2, pb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {fullName}
                  </Typography>
                  <Typography
                    sx={{
                      display: "inline-block",
                      px: 2,
                      py: 0.5,
                      borderRadius: "12px",
                      fontWeight: 500,
                      fontSize: 12,
                      color: isDark ? "#ccc" : "#555",
                      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
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
                    color: "#fff",
                    p: 2,
                    opacity: 0,
                    transition: "opacity 0.3s ease-in-out",
                    borderRadius: "0 0 20px 20px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="body2" gutterBottom noWrap>
                    {bio}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/doctors/about/${doctor.id}`);
                      }}
                    >
                      Batafsil
                    </Button>
                    <Box sx={{ fontWeight: 700, mt: 1 }}>Oylik: {salary} so‘m</Box>
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
