"use client";

import { useUserStore } from "@/store/UseUserStore";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Snackbar,
  Alert as MuiAlert,
  AlertColor,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmailIcon from "@mui/icons-material/Email";
import GroupIcon from "@mui/icons-material/Group";
import PublicIcon from "@mui/icons-material/Public";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";




type Role = "SUPERADMIN" | "ADMIN" | "DOCTOR" | "BEMOR";
type RecipientType = "admins" | "doctors" | "bemors";
type SendMode = "email" | "role" | "all";
type TargetRole = "DOCTOR" | "BEMOR" | "ADMIN";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  fullName: string;
}

interface Recipient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
}

// Ranglar palitrasi (Modern & Professional)
const PRIMARY_COLOR_LIGHT = "#007AFF"; // Toza ko'k (Apple/Modern)
const PRIMARY_COLOR_DARK = "#4B94FF"; // Dark mode uchun yengilroq ko'k
const BACKGROUND_LIGHT = "#F4F7FB"; // Oq va kulrang orasidagi yumshoq fon
const PAPER_BG_LIGHT = "#FFFFFF"; // Oq qog'oz
const PAPER_BG_DARK = "#1E293B"; // Slate-900 ga yaqin
const DIVIDER_COLOR = "rgba(0, 0, 0, 0.1)";
const DIVIDER_COLOR_DARK = "rgba(255, 255, 255, 0.1)";

