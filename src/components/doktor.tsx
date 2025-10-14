"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Avatar,
  Stack,
  useTheme,
} from "@mui/material";

import { Info, MessageSquare, Briefcase, DollarSign } from "lucide-react";
import { useUserStore } from "@/store/UseUserStore";
import Chat_Doctor from "./chat-doktor";

interface Salary {
  monthly: number;
}

interface DoctorProfile {
  bio: string;
  images: string[];
  category: { name: string; img?: string };
  salary?: Salary[];
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

const formatSalary = (salary: number | string | undefined): string => {
  const numericSalary = typeof salary === "string" ? parseFloat(salary) : salary;
  if (!numericSalary || isNaN(numericSalary)) return "Aniqlanmagan";
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  })
    .format(numericSalary)
    .replace(/\sUZS$/, " UZS");
};

const FullDoctors: React.FC = () => {
  const { isDark, SetDoctorId } = useUserStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null); // 🔹 Chatga o‘tish uchun
  const theme = useTheme();
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
    fetchDoctors(page);
  }, [page]);

  const cardStyles = {
    borderRadius: "16px",
    boxShadow: isDark ? "0 8px 20px rgba(0,0,0,0.4)" : "0 8px 20px rgba(0,0,0,0.12)",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: isDark
        ? "0 12px 25px rgba(0,0,0,0.6)"
        : "0 12px 25px rgba(0,0,0,0.2)",
    },
    bgcolor: isDark ? "#1f2937" : "#fff",
    color: isDark ? "#e5e7eb" : "#1f2937",
    display: "flex",
    flexDirection: "column",
  };

  const primaryColor = theme.palette.primary.main || "#1976d2";
  const successColor = theme.palette.success.main || "#28a745";

  // 🔹 Agar chat ochilgan bo‘lsa, faqat Chat_Doctor ni chiqaramiz
  if (selectedDoctorId) {
    return (
      <Chat_Doctor
        doctorId={selectedDoctorId}
        onClose={() => setSelectedDoctorId(null)}
      />
    );
  }

  return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: isDark ? "#111827" : "#f3f4f6" }}>
      <Typography
        variant="h3"
        align="center"
        sx={{
          mb: 6,
          color: primaryColor,
          fontWeight: "bold",
          textShadow: isDark ? "1px 1px 3px rgba(0,0,0,0.5)" : "none",
        }}
      >
        Mutaxassis Shifokorlar
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" sx={{ ml: 2, color: isDark ? "#fff" : "#333" }}>
            Yuklanmoqda...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {doctors.map((doctor) => {
            const fullName = `${doctor.firstName} ${doctor.lastName}`;
            const category = doctor.doctorProfile?.category?.name || "Shifokor";
            const bioText = doctor.doctorProfile?.bio;
            const salary = doctor.doctorProfile?.salary?.[0]?.monthly;
            const profileImage = doctor.profileImg || "/img/user.png";

            return (
              <div key={doctor.id} style={{ width: "100%", maxWidth: 360, margin: 16 }}>
                <Card sx={cardStyles}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    p={3}
                    alignItems={{ xs: "center", sm: "flex-start" }}
                  >
                    <Avatar
                      alt={fullName}
                      src={profileImage}
                      sx={{
                        width: 100,
                        height: 100,
                        border: `4px solid ${primaryColor}`,
                      }}
                    />

                    <CardContent sx={{ p: 0, flexGrow: 1, textAlign: { xs: "center", sm: "left" } }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: primaryColor }}>
                        {fullName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", alignItems: "center", mt: 0.5, color: isDark ? "#ccc" : "#555" }}
                      >
                        <Briefcase size={16} style={{ marginRight: 5, color: successColor }} />
                        Mutaxassis:{" "}
                        <Box component="span" fontWeight="bold" ml={0.5}>
                          {category}
                        </Box>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", alignItems: "center", mt: 0.5, color: isDark ? "#ddd" : "#333" }}
                      >
                        <DollarSign size={16} style={{ marginRight: 5, color: successColor }} />
                        Oylik:{" "}
                        <Box
                          component="span"
                          fontWeight="bold"
                          ml={0.5}
                          sx={{ color: successColor }}
                        >
                          {formatSalary(salary)}
                        </Box>
                      </Typography>

                      {bioText && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1,
                            color: isDark ? "#bbb" : "#666",
                            fontStyle: "italic",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {bioText}
                        </Typography>
                      )}
                    </CardContent>
                  </Stack>

                  <Stack direction="row" spacing={1.5} sx={{ p: 3, pt: 0, borderTop: `1px solid ${isDark ? "#333" : "#eee"}` }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Info size={18} />}
                      sx={{
                        bgcolor: primaryColor,
                        "&:hover": { bgcolor: "#0056b3" },
                        py: 1.2,
                        borderRadius: "10px",
                      }}
                      onClick={() => alert("Batafsil sahifasi hali tayyor emas")}
                    >
                      Batafsil
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<MessageSquare size={18} />}
                      sx={{
                        bgcolor: successColor,
                        "&:hover": { bgcolor: "#1e7e34" },
                        py: 1.2,
                        borderRadius: "10px",
                      }}
                      onClick={() => {
                        SetDoctorId(doctor.id);
                        setSelectedDoctorId(doctor.id); // 🔹 FullDoctors o‘rniga Chat_Doctor chiqadi
                      }}
                    >
                      Suhbat
                    </Button>
                  </Stack>
                </Card>
              </div>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default FullDoctors;
