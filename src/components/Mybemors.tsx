"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios, { AxiosError } from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Avatar,
  Stack,
  useTheme,
  Snackbar,
  Alert,
  TextField,
  Divider,
  Pagination,
} from "@mui/material";
import { MessageSquare, Search, User } from "lucide-react";
import { useUserStore } from "@/store/UseUserStore";
import Chat_Doctor from "./chat-doktor";
import { useRouter } from "next/navigation";

const Base_url = "https://faxriddin.bobur-dev.uz";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImg?: string | null;
  isOnline?: boolean;
}

interface PatientsResponse {
  message: string;
  total: number;
  data: Patient[];
}

const FullPatients: React.FC = () => {
  const { isDark, SetDoctorId } = useUserStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const theme = useTheme();
  const router = useRouter();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken") || "";
      const res = await axios.get<PatientsResponse>(
        `${Base_url}/doctor-profile/doctor/patients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPatients(res.data.data || []);
    } catch (err) {
      console.error("Bemorlarni yuklashda xatolik:", err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        if (axiosError.response?.status === 401) {
          setSnackbarMessage("Login qilishingiz kerak!");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          router.push("/login");
          return;
        }
      }
      setSnackbarMessage("Bemorlarni yuklashda xatolik yuz berdi!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? patients.filter(
          (p) =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
            (p.email || "").toLowerCase().includes(q)
        )
      : patients;
  }, [patients, query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  if (selectedPatientId && chatOpen) {
    const patient = patients.find((p) => p.id === selectedPatientId);
    const fullname = patient ? `${patient.firstName} ${patient.lastName}` : "";
    return (
      <Chat_Doctor
        doctorId={selectedPatientId}
        fullname={fullname}
        onClose={() => {
          setSelectedPatientId(null);
          setChatOpen(false);
        }}
      />
    );
  }

  const primaryColor = theme.palette.primary.main;
  const muted = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <Box sx={{ p: { xs: 3, md: 6 }, minHeight: "100vh", bgcolor: isDark ? "#0b1220" : "#f7fafc" }}>
      {/* Header */}
      <Box sx={{ maxWidth: 1200, mx: "auto", mb: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: primaryColor }}>
              Sizning Bemorlaringiz
            </Typography>
            <Typography variant="body2" sx={{ color: muted }}>
              Bu yerda siz yozishgan bemorlarni ko‘rishingiz mumkin.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: isDark ? "#071226" : "#fff",
              px: 2,
              py: 0.5,
              borderRadius: 3,
              boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.06)",
            }}
          >
            <Search size={16} style={{ marginRight: 8, color: muted }} />
            <TextField
              placeholder="Ism yoki email bo‘yicha qidirish..."
              variant="standard"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              InputProps={{
                disableUnderline: true,
                sx: { minWidth: 220, color: isDark ? "#e6eef8" : "#0b1826" },
              }}
            />
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: isDark ? "#1f2937" : "#e6eef4", mb: 4 }} />

      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            py={10}
            flexDirection="column"
            alignItems="center"
          >
            <CircularProgress color="primary" size={56} />
            <Typography variant="h6" sx={{ mt: 2, color: muted }}>
              Bemorlar yuklanmoqda...
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Typography variant="h6" sx={{ color: muted }}>
              Hozircha hech qanday bemor topilmadi.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Cards container (responsive flex) */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 3,
              }}
            >
              {paginated.map((patient) => {
                const fullName = `${patient.firstName} ${patient.lastName}`;
                const profileImage = patient.profileImg || "/img/user.png";
                const online = !!patient.isOnline;

                return (
                  <Box
                    key={patient.id}
                    sx={{
                      width: { xs: "100%", sm: "45%", md: "30%" },
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Card
                      sx={{
                        width: "100%",
                        borderRadius: 3,
                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                        },
                        bgcolor: isDark ? "#0b1220" : "#fff",
                      }}
                    >
                      <CardContent sx={{ textAlign: "center", pb: 1 }}>
                        <Avatar
                          alt={fullName}
                          src={profileImage}
                          sx={{
                            width: 90,
                            height: 90,
                            mx: "auto",
                            mb: 2,
                            border: `3px solid ${online ? "#22c55e" : primaryColor}`,
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: primaryColor }}>
                          {fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: muted, mt: 0.5 }}>
                          {patient.role}
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 1, color: muted }}>
                          {patient.email}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 0.5, color: online ? "#22c55e" : muted }}
                        >
                          {online ? "Online" : "Offline"}
                        </Typography>
                      </CardContent>

                      <Divider sx={{ borderColor: isDark ? "#1f2937" : "#f0f2f5" }} />

                      <Box sx={{ p: 2.5, display: "flex", gap: 1.5 }}>
                        <Button
                          startIcon={<MessageSquare size={16} />}
                          fullWidth
                          variant="contained"
                          onClick={() => {
                            SetDoctorId(patient.id);
                            setSelectedPatientId(patient.id);
                            setChatOpen(true);
                          }}
                          sx={{
                            bgcolor: primaryColor,
                            "&:hover": { bgcolor: theme.palette.primary.dark },
                            borderRadius: 2,
                          }}
                        >
                          Suhbat
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => router.push(`/user/${patient.id}`)}
                          sx={{ borderRadius: 2 }}
                        >
                          Batafsil
                        </Button>
                      </Box>
                    </Card>
                  </Box>
                );
              })}
            </Box>

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={5}>
              <Pagination
                count={Math.ceil(filtered.length / perPage)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          </>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FullPatients;
