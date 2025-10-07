"use client";

import React, { useEffect, useState } from "react";
import {  useParams } from "next/navigation";
import {  useRouter } from "next/navigation";

import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  Button,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useUserStore } from "@/store/UseUserStore";
import Header from "@/pages/Header";
import Footer from "@/pages/Footer";

// Yangi qo'shilgan interfeys: Shifokorning harajatlar tuzilmasi
interface DoctorSalary {
  id: string;
  doctorId: string;
  free: boolean;
  daily: string;
  weekly: string;
  monthly: string; // Oylik narx (string sifatida keladi)
  yearly: string;
  createdAt: string;
  updatedAt: string;
}

// Yangilangan DoctorProfile interfeysi
interface DoctorProfile {
  bio: string;
  images: string[];
  videos?: string[];
  files?: string[];
  category: { name: string; img?: string };
  futures?: string[];
  // API tuzilmasiga moslab o'zgartirildi: salary endi DoctorSalary massivida
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

const BASE_URL = "https://faxriddin.bobur-dev.uz"; // Backendning asosiy manzili

// Narxni formatlash funksiyasi
const formatPrice = (priceString: string | null | undefined): string => {
  if (!priceString) return "Ko'rsatilmagan";
  
  try {
    const price = parseInt(priceString, 10);
    if (isNaN(price)) return "Ko'rsatilmagan";

    // O'zbek so'mi formatida chiroyli qilib formatlash
    return new Intl.NumberFormat('uz-UZ', { 
      style:'decimal', 
      currency: 'UZS', 
      maximumFractionDigits: 0 
    }).format(price).replace('UZS', "so'm").trim();

  } catch (e) {
    return "Xato format";
  }
};

const DoctorDetailPage: React.FC = () => {
  const { isDark } = useUserStore();
  const router = useRouter();
  const params = useParams();
  const doctorId = params?.id;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) {
      router.push("/doctors");
      return;
    }

    setLoading(true);

