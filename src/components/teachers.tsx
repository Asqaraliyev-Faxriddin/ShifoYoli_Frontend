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
} from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useUserStore } from "@/store/UseUserStore";

interface DoctorProfile {
  bio: string;
  images: string[];
  category: { name: string };
  salary: { daily?: string; weekly?: string; monthly?: string; yearly?: string }[];
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profileImg: string;
  doctorProfile?: DoctorProfile;
}

const TopDoctors: React.FC = () => {
  const { isDark } = useUserStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://faxriddin.bobur-dev.uz/User/top-doctors")
      .then((res) => setDoctors(res.data))
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
      <div
        className={`py-10 flex justify-center items-center min-h-[300px] ${
          isDark ? "bg-gray-900" : "bg-white"
        }`}
      >
        <CircularProgress color="primary" />
      </div>
    );
  }

  return (
    <div
      className={`py-10 px-4 md:px-8 ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        fontWeight="bold"
        color="primary"
        sx={{ mb: 4 }}
      >
        Eng zo‘r Shifokorlar
      </Typography>

      <Slider {...settings}>
        {doctors.map((doctor) => {
          const fullName = `${doctor.firstName} ${doctor.lastName}`;
          const category = doctor?.doctorProfile?.category?.name || "Shifokor";
          const bio = doctor?.doctorProfile?.bio || "Ma'lumot mavjud emas";
          const salary = doctor?.doctorProfile?.salary?.[0]?.monthly || "Noma'lum";
          const img = doctor?.profileImg
            ? doctor.profileImg
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
                  margin: "0 auto",
                  bgcolor: isDark ? "#120C0B" : "#fff",
                  color: isDark ? "#fff" : "#000",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                  "&:hover .hoverBox": { opacity: 1 },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: 373,
                    overflow: "hidden",
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px",
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    image={img}
                    alt={fullName}
                  />
                </Box>

                <CardContent sx={{ textAlign: "center", pt: 2, pb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {fullName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      color: isDark ? "#ccc" : "text.secondary",
                      display: "inline-block",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "12px",
                      fontWeight: 500,
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
                  }}
                >
                  <Typography variant="body2" gutterBottom noWrap>
                    {bio}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Oylik: {salary} so‘m
                  </Typography>
                </Box>
              </Card>
            </Box>
          );
        })}
      </Slider>
    </div>
  );
};

export default TopDoctors;
