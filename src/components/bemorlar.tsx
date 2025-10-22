"use client";
import React, { useEffect, useState, useCallback } from "react";
// Axios o'rniga fetch/retry logikasi foydalaniladi (asl axios importi saqlanadi)
import axios, { AxiosError, isAxiosError } from "axios";
// useUserStore va lucide-react, MUI importlari saqlanadi
import { useUserStore } from "@/store/UseUserStore";
import {
  Search,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  XCircle,
  Image,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";

// Asl User interfeysi saqlanadi
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  profileImg: string | null;
  isActive: boolean;
  blockedUser: {
    id:string;
    reason: string;
    blockedAt: string;
   
  } | null;
  wallet: { balance: string };
  phoneNumber?: string;
  month?: number;
  day?: number;
}

// 🔧 Qayta foydalaniladigan User Modal komponenti
function UserModal({
  title,
  editUser,
  setEditUser,
  password,
  setPassword,
  profileImg,
  setProfileImg,
  onSave,
  onClose,
  error,
  isDark,
}: {
  title: string;
  editUser: User | null;
  setEditUser: React.Dispatch<React.SetStateAction<User | null>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  profileImg: File | null;
  setProfileImg: React.Dispatch<React.SetStateAction<File | null>>;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  error: string | null;
  isDark: boolean;
}) {
  // TextField larni dark mode ga moslashtirish uchun uslub
  const inputStyle = {
    "& .MuiInputBase-input": {
      color: isDark ? "white" : "black",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.2)",
      },
      "&:hover fieldset": {
        borderColor: isDark ? "white" : "black",
      },
      "&.Mui-focused fieldset": {
        borderColor: isDark ? "#3b82f6" : "#1976d2", // primary blue
      },
    },
    "& .MuiInputLabel-root": {
      color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
    },
    "& .Mui-focused": {
      color: isDark ? "white !important" : "black !important",
    },
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: isDark ? "#1f2937" : "white",
        color: isDark ? "white" : "black",
        borderRadius: 4,
        boxShadow: 24,
        p: 4,
        width: "90%",
        maxWidth: 500,
        outline: "none",
      }}
    >
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: "bold" }}>
        {title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {editUser && (
        <form onSubmit={onSave} className="flex flex-col gap-4">
          <TextField
            label="Ism"
            value={editUser.firstName}
            onChange={(e) =>
              setEditUser({ ...editUser, firstName: e.target.value })
            }
            fullWidth
            sx={inputStyle}
            required
            variant="outlined"
            size="small"
          />
          <TextField
            label="Familiya"
            value={editUser.lastName}
            onChange={(e) =>
              setEditUser({ ...editUser, lastName: e.target.value })
            }
            fullWidth
            sx={inputStyle}
            required
            variant="outlined"
            size="small"
          />
          <TextField
            label="Email"
            value={editUser.email}
            onChange={(e) =>
              setEditUser({ ...editUser, email: e.target.value })
            }
            fullWidth
            sx={inputStyle}
            required
            type="email"
            variant="outlined"
            size="small"
          />
          <TextField
            label="Telefon raqam"
            value={editUser.phoneNumber || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, phoneNumber: e.target.value })
            }
            fullWidth
            sx={inputStyle}
            type="tel"
            variant="outlined"
            size="small"
          />
          <TextField
            label="Yosh"
            type="number"
            value={editUser.age}
            onChange={(e) =>
              setEditUser({
                ...editUser,
                age: Number(e.target.value),
              })
            }
            fullWidth
            sx={inputStyle}
            required
            variant="outlined"
            size="small"
            inputProps={{ min: 0 }}
          />

          <TextField
            label="Parol (faqat o'zgartirish uchun)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={inputStyle}
            variant="outlined"
            size="small"
          />

          <Button
            variant="outlined"
            component="label"
            startIcon={<Image />}
            sx={{ textTransform: "none" }} // Tugma matnini kichraytirish
          >
            {profileImg ? profileImg.name : "Rasmni tanlash"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setProfileImg(e.target.files?.[0] || null)}
            />
          </Button>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button onClick={onClose} color="inherit" variant="outlined" className="normal-case">
              <XCircle className="w-4 h-4 mr-1" /> Bekor qilish
            </Button>
            <Button type="submit" variant="contained" color="primary" className="normal-case">
              Saqlash
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
}