function Xabarlashish() {
  const { isDark } = useUserStore();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [roleType, setRoleType] = useState<RecipientType>("admins");
  const [sendMode, setSendMode] = useState<SendMode>("email");
  const [targetRole, setTargetRole] = useState<TargetRole>("DOCTOR");
  const [loading, setLoading] = useState(false);

  // ✅ Snackbar uchun holat
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "info" });

  const showSnackbar = (message: string, severity: AlertColor = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 🔹 Profilni olish
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return router.push("/");

        const { data } = await axios.get<{ data: Omit<User, "fullName"> }>(
          "https://faxriddin.bobur-dev.uz/profile/my/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const userData: User = {
          ...data.data,
          fullName: `${data.data.firstName} ${data.data.lastName}`,
        };
        setUser(userData);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.push("/");
        }
        console.log("Profile fetch error:", error);
      }
    }
    fetchProfile();
  }, [router]);

  // 🔹 SUPERADMIN uchun — userlar ro‘yxatini olish
  const fetchRecipients = async (type: RecipientType) => {
    try {
      const token = localStorage.getItem("accessToken");
      const endpoint = type === "bemors" ? "patients" : "doctors";
      const { data } = await axios.get<{ data: Recipient[] }>(
        `https://faxriddin.bobur-dev.uz/admin/${endpoint}?limit=50&page=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const formattedRecipients: Recipient[] = (data.data || []).map((r) => ({
        ...r,
        fullName: `${r.firstName || ""} ${r.lastName || ""}`.trim(),
      }));
      setRecipients(formattedRecipients);
      setEmail("");
    } catch (error) {
      console.log("Error fetching recipients:", error);
      setRecipients([]);
      setEmail("");
    }
  };

  // 🔹 Xabar yuborish funksiyasi
  const handleSend = async () => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return router.push("/");

    setLoading(true);
    try {
      if (user.role === "BEMOR" || user.role === "DOCTOR") {
        if (!message.trim()) {
          showSnackbar("Iltimos, xabar matnini kiriting!", "warning");
          setLoading(false);
          return;
        }

        await axios.post(
          "https://faxriddin.bobur-dev.uz/contacts/create",
          {
            email: user.email,
            phone: user.phone || "+998901234567",
            message,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        showSnackbar("Xabaringiz yuborildi!", "success");
      } else if (user.role === "SUPERADMIN") {
        if (!title.trim() || !message.trim()) {
          showSnackbar("Sarlavha va xabar matnini kiriting!", "warning");
          setLoading(false);
          return;
        }

        if (sendMode === "email") {
          if (!email) {
            showSnackbar("Iltimos, email tanlang!", "warning");
            setLoading(false);
            return;
          }

          const selectedUser = recipients.find((r) => r.email === email);
          const userId = selectedUser?.id;
          if (!userId) {
            showSnackbar("Tanlangan emailga mos user topilmadi!", "error");
            setLoading(false);
            return;
          }

          await axios.post(
            "https://faxriddin.bobur-dev.uz/admin/notification/send",
            { userId, message, title },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          showSnackbar(`Xabar ${email} manziliga yuborildi!`, "success");
        } else if (sendMode === "role") {
          await axios.post(
            "https://faxriddin.bobur-dev.uz/admin/notification/all",
            { role: targetRole, message, title },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          showSnackbar(`${targetRole} foydalanuvchilariga yuborildi!`, "success");
        } else if (sendMode === "all") {
          await axios.post(
            "https://faxriddin.bobur-dev.uz/admin/notification/broadcast",
            { message, title },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          showSnackbar("Xabar barcha foydalanuvchilarga yuborildi!", "success");
        }
      }
      // Yuborishdan keyin formani tozalash (faqat SUPERADMIN uchun)
      if (user.role === "SUPERADMIN") {
        setTitle("");
      }
      setMessage("");
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        let backendMsg = error.response?.data?.message;
        if (Array.isArray(backendMsg)) backendMsg = backendMsg[0];
        if (typeof backendMsg === "object" && backendMsg !== null)
          backendMsg = Object.values(backendMsg)[0];
        showSnackbar(String(backendMsg || "Xabar yuborishda xatolik!"), "error");
      } else showSnackbar("Kutilmagan xatolik yuz berdi!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "SUPERADMIN") fetchRecipients(roleType);
  }, [user, roleType]);

  // 🎨 Dizayn uchun CSS style O'zgarishlar

  const paperStyle = {
    p: { xs: 3, sm: 5 }, // Kichik ekranlarda p-3, kattaroqlarda p-5
    borderRadius: 4, // Kattaroq border radius
    bgcolor: isDark ? PAPER_BG_DARK : PAPER_BG_LIGHT,
    color: isDark ? "#E2E8F0" : "#1E293B", // Yumshoqroq text rangi
    // Modern Box Shadow (Soft Neumorphism)
    boxShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.5), 0 0 5px rgba(255,255,255,0.05)"
      : "0 10px 30px rgba(0,0,0,0.08), 0 0 5px rgba(0,0,0,0.05)",
    transition: "all 0.4s ease-in-out", // Yumshoq o'tishlar
  };

  const textFieldStyle = {
    "& .MuiInputLabel-root": { color: isDark ? "#A0AEC0" : "#4A5568" }, // Input label rangini yumshatish
    "& .MuiInputBase-input": { color: isDark ? "#F7FAFC" : "#2D3748" },
    "& .MuiOutlinedInput-root": {
      borderRadius: 2, // Kichikroq border radius
      "& fieldset": { borderColor: isDark ? "#475569" : "#CBD5E1" },
      "&:hover fieldset": {
        borderColor: isDark ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT,
      },
      "&.Mui-focused fieldset": {
        borderColor: isDark ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT,
        borderWidth: "2px", // Fokusda qalinroq chegara
      },
      transition: "all 0.3s ease-in-out",
    },
  };

  const modeButtonSx = (mode: SendMode) => ({
    mr: 1,
    minWidth: 120,
    py: 1.2,
    fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Kichik ekranlarda kichikroq font
    fontWeight: 600,
    borderRadius: 2,
    transition: "all 0.3s ease",
    // Hover effektini qo'shamiz
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: isDark ? "0 4px 10px rgba(75, 148, 255, 0.4)" : "0 4px 10px rgba(0, 122, 255, 0.2)",
    },
    // Tanlangan holat
    ...(sendMode === mode && {
        // Kontrastni yaxshilash uchun ranglar
        bgcolor: isDark ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT,
        color: '#FFFFFF',
        boxShadow: isDark ? "0 4px 10px rgba(75, 148, 255, 0.4)" : "0 4px 10px rgba(0, 122, 255, 0.2)",
        borderColor: isDark ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT,
    }),
  });

  const sendButtonSx = {
    py: 1.8, // Baland tugma
    fontSize: "1.1rem",
    fontWeight: 700,
    borderRadius: 2,
    mt: 2,
    bgcolor: isDark ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT,
    color: "#fff",
    transition: "all 0.3s ease",
    "&:hover": {
      bgcolor: isDark ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT, // Xuddi shu rangni saqlab turish
      opacity: 0.9,
      transform: "scale(1.01)", // Kichik o'lcham o'zgarishi
      boxShadow: isDark ? "0 8px 25px rgba(75, 148, 255, 0.5)" : "0 8px 25px rgba(0, 122, 255, 0.4)",
    },
    "&:disabled": {
        bgcolor: isDark ? 'rgba(75, 148, 255, 0.3)' : 'rgba(0, 122, 255, 0.3)',
        color: isDark ? '#ddd' : '#aaa',
    }
  };
  
  // -----------------------------------------------------------
  // 🎨 Dizayn uchun Yakuniy Render
  // -----------------------------------------------------------
  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800" // Toza fon ranglari
      }`}
      style={{ transition: "background-color 0.5s ease" }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 }, flex: 1 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 800,
            mb: { xs: 3, sm: 5 },
            display: 'flex',
            alignItems: 'center',
            color: isDark ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT,
          }}
        >
          <SendIcon sx={{ mr: 1.5, verticalAlign: "middle", fontSize: { xs: 30, sm: 36 } }} /> 
          Xabarlashish Markazi
        </Typography>

        <Paper sx={paperStyle}>
          {user?.role === "SUPERADMIN" && (
            <Box sx={{ mb: 5, pb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: isDark ? PRIMARY_COLOR_DARK : PRIMARY_COLOR_LIGHT }}>
                <SupervisedUserCircleIcon
                  sx={{ mr: 1, verticalAlign: "bottom" }}
                />
                Yuborish Rejimi
              </Typography>

              <Divider sx={{ mb: 3, borderColor: isDark ? DIVIDER_COLOR_DARK : DIVIDER_COLOR }} />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                <Button
                  variant={sendMode === "email" ? "contained" : "outlined"}
                  onClick={() => setSendMode("email")}
                  sx={modeButtonSx("email")}
                  startIcon={<EmailIcon />}
                  color="primary"
                >
                  Shaxsiy
                </Button>
                <Button
                  variant={sendMode === "role" ? "contained" : "outlined"}
                  onClick={() => setSendMode("role")}
                  sx={modeButtonSx("role")}
                  startIcon={<GroupIcon />}
                  color="primary"
                >
                  Rol Bo‘yicha
                </Button>
                <Button
                  variant={sendMode === "all" ? "contained" : "outlined"}
                  onClick={() => setSendMode("all")}
                  sx={modeButtonSx("all")}
                  startIcon={<PublicIcon />}
                  color="primary"
                >
                  Barchaga
                </Button>
              </Box>

              {sendMode === "email" && (
                <Box sx={{ display: "flex", gap: 2, mt: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <FormControl fullWidth variant="outlined" sx={textFieldStyle}>
                    <InputLabel id="recipient-type-label">
                      Qabul qiluvchi toifa
                    </InputLabel>
                    <Select
                      labelId="recipient-type-label"
                      value={roleType}
                      label="Qabul qiluvchi toifa"
                      onChange={(e) =>
                        setRoleType(e.target.value as RecipientType)
                      }
                      MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? PAPER_BG_DARK : PAPER_BG_LIGHT } } }}
                    >
                      <MenuItem value="admins">Adminlar</MenuItem>
                      <MenuItem value="doctors">Doktorlar</MenuItem>
                      <MenuItem value="bemors">Bemorlar</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth variant="outlined" sx={textFieldStyle}>
                    <InputLabel id="email-select-label">
                      Email tanlang
                    </InputLabel>
                    <Select
                      labelId="email-select-label"
                      value={email}
                      label="Email tanlang"
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={recipients.length === 0}
                      MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? PAPER_BG_DARK : PAPER_BG_LIGHT } } }}
                    >
                      <MenuItem value="">— Email tanlang —</MenuItem>
                      {recipients.map((r) => (
                        <MenuItem key={r.id} value={r.email}>
                          {r.email} ({r.fullName})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {sendMode === "role" && (
                <FormControl fullWidth variant="outlined" sx={{ ...textFieldStyle, mt: 3 }}>
                  <InputLabel id="target-role-label">
                    Kimlarga yuborilsin
                  </InputLabel>
                  <Select
                    labelId="target-role-label"
                    value={targetRole}
                    label="Kimlarga yuborilsin"
                    onChange={(e) =>
                      setTargetRole(e.target.value as TargetRole)
                    }
                    MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? PAPER_BG_DARK : PAPER_BG_LIGHT } } }}
                  >
                    <MenuItem value="DOCTOR">Doktorlarga</MenuItem>
                    <MenuItem value="BEMOR">Bemorlarga</MenuItem>
                    <MenuItem value="ADMIN">Adminlarga</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          )}

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
            <EmailIcon sx={{ mr: 1, verticalAlign: "bottom" }} /> Xabar Tarkibi
          </Typography>
          <Divider sx={{ mb: 3, borderColor: isDark ? DIVIDER_COLOR_DARK : DIVIDER_COLOR }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {user?.role === "SUPERADMIN" && (
              <TextField
                label="Xabar Sarlavhasi (Majburiy)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                variant="outlined"
                sx={textFieldStyle}
              />
            )}
            
            <TextField
              label={user?.role === "SUPERADMIN" ? "Xabar matnini kiriting (Majburiy)" : "Sizning xabaringizni kiriting"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={8} // Kattaroq textarea
              fullWidth
              required
              variant="outlined"
              sx={textFieldStyle}
            />

            <Tooltip title="Xabarni yuborish" arrow>
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={loading}
                fullWidth
                endIcon={loading ? null : <SendIcon />}
                sx={sendButtonSx}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Xabar yuborish"
                )}
              </Button>
            </Tooltip>
          </Box>
        </Paper>

        {/* Snackbar qismi o'zgarishsiz, ammo zamonaviy ranglar bilan */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: "100%",
              // Zamonaviy ranglar
              bgcolor:
                snackbar.severity === "success"
                  ? "#10B981" // Emerald Green
                  : snackbar.severity === "error"
                  ? "#EF4444" // Red-600
                  : snackbar.severity === "warning"
                  ? "#F59E0B" // Amber-500
                  : PRIMARY_COLOR_LIGHT, // Blue
              color: "#fff",
              borderRadius: 2,
            }}
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Container>
    </div>
  );
}

export default Xabarlashish;