    // API chaqiruvi (Real ma'lumot API javobiga o'ralgan)
    // Eslatma: Siz yuborgan ma'lumot `data` massivi ichida kelgani uchun, agar API aynan shunday qaytarsa, uni to'g'irlash kerak.
    // Men to'g'ridan-to'g'ri shifokor obyektini kutib yozdim, chunki oldingi API shunday edi.
    axios
      .get(`${BASE_URL}/User/doctorOne/${doctorId}`)
      .then((res) => {
        // API tuzilmasi siz yuborgan JSONga o'xshasa, quyidagini ishlatish kerak bo'lishi mumkin:
        // const doctorData = res.data?.data?.[0]; 
        
        // Agar API faqatgina bitta shifokor obyektini qaytarsa (oldingidek):
        const doctorData = res.data.data;

        if (!doctorData) {
          router.push("/");
          return;
        }
        
        setDoctor(doctorData);
      })
      .catch((err) => {
        console.error("Shifokor ma'lumotlarini yuklashda xato:", err);
        router.push("/");
      })
      .finally(() => setLoading(false));
  }, [doctorId, router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: isDark ? "#0b1321" : "#f9f9f9",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!doctor) {
    return null;
  }

  const fullName = `${doctor.firstName} ${doctor.lastName}`;
  const bio = doctor.doctorProfile?.bio || "Ma'lumot mavjud emas";
  const category = doctor.doctorProfile?.category?.name || "Shifokor";
  const profileImgUrl = doctor.profileImg || "https://via.placeholder.com/400x400";

  
  const doctorImages = doctor.doctorProfile?.images?.map(imagePath => `${BASE_URL}/${imagePath}`) || [];
  const futures = doctor.doctorProfile?.futures || [];
  const videos = doctor.doctorProfile?.videos || [];
  const files = doctor.doctorProfile?.files || [];
  
  const salaryData = doctor.doctorProfile?.salary?.[0]; 
  const monthlySalary = formatPrice(salaryData?.monthly);
  const dailySalary = formatPrice(salaryData?.daily);

  return (
    <Box sx={{ bgcolor: isDark ? "#0b1321" : "#fff", color: isDark ? "#fff" : "#000" }}>
      <Header />

      {/* --- Orqaga tugma --- */}
      <Box sx={{ px: 4, py: 3, maxWidth: 1200, mx: "auto" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            color: isDark ? "#60a5fa" : "#3b82f6",
            fontWeight: "bold",
          }}
        >
          Orqaga
        </Button>
      </Box>
      <hr />

      {/* --- Asosiy kontent: Rasm va Ma'lumotlar --- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          maxWidth: 1200,
          mx: "auto",
          gap: 6,
          px: 4,
          py: 3,
        }}
      >
        {/* Rasm (Chap qism) */}
        <Box sx={{ flex: 2, minWidth: { md: 350 } }}>
          <Card
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: isDark
                ? "0 10px 30px rgba(0,0,0,0.7)"
                : "0 6px 18px rgba(0,0,0,0.2)",
              transition: "0.3s",
            }}
          >
            <CardMedia
              component="img"
              src={profileImgUrl}
              alt={fullName}
              sx={{
                width: "100%",
                height: { xs: 300, md: 450 },
                objectFit: "cover",
              }}
            />
          </Card>
        </Box>

        {/* Ma'lumotlar (O'ng qism) */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ color: isDark ? "#60a5fa" : "primary.main" }}
          >
            {fullName}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              px: 2,
              py: 1,
              display: "inline-block",
              borderRadius: "12px",
              fontWeight: 500,
              color: isDark ? "#ccc" : "#555",
              backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            }}
          >
            {category}
          </Typography>

          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.6 }}>
            {bio}
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color={isDark ? "#ccc" : "textSecondary"} sx={{ mb: 1 }}>
              Email: {doctor.email}
            </Typography>
            {/* Kunlik va Oylik narxlarni ko'rsatish */}
            <Typography variant="body2" color={isDark ? "#ccc" : "textSecondary"} sx={{ mb: 1 }}>
              Kunlik Narx: {`${dailySalary} so'm`}
            </Typography>
            <Typography variant="body2" color={isDark ? "#ccc" : "textSecondary"}>
              Oylik Narx : {` ${monthlySalary} so'm`}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <hr />

      {/* --- Qo'shimcha Ma'lumotlar Bo'limi --- */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 4, py: 6 }}>
      
        {/* Sertifikatlar va Kurslar */}
        {futures.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ color: isDark ? "#60a5fa" : "primary.main" }}
            >
              Qo'shimcha malumotlar
            </Typography>
            <Box component="ul" sx={{ pl: 2, listStyleType: "disc" }}>
              {futures.map((f, i) => (
                <li key={i} className="list-none">
                  <Typography variant="body1" sx={{ py: 0.5 }}>{f}</Typography>
                </li>
              ))}
            </Box>
          </Box>
        )}
        
        {/* Doktor Rasmlari (Galereya) */}
        {doctorImages.length > 0 && (
          <Box sx={{ mt: 6 }}>
          
            <Grid container spacing={3}>
             {/* Rasmlar */}
{doctorImages.length > 0 && (
  <Box sx={{ mt: 6 }}>
    <Typography
      variant="h5"
      fontWeight="bold"
      gutterBottom
      sx={{ color: isDark ? "#60a5fa" : "primary.main" }}
    >
      Doktor Rasmlari (Galereya)
    </Typography>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        gap: 3,
      }}
    >
      {doctorImages.map((imageUrl, i) => (
        <Box
          key={i}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: isDark
              ? "0 4px 12px rgba(0,0,0,0.5)"
              : "0 2px 8px rgba(0,0,0,0.1)",
            transition: "0.3s",
            "&:hover": { transform: "scale(1.03)" },
          }}
        >
          <CardMedia
            component="img"
            src={imageUrl}
            alt={`Doktor rasmi ${i + 1}`}
            sx={{
              width: "100%",
              height: 250,
              objectFit: "cover",
            }}
          />
        </Box>
      ))}
    </Box>
  </Box>
)}

            </Grid>
          </Box>
        )}
        
        {/* Videolar Bo'limi (Agar bo'lsa) */}
        {videos.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ color: isDark ? "#60a5fa" : "primary.main" }}
            >
              Videolar
            </Typography>
            <Typography variant="body1">
                Videolar mavjud: {videos.length} ta
            </Typography>
          </Box>
        )}
        
        {/* Fayllar Bo'limi (Agar bo'lsa) */}
        {files.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ color: isDark ? "#60a5fa" : "primary.main" }}
            >
              Fayllar (Yuklab olish uchun)
            </Typography>
            <Typography variant="body1">
                Fayllar mavjud: {files.length} ta
            </Typography>
          </Box>
        )}



        <button className="bg-blue-600 text-[18px] mt-[40px] text-white rounded-[15px] hover:cursor-pointer py-[8px] pl-[8px] pr-[8px] px-[8px]" onClick={()=> router.push("profile/doctor") }>Shifokor bilan suhbatlashish</button>

      </Box>

      <Footer />
    </Box>
  );
};

export default DoctorDetailPage;