// 💻 Bemorlar Ro'yxati Komponenti
export default function Bemorlar() {
  // useUserStore importi saqlanadi
  const { isDark } = useUserStore();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alert, setAlert] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [password, setPassword] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limit = 9; // Grid bilan yaxshi ko'rinishi uchun limitni 9 ga o'zgartirdim
  // localStorage tokeniga murojaat saqlanadi
  const token = localStorage.getItem("accessToken");
  const Base_url = "https://faxriddin.bobur-dev.uz";

  // 🟢 Foydalanuvchilarni olish (useCallback yordamida optimallashtirildi)
  const fetchUsers = useCallback(async () => {
    if (!token) return; // Token yo'qligini tekshirish
    setLoading(true);
    try {
      const res = await axios.get(`${Base_url}/admin/patients`, {
        params: { limit, page, firstName: search },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error(err);
      setAlert("❌ Ma'lumotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [page, search, token]); // Dependencies saqlanadi

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showAlert = (text: string) => {
    setAlert(text);
    setTimeout(() => setAlert(""), 3000); // Alert vaqti 3 sekundga uzaytirildi
  };

  // 🔍 Qidiruv
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Qidiruvdan so'ng 1-sahifaga qaytish
    fetchUsers();
  };

  // 🟥 Bloklash
  const handleBlock = async (userId: string) => {
    try {
      await axios.post(
        `${Base_url}/admin/block/user`,
        { userId, reason: "Qoidabuzarlik" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      showAlert("🛑 Foydalanuvchi bloklandi");
    } catch (err) {
      console.error(err);
      showAlert("❌ Bloklashda xatolik yuz berdi");
    }
  };

  // 🟩 Blokdan chiqarish
  const handleUnblock = async (userId: string) => {
    try {
      await axios.post(
        `${Base_url}/admin/unblock/user`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      showAlert("✅ Foydalanuvchi blokdan chiqarildi");
    } catch (err) {
      console.error(err);
      showAlert("❌ Blokdan chiqarishda xatolik yuz berdi");
    }
  };

  // 🗑️ O‘chirish
  const handleDelete = async (userId: string) => {
    // confirm o'rniga MUI Modal foydalanilishi kerak, lekin hozircha saqlab qolindi
    if (!window.confirm("Rostdan ham o‘chirmoqchimisiz? Bu amalni qaytarib bo‘lmaydi!")) return;
    try {
      await axios.delete(`${Base_url}/admin/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId },
      });
      fetchUsers();
      showAlert("🗑️ Foydalanuvchi o‘chirildi");
    } catch (err) {
      console.error(err);
      showAlert("❌ O‘chirishda xatolik yuz berdi");
    }
  };

  // ✏️ Tahrirlash modalni ochish
  const handleEditOpen = (user: User) => {
    setEditUser(user);
    setPassword("");
    setProfileImg(null);
    setError(null);
    setOpenEditModal(true);
  };

  // ➕ Yangi bemor qo‘shish
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    // Email ni yangi bemor uchun talab qilish
    if (!editUser.firstName || !editUser.lastName || !editUser.email || !password) {
      setError("Ism, familiya, email va parol majburiy!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstName", editUser.firstName);
      formData.append("lastName", editUser.lastName);
      formData.append("email", editUser.email);
      formData.append("age", editUser.age.toString());
      if (editUser.phoneNumber)
        formData.append("phoneNumber", editUser.phoneNumber);
      if (password) formData.append("password", password);
      if (profileImg) formData.append("profileImg", profileImg);

      await axios.post(`${Base_url}/admin/user/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setOpenAddModal(false);
      fetchUsers();
      showAlert("🟢 Yangi bemor qo‘shildi");
    } catch (err) {

      if(isAxiosError(err)){
        const errorMessage = err.response?.data?.message || "Server xatosi: bemor qo‘shilmadi";
      setError(`❌ Xatolik: ${errorMessage}`);
      }

      setError("❌ Xatolik: bemor qo‘shilmadi");
    
    }
  };

  // 💾 Tahrirni saqlash
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    if (!editUser.firstName || !editUser.lastName || !editUser.email) {
      setError("Ism, familiya va email to‘ldirilishi kerak!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", editUser.id);
      formData.append("firstName", editUser.firstName);
      formData.append("lastName", editUser.lastName);
      formData.append("email", editUser.email);
      formData.append("age", editUser.age.toString());
      if (editUser.phoneNumber)
        formData.append("phoneNumber", editUser.phoneNumber);
      if (password) formData.append("password", password);
      if (profileImg) formData.append("profileImg", profileImg);

      await axios.patch(`${Base_url}/admin/user/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setOpenEditModal(false);
      fetchUsers();
      showAlert("✏️ Ma’lumotlar yangilandi");
    } catch (err: any) {
      if(isAxiosError(err)){
        const errorMessage = err.response?.data?.message || "Server xatosi: bemor qo‘shilmadi";
      setError(`❌ Xatolik: ${errorMessage}`);
      }

      setError("❌ Xatolik: bemor qo‘shilmadi");
    
    }
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 transition-colors rounded-xl shadow-lg ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 border-b pb-4">
        <h1 className="text-3xl font-extrabold mb-3 sm:mb-0 text-indigo-500">
          <span role="img" aria-label="doctor">
            🧑‍⚕️
          </span>{" "}
          Bemorlar Ro‘yxati
        </h1>
        <Button
          variant="contained"
          startIcon={<PlusCircle />}
          onClick={() => {
            setEditUser({
              id: "",
              firstName: "",
              lastName: "",
              email: "",
              age: 25, // default yosh
              profileImg: null,
              isActive: true,
              blockedUser: null,
              wallet: { balance: "0" },
            });
            setPassword("");
            setProfileImg(null);
            setError(null);
            setOpenAddModal(true);
          }}
          className="normal-case" // Tugma matnini kichraytirish
        >
          Yangi bemor qo‘shish
        </Button>
      </div>

      {/* 🔍 Qidiruv */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Ism bo‘yicha qidirish..."
          className={`px-4 py-3 rounded-lg w-full transition-shadow focus:shadow-md outline-none border ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
              : "bg-gray-50 border-gray-300 focus:border-indigo-500"
          }`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<Search />}
          className="normal-case h-auto"
        >
          Qidirish
        </Button>
      </form>

      {alert && (
        <Alert
          severity={alert.startsWith("❌") ? "error" : "success"}
          className="mb-4 animate-fadeIn"
          onClose={() => setAlert("")}
          sx={{ textTransform: "none" }}
        >
          {alert}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center mt-12">
          <CircularProgress color="primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 rounded-xl bg-gray-50/10 border border-dashed border-gray-300/20 mt-10">
          <p className="text-lg text-gray-400">❌ Hech qanday bemor topilmadi</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-indigo-500 ${
                  isDark ? "bg-gray-800/80" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Profil rasmi */}
                  <img
                    src={
                      user.profileImg ||
                      `https://placehold.co/60x60/3b82f6/ffffff?text=${user.firstName.charAt(0).toUpperCase()}`
                    }
                    alt={`${user.firstName} ${user.lastName}`}
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/60x60/3b82f6/ffffff?text=U")}
                    className="w-14 h-14 min-w-14 min-h-14 rounded-full object-cover border-2 border-indigo-400 shadow"
                  />
                  {/* Ma'lumotlar */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <Tooltip title={`${user.firstName} ${user.lastName}`} arrow>
                      <h2 className="font-bold text-lg truncate text-indigo-400">
                        {user.firstName} {user.lastName}
                      </h2>
                    </Tooltip>
                    <Tooltip title={user.email} arrow>
                      <p className="text-sm opacity-80 truncate text-gray-400">
                        {user.email}
                      </p>
                    </Tooltip>
                    <p className="text-sm">
                      <span className="font-medium">💰 Balans:</span>{" "}
                      {user.wallet?.balance || "0"} so‘m
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">🧓 Yosh:</span> {user.age}
                    </p>
                  </div>
                </div>

                {/* Harakat tugmalari */}
                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  {/* Bloklash/Blokdan chiqarish */}
                  {user.blockedUser ? (
                    <Button
                      onClick={() => handleUnblock(user.id)}
                      color="success"
                      variant="outlined"
                      size="small"
                      startIcon={<Unlock className="w-4 h-4" />}
                      className="normal-case border-success-500 hover:bg-success-50"
                    >
                      Unblock
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleBlock(user.id)}
                      color="error"
                      variant="contained"
                      size="small"
                      startIcon={<Lock className="w-4 h-4" />}
                      className="normal-case"
                    >
                      Block
                    </Button>
                  )}

                  {/* Tahrirlash */}
                  <Button
                    onClick={() => handleEditOpen(user)}
                    color="primary"
                    variant="contained"
                    size="small"
                    startIcon={<Edit2 className="w-4 h-4" />}
                    className="normal-case"
                  >
                    Tahrirlash
                  </Button>

                  {/* O‘chirish (Dark/Light modega mos, danger rangda) */}
                  <Button
                    onClick={() => handleDelete(user.id)}
                    color="error"
                    variant="outlined"
                    size="small"
                    startIcon={<Trash2 className="w-4 h-4" />}
                    className="normal-case"
                    sx={{
                      borderColor: isDark ? "#ef4444" : "error.main",
                      color: isDark ? "#ef4444" : "error.main",
                      "&:hover": {
                        backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.04)",
                      },
                    }}
                  >
                    O‘chirish
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Sahifalash (Pagination) */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <IconButton
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              color="primary"
            >
              <ChevronLeft />
            </IconButton>

            <Typography variant="body1" className={isDark ? "text-gray-300" : "text-gray-700"}>
              Sahifa <span className="font-bold">{page}</span> /{" "}
              <span className="font-bold">{totalPages}</span>
            </Typography>

            <IconButton
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || totalPages === 0}
              color="primary"
            >
              <ChevronRight />
            </IconButton>
          </div>
        </>
      )}

      {/* ✏️ Tahrirlash Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <UserModal
          title="✏️ Foydalanuvchini tahrirlash"
          editUser={editUser}
          setEditUser={setEditUser}
          password={password}
          setPassword={setPassword}
          profileImg={profileImg}
          setProfileImg={setProfileImg}
          onSave={handleEditSave}
          onClose={() => setOpenEditModal(false)}
          error={error}
          isDark={isDark}
        />
      </Modal>

      {/* ➕ Qo‘shish Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <UserModal
          title="➕ Yangi bemor qo‘shish"
          editUser={editUser}
          setEditUser={setEditUser}
          password={password}
          setPassword={setPassword}
          profileImg={profileImg}
          setProfileImg={setProfileImg}
          onSave={handleAddUser}
          onClose={() => setOpenAddModal(false)}
          error={error}
          isDark={isDark}
        />
      </Modal>
    </div>
  );
}
