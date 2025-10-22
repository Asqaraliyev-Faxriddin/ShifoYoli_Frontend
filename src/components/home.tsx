"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/uz";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useUserStore } from "@/store/UseUserStore";
import updateLocale from "dayjs/plugin/updateLocale";

// dayjs sozlamalari
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
type Role = "SUPERADMIN" | "ADMIN" | "DOCTOR" | "BEMOR";

dayjs.updateLocale("uz", {
  months: [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
  ],
  weekdays: [
    "Yakshanba", "Dushanba", "Seshanba",
    "Chorshanba", "Payshanba", "Juma", "Shanba",
  ],
});

dayjs.locale("uz");


interface Wallet {
  balance: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  fullName: string;
  profileImg?: string | null;
  wallet?: Wallet;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profileImg?: string;
  doctorProfile: {
    category: { name: string };
    salary: { monthly: string }[];
  };
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    value: number;
  }[];
  label?: string;
  isDark: boolean;
}

const Base_url = "https://faxriddin.bobur-dev.uz"



// Tooltip (oylik daromad uchun)
const CustomTooltip = ({ active, payload, label, isDark }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          p: 1.5,
          bgcolor: isDark ? "#120C0B" : "background.paper",
          border: `1px solid ${isDark ? "#333" : "#ccc"}`,
          borderRadius: 2,
          color: isDark ? "#fff" : "#000",
          boxShadow: isDark
            ? "0 4px 8px rgba(0,0,0,0.7)"
            : "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          {label}
        </Typography>
        <Typography variant="body2" color={isDark ? "#eee" : "text.secondary"}>
          Oyiga topishi:{" "}
          <span style={{ fontWeight: "bold", color: "#3b82f6" }}>
            {Number(payload[0].value).toLocaleString("uz-UZ")} so‘m
          </span>
        </Typography>
      </Box>
    );
  }
  return null;
};

function HomeUser() {
  const router = useRouter();
  const { isDark } = useUserStore();
  const [user, setUser] = useState<User | null>(null);
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(dayjs().tz("Asia/Tashkent"));

  // ⏰ Har 1 sekundda vaqtni yangilash
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs().tz("Asia/Tashkent"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        if (!token) return router.push("/");

        const { data } = await axios.get(
            `${Base_url}/profile/my/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let profileImg = data.data.profileImg;
        if (profileImg && !profileImg.startsWith("http")) {
          profileImg = `${Base_url}/profiles/url/${profileImg}`;
        }

        const userData: User = {
          ...data.data,
          fullName: `${data.data.firstName} ${data.data.lastName}`,
          profileImg,
        };
        setUser(userData);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.push("/");
        }
        console.log("Profile fetch error:", error);
      }
    }

    async function fetchTopDoctors() {
      try {
        const { data } = await axios.get(
          `${Base_url}/User/top-doctors`
        );
        setTopDoctors(data);
      } catch (error) {
        console.log("Top doctors fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
    fetchTopDoctors();
  }, [router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: isDark ? "#0b1321" : "background.default",
          color: isDark ? "#fff" : "text.primary",
        }}
      >
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2 }}>Ma'lumotlar yuklanmoqda...</Typography>
      </Box>
    );
  }

  const chartData = topDoctors.slice(0, 3).map((doc, index) => ({
    name: `${index + 1}-o‘rin: ${doc.firstName} ${doc.lastName}`,
    oyigaTopishi: Number(doc.doctorProfile.salary?.[0]?.monthly || 0),
  }));

  const axisTextColor = isDark ? "#E0E0E0" : "#333";

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: isDark ? "#0b1321" : "background.default",
        minHeight: "100vh",
      }}
    >
      {/* Foydalanuvchi ma’lumoti */}
      {user && (
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            bgcolor: isDark ? "#120C0B" : "#fff",
            color: isDark ? "#fff" : "#000",
            boxShadow: isDark
              ? "0 6px 12px rgba(0,0,0,0.5)"
              : "0 6px 12px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent>
            <Typography variant="h5" fontWeight="bold">
              Salom, {user.fullName} 👋
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontSize: 18,
                color: isDark ? "#60a5fa" : "primary.main",
              }}
            >
              Hisobingiz:{" "}
              <span style={{ fontWeight: "bold" }}>
                {Number(user.wallet?.balance || 0).toLocaleString("uz-UZ")} so‘m
              </span>
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Sana va vaqt (Toshkent vaqti) */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          mb: 4,
          p: 2,
          bgcolor: isDark ? alpha("#3b82f6", 0.2) : alpha("#3b82f6", 0.1),
        }}
      >
        <CardContent
          sx={{ display: "flex", alignItems: "center", gap: 3, p: "0 !important" }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color={isDark ? "#fff" : "text.primary"}
            >
              Bugungi sana:
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color={isDark ? "#fff" : "text.primary"}
              sx={{ mt: 0.5 }}
            >
              {time.format("dddd, D MMMM YYYY")}
            </Typography>
            <Typography
              variant="body1"
              sx={{ mt: 1, color: isDark ? "#b0b0b0" : "text.secondary" }}
            >
              Hozirgi vaqt:{" "}
              <strong>{time.format("HH:mm:ss")}</strong> 
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Diagramma */}
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: isDark ? "#120C0B" : "#fff",
          color: isDark ? "#fff" : "#000",
          boxShadow: isDark
            ? "0 6px 12px rgba(0,0,0,0.5)"
            : "0 6px 12px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Eng yaxshi shifokorlar reytingi (Top 3)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                stroke={axisTextColor}
                tick={{ fill: axisTextColor }}
              />
              <YAxis
                stroke={axisTextColor}
                tick={{ fill: axisTextColor }}
                tickFormatter={(value) =>
                  `${Number(value).toLocaleString("uz-UZ")}`
                }
              />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Bar
                dataKey="oyigaTopishi"
                name="Oyiga topishi"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default HomeUser;
