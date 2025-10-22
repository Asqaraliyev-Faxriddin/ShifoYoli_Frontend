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
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UseUserStore";

interface Category {
  id: string;
  name: string;
}

interface DoctorProfile {
  bio: string;
  images: string[];
  category: { id: string; name: string; img?: string };
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

interface Limit2 {
  limit:number,
  page:number,
  categoryId?:string;
}

const FullTeachers: React.FC = () => {
  const { isDark } = useUserStore();
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const Base_url = "https://faxriddin.bobur-dev.uz";
  const limit = 10;

  // 🔹 Kategoriyalarni olish
  // 🔹 Kategoriyalarni olish
const fetchCategories = async () => {
  try {
    const res = await axios.get(`${Base_url}/User/doctor-all/category`);
    console.log(res.data);

    // `res.data` obyektni massivga aylantiramiz
    const cats = Object.values(res.data).filter(
      (item): item is Category =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "name" in item
    );

    setCategories(cats);
  } catch (err) {
    console.error("Kategoriyalarni olishda xatolik:", err);
  }
};

  

  // 🔹 Doktorlarni olish
  const fetchDoctors = async (pageNumber = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params:Limit2  = {
        limit,
        page: pageNumber,
      };
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await axios.get<DoctorsResponse>(
        `${Base_url}/User/doctors/All`,
        { params }
      );

      if (append) {
        setDoctors((prev) => [...prev, ...res.data.data]);
      } else {
        setDoctors(res.data.data);
      }

      setTotalPages(res.data.meta.totalPages);
      setPage(pageNumber);
    } catch (err) {
      console.error("Doctorlarni yuklashda xatolik:", err);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  };

  // 🔹 Boshlang‘ich yuklash
  useEffect(() => {
    fetchCategories();
    fetchDoctors(1);
  }, []);

  // 🔹 Kategoriya o‘zgarsa qayta yuklash
  useEffect(() => {
    fetchDoctors(1);
  }, [selectedCategory]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchDoctors(page + 1, true);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 4,
        minHeight: "100vh",
        background: isDark
          ? "#111827"
          : "#fff",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        mb={4}
        color={isDark ? "#fff" : "#0d1b4c"}
      >
        Bizning Tajribali Doktorlarimiz
      </Typography>

      {/* 🔹 Kategoriyalar */}
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={2}
        justifyContent="center"
        mb={5}
      >
        <Button
          variant={!selectedCategory ? "contained" : "outlined"}
          sx={{
            backgroundColor: !selectedCategory ? "#0d47a1" : "transparent",
            color: !selectedCategory ? "#fff" : "#0d47a1",
            borderColor: "#0d47a1",
            "&:hover": {
              backgroundColor: "#0b3d91",
              color: "#fff",
            },
            borderRadius: "20px",
            textTransform: "none",
            px: 2.5,
          }}
          onClick={() => setSelectedCategory(null)}
        >
          Barchasi
        </Button>

        {  categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "contained" : "outlined"}
            sx={{
              backgroundColor: selectedCategory === cat.id ? "#0d47a1" : "transparent",
              color: selectedCategory === cat.id ? "#fff" : "#0d47a1",
              borderColor: "#0d47a1",
              "&:hover": {
                backgroundColor: "#0b3d91",
                color: "#fff",
              },
              borderRadius: "20px",
              textTransform: "none",
              px: 2.5,
            }}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </Stack>

      {/* 🔹 Yuklanish holati */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : doctors.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          Doktorlar topilmadi.
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
            }}
          >
            {doctors.map((doctor) => {
              const fullName = `${doctor.firstName} ${doctor.lastName}`;
              const category =
                doctor.doctorProfile?.category?.name || "Shifokor";
              const bio = doctor.doctorProfile?.bio || "Ma'lumot mavjud emas";
              const img = doctor.profileImg
                ? doctor.profileImg
                : "/img/user.png";

              return (
                <Card
                  key={doctor.id}
                  onClick={() => router.push(`/doctors/about/${doctor.id}`)}
                  sx={{
                    borderRadius: "18px",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: isDark
                      ? "#000"
                      : "#fff",
                    color: isDark ? "#fff" : "#000",
                    boxShadow: isDark
                      ? "0 8px 16px rgba(0,0,0,0.5)"
                      : "0 8px 16px rgba(13,71,161,0.15)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: isDark
                        ? "0 10px 20px rgba(0,0,0,0.7)"
                        : "0 10px 20px rgba(13,71,161,0.25)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={img}
                    alt={fullName}
                    sx={{
                      width: "100%",
                      height: 260,
                      objectFit: "cover",
                      filter: isDark ? "brightness(0.9)" : "none",
                    }}
                  />

                  <CardContent sx={{ textAlign: "center", p: 2.5 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {fullName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        display: "inline-block",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "12px",
                        fontWeight: 600,
                        color: "#0d47a1",
                        backgroundColor: "rgba(13,71,161,0.1)",
                      }}
                    >
                      {category}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1.5,
                        color: isDark ? "#ddd" : "#333",
                      }}
                      noWrap
                    >
                      {bio}
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        mt: 2,
                        backgroundColor: "#0d47a1",
                        "&:hover": { backgroundColor: "#0b3d91" },
                        textTransform: "none",
                        borderRadius: "12px",
                        px: 3,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/doctors/about/${doctor.id}`);
                      }}
                    >
                      Batafsil
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* 🔹 “Ko‘proq ko‘rish” tugmasi */}
          {page < totalPages && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#0d47a1",
                  "&:hover": { backgroundColor: "#0b3d91" },
                  textTransform: "none",
                  px: 4,
                  py: 1,
                  borderRadius: "30px",
                  fontWeight: 600,
                }}
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Yuklanmoqda..." : "Ko‘proq ko‘rish"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default FullTeachers;
