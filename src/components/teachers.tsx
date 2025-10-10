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
  Grid,
} from "@mui/material";
import { useRouter } from "next/navigation";
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
      .then((res) => setDoctors(res.data.slice(0, 10) || [])) // faqat 10 ta shifokor
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
    <Box sx={{ py: 10, px: { xs: 2, md: 6 }, bgcolor: isDark ? "#0b1321" : "#fff" }}>
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 6, color: isDark ? "#60a5fa" : "primary.main" }}
      >
        Eng zo‘r Shifokorlar
      </Typography>

      <Grid container spacing={3}>
  {doctors.map((doctor) => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`;
    const category = doctor.doctorProfile?.category?.name || "Shifokor";
    const salary = doctor.doctorProfile?.salary?.[0]?.monthly || "Noma'lum";
    const img =   doctor.profileImg || "./img/user.png"


    return (
      <div
  key={doctor.id}
  style={{
    flex: "1 1 calc(33.333% - 16px)", // 3 ta ustun, bo'sh joylarni hisobga olgan
    margin: "8px", // Grid spacing o‘rniga
  }}
>
  <Card
    sx={{
      borderRadius: "20px",
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform 0.3s, boxShadow 0.3s",
      bgcolor: isDark ? "#120C0B" : "#fff",
      color: isDark ? "#fff" : "#000",
      boxShadow: isDark
        ? "0 6px 12px rgba(0,0,0,0.5)"
        : "0 6px 12px rgba(0,0,0,0.1)",
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

    <CardContent sx={{ textAlign: "center", p: 2 }}>
      <Typography variant="h6" fontWeight="bold">
        {fullName}
      </Typography>

      <Typography
        sx={{
          display: "inline-block",
          px: 2,
          py: 0.5,
          my: 1,
          borderRadius: "12px",
          fontWeight: 500,
          fontSize: 12,
          color: isDark ? "#ccc" : "#555",
          backgroundColor: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)",
        }}
      >
        {category}
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          Oylik: {salary} so‘m
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/doctors/about/${doctor.id}`);
          }}
        >
          Batafsil
        </Button>
      </Box>
    </CardContent>
  </Card>
</div>

    );
  })}
</Grid>

    </Box>
  );
};

export default TopDoctors;
