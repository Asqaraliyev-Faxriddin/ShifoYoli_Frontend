"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Pagination,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { ChevronRight  } from "lucide-react";
import axios, { isAxiosError } from "axios";
import { useUserStore } from "@/store/UseUserStore";
import { useRouter } from "next/navigation";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";


const Base_url = "https://faxriddin.bobur-dev.uz";


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

const Notification: React.FC = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const { isDark } = useUserStore();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const router = useRouter()
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

      if(isAxiosError(err)) {
        if(err.status === 401) {
          router.push('/login')
          return;
        }

      }

      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [page, readFilter]);

  // 🟢 Barchasini o‘qilgan qilish
  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await axios.patch(`${Base_url}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error("read-all xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🕹 Pagination
  const handleChangePage = (_:unknown, value: number) => setPage(value);

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Xabarnomalar
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
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
                handleMenuClose();
              }}
            >
              Barchasi
            </MenuItem>
            <MenuItem
              onClick={() => {
                setReadFilter("unread");
                handleMenuClose();
              }}
            >
              O‘qilmaganlar
            </MenuItem>
            <MenuItem
              onClick={() => {
                setReadFilter("read");
                handleMenuClose();
              }}
            >
              O‘qilganlar
            </MenuItem>
          </Menu>

          <Tooltip title="Barchasini o‘qildi qilish" arrow>
      <span>
        <Button
          variant="contained"
          color="primary"
          onClick={handleMarkAllRead}
          disabled={loading}
          sx={{ textTransform: "none", minWidth: "40px" }}
        >
          <CleaningServicesIcon   />
        </Button>
      </span>
    </Tooltip>
        </Box>
      </Box>

      {notifications.length === 0 ? (
  <Typography
    variant="body1"
    align="center"
    sx={{ color: isDark ? "#9ca3af" : "text.secondary" }}
  >
    Hozircha hech qanday xabar yo‘q.
  </Typography>
) : (
  notifications.map((item) => (
    <Card
      key={item.id}
      variant="outlined"
      sx={{
        mb: 2,
        
        borderColor: isDark ? "#6b7280" : "#e5e7eb",
        bgcolor: isDark ? "#1f2937" : "white", // 🔹 qoraroq fon
        color: isDark ? "#f3f4f6" : "inherit", // 🔹 text rangini ham sozlaymiz
        "&:hover": {
          borderColor: isDark ? "#93c5fd" : "#3b82f6",
          transition: "0.2s",
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              color: isDark ? "#f3f4f6" : "text.primary",
               // 🔹 asosiy text oq bo‘lsin darkda
            }}
          >
            {item.message}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isDark ? "#9ca3af" : "text.secondary" }} // 🔹 vaqt rangi kulrang
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

        {!item.isRead && (
          <Box
            sx={{
              width: 10,
              height: 10,
              bgcolor: "#ef4444",
              borderRadius: "50%",
            }}
          />
        )}
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
