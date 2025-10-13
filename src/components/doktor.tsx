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
  Avatar, // Rasm uchun Avatar komponenti ishlatiladi
  Stack, // Joylashuv uchun Stack komponenti
  useTheme, // Mavzuni olish uchun
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UseUserStore";
import { Info, MessageSquare, Briefcase, DollarSign, ChevronRight, ChevronLeft } from "lucide-react"; // Chiroyli iconlar

// --- Typing ---
// Salary maydoni uchun alohida interface
interface Salary {
  monthly: number;
}

interface DoctorProfile {
  bio: string;
  images: string[];
  category: { name: string; img?: string };
  // Salary massiv ko'rinishida kelishini hisobga oldik
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

// --- Format salary (Agar mavjud bo'lsa) ---
const formatSalary = (salary: number | string | undefined): string => {
  // salary ni raqamga aylantiramiz, agar bo'sh bo'lsa NaN bo'ladi
  const numericSalary = typeof salary === 'string' ? parseFloat(salary) : salary;
  
  if (!numericSalary || isNaN(numericSalary)) return "Aniqlanmagan";
  
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(numericSalary).replace(/\sUZS$/, " UZS");
};


const FullDoctors: React.FC = () => {
  const { isDark, SetDoctorId } = useUserStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const theme = useTheme();

  const router = useRouter();
  const limit = 10;
  
  // Chat ochish funksiyasi
  const handleChatClick = (id: string) => {
    SetDoctorId(id);
    router.push(`/doctors/chat/${id}`); // Chat sahifasiga yo'naltirish
  };

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
  
  // Dizayn uslublari
  const cardStyles = {
    borderRadius: "16px",
    boxShadow: isDark
      ? "0 8px 20px rgba(0,0,0,0.4)"
      : "0 8px 20px rgba(0,0,0,0.12)",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: isDark
        ? "0 12px 25px rgba(0,0,0,0.6)"
        : "0 12px 25px rgba(0,0,0,0.2)",
    },
    bgcolor: isDark ? "#1f2937" : "#fff",
    color: isDark ? "#e5e7eb" : "#1f2937",
    display: 'flex',
    flexDirection: 'column',
  };
  
  const primaryColor = theme.palette.primary.main || "#1976d2";
  const successColor = theme.palette.success.main || "#28a745";


  return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: isDark ? "#111827" : "#f3f4f6" }}>
      <Typography
        variant="h3"
        component="h1"
        align="center"
        fontWeight="extrabold"
        sx={{ mb: 6, color: primaryColor, textShadow: isDark ? '1px 1px 3px rgba(0,0,0,0.5)' : 'none' }}
      >
        Mutaxassis Shifokorlar
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" sx={{ ml: 2, color: isDark ? "#fff" : "#333" }}>Yuklanmoqda...</Typography>
        </Box>
      ) : doctors.length === 0 ? (
        <Typography variant="h5" align="center" color="textSecondary" py={10}>
          Hozircha shifokorlar topilmadi.
        </Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {doctors.map((doctor) => {
            const fullName = `${doctor.firstName} ${doctor.lastName}`;
            const bioText = doctor.doctorProfile?.bio;
            const category = doctor.doctorProfile?.category?.name || "Shifokor";
            const profileImage = doctor.profileImg || "/img/user.png";
            
            // Salary ma'lumotini xavfsiz olish
            // salary maydoni borligini, qator ekanligini va ichida element borligini tekshiramiz
            const salary = doctor.doctorProfile?.salary?.[0]?.monthly; 

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doctor.id} component="div">
                <Card sx={cardStyles}>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    p={3}
                    alignItems={{ xs: 'center', sm: 'flex-start' }}
                  >
                    {/* Rasm/Avatar */}
                    <Avatar
                      alt={fullName}
                      src={profileImage}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        border: `4px solid ${primaryColor}`,
                        flexShrink: 0,
                      }}
                    />

                    {/* Asosiy ma'lumotlar */}
                    <CardContent sx={{ p: 0, flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: primaryColor }}>
                        {fullName}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 0.5, 
                          color: isDark ? '#ccc' : '#555' 
                        }}
                      >
                        <Briefcase size={16} style={{ marginRight: 5, color: successColor }} />
                        Mutaxassis: <Box component="span" fontWeight="bold" ml={0.5}>{category}</Box>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 0.5, 
                          color: isDark ? '#ddd' : '#333' 
                        }}
                      >
                        <DollarSign size={16} style={{ marginRight: 5, color: successColor }} />
                        Oylik: <Box component="span" fontWeight="bold" ml={0.5} sx={{ color: successColor }}>{formatSalary(salary)}</Box>
                      </Typography>
                      
                      {/* Bio qisqa matni */}
                      {bioText && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mt: 1, 
                              color: isDark ? '#bbb' : '#666', 
                              fontStyle: 'italic', 
                              maxHeight: '40px', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              // Faqat 2 qatorni ko'rsatish
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {bioText}
                          </Typography>
                      )}
                    </CardContent>
                  </Stack>
                  
                  {/* Tugmalar */}
                  <Stack 
                    direction="row" 
                    spacing={1.5} 
                    sx={{ p: 3, pt: 0, borderTop: `1px solid ${isDark ? '#333' : '#eee'}` }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Info size={18} />}
                      sx={{ 
                        bgcolor: primaryColor, 
                        '&:hover': { bgcolor: '#0056b3' },
                        py: 1.2,
                        borderRadius: '10px'
                      }}
                      onClick={() => router.push(`/doctors/about/${doctor.id}`)}
                    >
                      Batafsil
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<MessageSquare size={18} />}
                      sx={{ 
                        bgcolor: successColor, 
                        '&:hover': { bgcolor: '#1e7e34' },
                        py: 1.2,
                        borderRadius: '10px'
                      }}
                      onClick={() => handleChatClick(doctor.id)}
                    >
                      Suhbat
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack direction="row" spacing={2} justifyContent="center" mt={6}>
          <Button
            onClick={() => fetchDoctors(page - 1)}
            disabled={page === 1}
            variant="outlined"
            startIcon={<ChevronLeft size={20} />}
            sx={{ 
              color: primaryColor, 
              borderColor: primaryColor, 
              '&:hover': { borderColor: primaryColor, bgcolor: primaryColor + '10' } 
            }}
          >
            Oldingi
          </Button>
          
          <Box display="flex" alignItems="center" px={2}>
             <Typography fontWeight="medium" color={isDark ? "#ccc" : "#555"}>
                Sahifa: <Box component="span" fontWeight="bold" color={primaryColor}>{page}</Box> / {totalPages}
             </Typography>
          </Box>

          <Button
            onClick={() => fetchDoctors(page + 1)}
            disabled={page === totalPages}
            variant="outlined"
            endIcon={<ChevronRight size={20} />}
            sx={{ 
              color: primaryColor, 
              borderColor: primaryColor, 
              '&:hover': { borderColor: primaryColor, bgcolor: primaryColor + '10' } 
            }}
          >
            Keyingi
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default FullDoctors;