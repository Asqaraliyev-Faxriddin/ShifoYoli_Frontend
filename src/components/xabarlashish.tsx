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
      const { data } = await axios.get<{ data: Recipient[] }>(
        `https://faxriddin.bobur-dev.uz/admin/${type}?limit=50&page=1`,
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

  const paperStyle = {
    p: 4,
    borderRadius: 3,
    bgcolor: isDark ? "#1f1f1f" : "background.paper",
    color: isDark ? "#fff" : "text.primary",
    boxShadow: isDark ? "0 8px 25px rgba(0,0,0,0.6)" : 8,
  };

  const textFieldStyle = {
    "& .MuiInputLabel-root": { color: isDark ? "#bbb" : "text.primary" },
    "& .MuiInputBase-input": { color: isDark ? "#fff" : "text.primary" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: isDark ? "#555" : "rgba(0,0,0,0.23)" },
      "&:hover fieldset": { borderColor: isDark ? "#888" : "primary.main" },
      "&.Mui-focused fieldset": { borderColor: "primary.main" },
    },
  };

  return (
    <div
  className={`flex min-h-screen ${
    isDark ? "bg-gray-800 text-white" : "bg-gray-50 text-black"
  }`}
>
  <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
    <Typography
      variant="h4"
      gutterBottom
      sx={{ fontWeight: "bold", mb: 3 }}
    >
      <SendIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Xabarlashish
      Markazi
    </Typography>

    <Paper
      elevation={8}
      sx={{
        p: 4,
        borderRadius: 3,
        bgcolor: isDark ? "#1f2937" : "#fff", // dark mode uchun
        color: isDark ? "#fff" : "#000",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {user?.role === "SUPERADMIN" && (
        <Box sx={{ mb: 4, pb: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            <SupervisedUserCircleIcon
              sx={{ mr: 1, verticalAlign: "bottom" }}
            />
            Yuborish Sozlamalari
          </Typography>

          <Divider sx={{ mb: 3, bgcolor: isDark ? "#333" : undefined }} />

          <Box sx={{ mb: 3 }}>
            <Button
              variant={sendMode === "email" ? "contained" : "outlined"}
              onClick={() => setSendMode("email")}
              sx={{ mr: 1, minWidth: 150 }}
              startIcon={<EmailIcon />}
              color="info"
            >
              Shaxsiy Email
            </Button>
            <Button
              variant={sendMode === "role" ? "contained" : "outlined"}
              onClick={() => setSendMode("role")}
              sx={{ mr: 1, minWidth: 150 }}
              startIcon={<GroupIcon />}
              color="info"
            >
              Rol Bo‘yicha
            </Button>
            <Button
              variant={sendMode === "all" ? "contained" : "outlined"}
              onClick={() => setSendMode("all")}
              sx={{ minWidth: 150 }}
              startIcon={<PublicIcon />}
              color="info"
            >
              Barchaga
            </Button>
          </Box>

          {sendMode === "email" && (
            <Box sx={{ display: "flex", gap: 2 }}>
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
            <FormControl fullWidth variant="outlined" sx={textFieldStyle}>
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
              >
                <MenuItem value="DOCTOR">Doktorlarga</MenuItem>
                <MenuItem value="BEMOR">Bemorlarga</MenuItem>
                <MenuItem value="ADMIN">Adminlarga</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      )}

      <Typography variant="h6" gutterBottom color="secondary">
        <EmailIcon sx={{ mr: 1, verticalAlign: "bottom" }} /> Xabar Tarkibi
      </Typography>
      <Divider sx={{ mb: 3, bgcolor: isDark ? "#333" : undefined }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Xabar Sarlavhasi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required={user?.role === "SUPERADMIN"}
          variant="outlined"
          sx={textFieldStyle}
        />
        <TextField
          label="Xabar matnini kiriting"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={6}
          fullWidth
          required
          variant="outlined"
          sx={textFieldStyle}
        />

        <Tooltip title="Xabarni yuborish" arrow>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={loading}
            fullWidth
            endIcon={loading ? null : <SendIcon />}
            sx={{ py: 1.5, fontSize: "1.1rem", mt: 1 }}
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
          bgcolor:
            snackbar.severity === "success"
              ? "#22c55e"
              : snackbar.severity === "error"
              ? "#ef4444"
              : snackbar.severity === "warning"
              ? "#f59e0b"
              : "#3b82f6",
          color: "#fff",
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
