"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Pagination,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  useTheme, // useTheme qo'shildi responsivlik uchun
} from "@mui/material";
import { ChevronRight } from "lucide-react";
import axios, { isAxiosError } from "axios";
import { useUserStore } from "@/store/UseUserStore";
import { useRouter } from "next/navigation";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'; // Yangi icon

const Base_url = "https://faxriddin.bobur-dev.uz";

// --- Types ---
interface NotificationItem {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    profileImg?: string | null;
  };
}

// --- Component ---
const Notification: React.FC = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const { isDark } = useUserStore();
  const theme = useTheme(); // useTheme ishlatildi
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const limit = 10;

  const open = Boolean(anchorEl);
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // 🧠 Fetch notifications
  const fetchNotifications = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      let readQuery = "";
      if (readFilter === "read") readQuery = "true";
      else if (readFilter === "unread") readQuery = "false";

      const res = await axios.get(`${Base_url}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          read: readQuery || undefined,
          offset: page,
          limit,
        },
      });

      const { data, totalPages } = res.data;
      setNotifications(data || []);
      setTotalPages(totalPages || 1);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        router.push('/login');
        return;
      }
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, readFilter]); // token dependency olib tashlandi, chunki u component yuklanganda olinadi

  // 🟢 Barchasini o‘qilgan qilish
  const handleMarkAllRead = async () => {
    if (!token || loading) return;

    try {
      setLoading(true);
      await axios.patch(`${Base_url}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter 'unread' bo'lsa, xabarnomalar ro'yxatini to'liq yangilash kerak
      if (readFilter === 'unread') {
          setNotifications([]);
          setTotalPages(1);
          setPage(1);
      }
      fetchNotifications();
    } catch (err) {
      console.error("read-all xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Birma-bir o‘qilgan qilish (YANGI FUNKSIYA)
  const handleMarkAsRead = async (id: string, isCurrentlyRead: boolean) => {
    if (!token || isCurrentlyRead || loading) return; // Agar o'qilgan bo'lsa, qayta so'rov yuborish shart emas

    try {
      // Ro'yxatni mahalliy ravishda tezda yangilash
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );

      // API so'rov
      await axios.patch(`${Base_url}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter 'unread' bo'lsa, ro'yxatni yangilash
      if (readFilter === 'unread') {
        fetchNotifications();
      }

    } catch (err) {
      console.error(`Xabar ${id} o'qilgan qilishda xatolik:`, err);
      // Xatolik yuz bersa, holatni qaytarish
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: false } : n)
      );
    }
  };

  // 🕹 Pagination
  const handleChangePage = (_: unknown, value: number) => setPage(value);

  // Yuklanish indikatori
  if (loading && notifications.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: isDark ? "#1f2937" : "#f9fafb",
        color: isDark ? "white" : "black",
        boxShadow: 2,
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Xabarnomalar
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          {/* Filter Menu */}
          <Button
            variant="outlined"
            onClick={handleMenuOpen}
            sx={{
              textTransform: "none",
              color: isDark ? "white" : "black",
              borderColor: isDark ? "#4b5563" : "#d1d5db",
            }}
            endIcon={<ChevronRight size={16} />}
          >
            {readFilter === "all"
              ? "Barchasi"
              : readFilter === "read"
              ? "O‘qilganlar"
              : "O‘qilmaganlar"}
          </Button>

          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                setReadFilter("all");
                setPage(1);
                handleMenuClose();
              }}
            >
              Barchasi
            </MenuItem>
            <MenuItem
              onClick={() => {
                setReadFilter("unread");
                setPage(1);
                handleMenuClose();
              }}
            >
              O‘qilmaganlar
            </MenuItem>
            <MenuItem
              onClick={() => {
                setReadFilter("read");
                setPage(1);
                handleMenuClose();
              }}
            >
              O‘qilganlar
            </MenuItem>
          </Menu>

          {/* Mark All Read Button */}
          <Tooltip title="Barchasini o‘qildi qilish" arrow>
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMarkAllRead}
                disabled={loading}
                sx={{ textTransform: "none", minWidth: "40px", p: 1 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : <CleaningServicesIcon />}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Notifications List */}
      {notifications.length === 0 && !loading ? (
        <Typography
          variant="body1"
          align="center"
          sx={{ color: isDark ? "#9ca3af" : "text.secondary", py: 4 }}
        >
          {readFilter === 'unread' ? "O‘qilmagan xabarlar yo‘q." : "Hozircha hech qanday xabar yo‘q."}
        </Typography>
      ) : (
        notifications.map((item) => (
          <Card
            key={item.id}
            variant="outlined"
            onClick={() => handleMarkAsRead(item.id, item.isRead)} // 💡 O‘qilgan qilish funksiyasi
            sx={{
              mb: 2,
              cursor: item.isRead ? "default" : "pointer", // Agar o'qilgan bo'lmasa, cursor pointer bo'lsin
              borderColor: isDark ? "#6b7280" : "#e5e7eb",
              bgcolor: item.isRead
                ? (isDark ? "#111827" : "#f9fafb") // O'qilgan bo'lsa fon biroz qoraroq/ochiqroq
                : (isDark ? "#1f2937" : "white"), // O'qilmagan bo'lsa asosiy fon
              color: isDark ? "#f3f4f6" : "inherit",
              boxShadow: item.isRead ? 0 : 3, // O'qilmagan bo'lsa soya qo'shish
              transition: "box-shadow 0.2s, background-color 0.2s, border-color 0.2s",
              "&:hover": {
                borderColor: isDark ? "#93c5fd" : "#3b82f6",
                boxShadow: item.isRead ? 1 : 4,
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap", // 💡 Responsive bo'lishi uchun
                gap: 1, // Elementlar orasidagi bo'shliq
              }}
            >
              {/* Xabar matni va vaqti */}
              <Box sx={{ flexGrow: 1, minWidth: theme.spacing(20) }}> {/* Eng kichik kenglik */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    color: isDark ? "#f3f4f6" : "text.primary",
                    wordBreak: 'break-word', // Uzun so'zlar uchun
                  }}
                >
                  {item.message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? "#9ca3af" : "text.secondary" }}
                >
                  {new Date(item.createdAt).toLocaleString("uz-UZ", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>

              {/* O'qilmagan/O'qilgan belgilari */}
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', minWidth: '40px', justifyContent: 'flex-end' }}>
                {loading && (
                  <CircularProgress size={16} sx={{ color: isDark ? 'white' : 'black', mr: 1 }} />
                )}
                
                {!item.isRead ? (
                  <Tooltip title="O‘qilmagan" arrow>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        bgcolor: "#ef4444",
                        borderRadius: "50%",
                        flexShrink: 0, // Kichraymasligi uchun
                      }}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="O‘qilgan" arrow>
                    <MarkEmailReadIcon 
                      sx={{ 
                        color: isDark ? '#3b82f6' : '#10b981', // O'qilgan rang
                        fontSize: 20, 
                        flexShrink: 0 
                      }} 
                    />
                  </Tooltip>
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            shape="rounded"
            siblingCount={1}
            boundaryCount={1}
            sx={{
              "& .MuiPaginationItem-root": {
                color: isDark ? "white" : "black",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Notification;