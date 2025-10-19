"use client";
import React, { useEffect, useState, useCallback } from "react";

// Axios importi
import axios, { isAxiosError } from "axios";
import {
  Search,
  Edit2,
  Trash2,
  Image,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Layers,
  DollarSign,
  CheckCircle,
  Info, // Yangi: To'liq ma'lumot tugmasi uchun
  Phone, // Yangi: Telefon raqami uchun
  Video, // Yangi: Video qo'shish uchun
  FileText, // Yangi: Qo'shimcha fayllar uchun
  Zap,
  Unlock,
  Lock, // Yangi: Futures uchun
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  List, // Yangi: To'liq ma'lumot uchun
  ListItem, // Yangi: To'liq ma'lumot uchun
  ListItemIcon, // Yangi: To'liq ma'lumot uchun
  ListItemText, // Yangi: To'liq ma'lumot uchun
} from "@mui/material";
import { useUserStore } from "@/store/UseUserStore";
import MaskedInput from 'react-text-mask'; // Telefon raqami maskasi uchun

// 📝 Doktor interfeysi (API talablariga moslashtirilgan)
interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  profileImg: string | null;
  isActive: boolean;
  blockedUser: any; // Bloklanganlik holati (agar mavjud bo'lsa)
  phoneNumber?: string; // Tahrirlash/Qo'shish uchun
  categoryId: string; // Majburiy maydon
  categoryName: string; // UI uchun
  bio: string; // Majburiy maydon
  dailySalary: number; // Majburiy maydon
  published: boolean; // Nashr holati
  images?: string[]; // Rasmlar URL array
  videos?: string[]; // Videolar URL array
  files?: string[]; // Fayllar URL array (API da borligi uchun qo'shildi)
  futures?: string[]; // Kelajakdagi imkoniyatlar (API da borligi uchun qo'shildi)
  free?: boolean; // Bepulmi? (Tahrirlash uchun)
}

// 🌐 Mock kategoriya ma'lumotlari (API mavjud bo'lmagani uchun vaqtinchalik)
interface Category {
  id: string;
  name: string;
}
const mockCategories: Category[] = [
    { id: "55023a8d-df1a-4e73-8850-6d00e7b59ca9", name: "Okulist" },
    { id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d", name: "Kardiolog" },
    { id: "98765432-10ab-cdef-fedc-ba9876543210", name: "Pediatr" },
    { id: "c7e8f9a0-b1c2-d3e4-f5a6-b7c8d9e0f1a2", name: "Dermatolog" },
];

// 📞 Telefon Raqami Maskasi
const phoneNumberMask = [
    "+", "9", "9", "8", " ", "(", /[1-9]/, /\d/, ")", " ", /\d/, /\d/, /\d/, "-", /\d/, /\d/, "-", /\d/, /\d/
]; // +998 (XX) XXX-XX-XX

// 🔧 Qayta foydalaniladigan Doktor Modal komponenti
function DoctorModal({
  title,
  selectedDoctor,
  setSelectedDoctor,
  password,
  setPassword,
  profileImg,
  setProfileImg,
  onSave,
  onClose,
  error,
  isDark,
  isEdit,
}: any) {
  
  // Dark Mode Style
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

  const formControlStyle = {
    ...inputStyle,
    "& .MuiOutlinedInput-root": {
      ...inputStyle["& .MuiOutlinedInput-root"],
      color: isDark ? "white" : "black",
    },
  };
  
  // 📹 Video URL ni qo'shish/o'chirish
  const handleAddVideo = () => {
    setSelectedDoctor({
        ...selectedDoctor,
        videos: [...(selectedDoctor.videos || []), ""],
    });
  };

  const handleVideoChange = (index: number, value: string) => {
    const newVideos = [...(selectedDoctor.videos || [])];
    newVideos[index] = value;
    setSelectedDoctor({ ...selectedDoctor, videos: newVideos });
  };

  const handleRemoveVideo = (index: number) => {
    const newVideos = [...(selectedDoctor.videos || [])].filter((_, i) => i !== index);
    setSelectedDoctor({ ...selectedDoctor, videos: newVideos });
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
        maxHeight: "90vh",
        overflowY: "auto",
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

      {selectedDoctor && (
        <form onSubmit={onSave} className="flex flex-col gap-4">
          {/* 1. Shaxsiy ma'lumotlar */}
          <Typography variant="subtitle1" sx={{ mt: 1, color: isDark ? 'rgb(165 180 252)' : '#1976d2' }} className="font-semibold">Shaxsiy ma'lumotlar</Typography>
          <TextField
            label="Ism"
            value={selectedDoctor.firstName}
            onChange={(e) =>
              setSelectedDoctor({ ...selectedDoctor, firstName: e.target.value })
            }
            fullWidth
            sx={inputStyle}
            required
            variant="outlined"
            size="small"
            disabled={isEdit} // Tahrirlashda ism o'zgarmas bo'lishi mumkin
          />
          <TextField
            label="Familiya"
            value={selectedDoctor.lastName}
            onChange={(e) =>
              setSelectedDoctor({ ...selectedDoctor, lastName: e.target.value })
            }
            fullWidth
            sx={inputStyle}
            required
            variant="outlined"
            size="small"
            disabled={isEdit}
          />
          <TextField
            label="Email"
            value={selectedDoctor.email}
            onChange={(e) =>
              setSelectedDoctor({ ...selectedDoctor, email: e.target.value })
            }
            fullWidth
            sx={inputStyle}
            required
            type="email"
            variant="outlined"
            size="small"
            disabled={isEdit}
          />
          <TextField
            label="Yosh"
            type="number"
            value={selectedDoctor.age}
            onChange={(e) =>
              setSelectedDoctor({
                ...selectedDoctor,
                age: Number(e.target.value),
              })
            }
            fullWidth
            sx={inputStyle}
            required
            variant="outlined"
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
            disabled={isEdit}
          />
          {/* 📞 Telefon Raqami (Faqat Tahrirlashda kerak) */}
          <TextField
  label="Telefon raqam"
  value={selectedDoctor.phoneNumber || '+998'}
  onChange={(e) =>
    setSelectedDoctor({ ...selectedDoctor, phoneNumber: e.target.value })
  }
  fullWidth
  sx={inputStyle}
  variant="outlined"
  size="small"
  InputProps={{
    inputComponent: IMaskInput as any,
    inputProps: {
      mask: '+{998} 00 000-00-00', // 📞 +998 XX XXX-XX-XX format
    },
  }}
/>
          <TextField
            label="Parol (faqat qo'shishda/o'zgartirishda)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={inputStyle}
            required={!isEdit} // Qo'shishda majburiy
            variant="outlined"
            size="small"
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<Image />}
            sx={{ textTransform: "none" }}
          >
            {profileImg
              ? profileImg.name
              : selectedDoctor.profileImg ? "Yangi rasmni tanlash" : "Profil rasmini tanlash"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setProfileImg(e.target.files?.[0] || null)}
            />
          </Button>

          {/* 2. Doktor ma'lumotlari */}
          <Typography variant="subtitle1" sx={{ mt: 2, color: isDark ? 'rgb(165 180 252)' : '#1976d2' }} className="font-semibold">
            Doktorlik ma'lumotlari
          </Typography>

          <FormControl fullWidth size="small" sx={formControlStyle} required>
            <InputLabel id="category-label">Kategoriya *</InputLabel>
            <Select
              labelId="category-label"
              value={selectedDoctor.categoryId || ""}
              label="Kategoriya *"
              onChange={(e) =>
                setSelectedDoctor({
                  ...selectedDoctor,
                  categoryId: e.target.value,
                })
              }
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: isDark ? "#374151" : "white",
                    "& .MuiMenuItem-root": {
                      color: isDark ? "white" : "black",
                      "&:hover": {
                        bgcolor: isDark ? "#4b5563" : "#f0f0f0",
                      },
                    },
                  },
                },
              }}
            >
              {mockCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Kunlik maosh (so'mda) *"
            type="number"
            value={selectedDoctor.dailySalary}
            onChange={(e) =>
              setSelectedDoctor({
                ...selectedDoctor,
                dailySalary: Number(e.target.value),
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
            label="Biografiya (Bio) *"
            multiline
            rows={3}
            value={selectedDoctor.bio}
            onChange={(e) =>
              setSelectedDoctor({ ...selectedDoctor, bio: e.target.value })
            }
            fullWidth
            sx={inputStyle}
            required
            variant="outlined"
            size="small"
          />
          
          {/* 📹 Video URL qo'shish (Faqat tahrirlashda) */}
          {isEdit && (
            <>
                <Typography variant="subtitle2" sx={{ mt: 1, color: isDark ? 'rgb(165 180 252)' : '#1976d2' }} className="font-semibold flex items-center gap-1">
                    <Video className="w-4 h-4" /> Videolar URL (Serverga yuborish uchun)
                </Typography>
                {(selectedDoctor.videos || []).map((videoUrl: string, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                        <TextField
                            label={`Video URL ${index + 1}`}
                            value={videoUrl}
                            onChange={(e) => handleVideoChange(index, e.target.value)}
                            fullWidth
                            sx={inputStyle}
                            variant="outlined"
                            size="small"
                        />
                        <IconButton onClick={() => handleRemoveVideo(index)} color="error" size="small">
                            <Trash2 className="w-5 h-5" />
                        </IconButton>
                    </div>
                ))}
                <Button
                    onClick={handleAddVideo}
                    startIcon={<PlusCircle />}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: "none" }}
                >
                    Video qo'shish
                </Button>
            </>
          )}

          {/* Qo'shimcha maydonlar (tahrirlash uchun bo'lishi mumkin) */}
          {isEdit && (
            <FormControl fullWidth size="small" sx={{...formControlStyle, mt: 1}}>
                <InputLabel id="free-label">Bepul xizmat?</InputLabel>
                <Select
                    labelId="free-label"
                    value={selectedDoctor.free === undefined ? 'false' : String(selectedDoctor.free)}
                    label="Bepul xizmat?"
                    onChange={(e) =>
                        setSelectedDoctor({
                            ...selectedDoctor,
                            free: e.target.value === 'true',
                        })
                    }
                    MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? "#374151" : "white" } } }}
                >
                    <MenuItem value={'false'}>Yo'q</MenuItem>
                    <MenuItem value={'true'}>Ha</MenuItem>
                </Select>
            </FormControl>
          )}


          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
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

// ℹ️ Doktor To'liq Ma'lumot Modali
function DoctorInfoModal({ doctor, onClose, isDark }: { doctor: Doctor, onClose: () => void, isDark: boolean }) {
    const defaultColor = isDark ? "white" : "black";
    const highlightColor = isDark ? "#4ade80" : "#10b981"; // Green-400/500

    // List item uslubi
    const listItemStyle = {
        py: 1, 
        px: 0,
        borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        "&:last-child": { borderBottom: 'none' }
    };
    
    // Serverdan kelgan rasmlarni URL formatida ko'rsatish funksiyasi
    const renderMediaList = (items: string[] | undefined, icon: React.ReactNode, title: string) => {
      if (!items) return null;

      // ⚙️ Har doim arrayga aylantiramiz
      const safeItems = Array.isArray(items)
          ? items
          : typeof items === "string"
          ? [items]
          : [];
  
      if (safeItems.length === 0) return null;



        return (
            <Box sx={{ mt: 3, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ color: highlightColor, fontWeight: 'bold', mb: 1 }}>
                    {title} ({items.length})
                </Typography>
                <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {items.map((url, index) => (
                        <ListItem key={index} sx={listItemStyle}>
                            <ListItemIcon sx={{ minWidth: 30, color: highlightColor }}>{icon}</ListItemIcon>
                            <ListItemText 
                                primary={
                                    <Tooltip title={url} arrow>
                                        <Typography component="a" href={url} target="_blank" rel="noopener noreferrer" 
                                            sx={{ 
                                                fontSize: '0.875rem', 
                                                color: defaultColor, 
                                                cursor: 'pointer', 
                                                textDecoration: 'underline', 
                                                '&:hover': { opacity: 0.8 }
                                            }}
                                            className="truncate"
                                        >
                                            {url}
                                        </Typography>
                                    </Tooltip>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: isDark ? "#1f2937" : "white",
                color: defaultColor,
                borderRadius: 4,
                boxShadow: 24,
                p: 4,
                width: "90%",
                maxWidth: 600,
                outline: "none",
                maxHeight: "90vh",
                overflowY: "auto",
            }}
        >
            <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: "bold", color: highlightColor }}>
                {doctor.firstName} {doctor.lastName} - To'liq Ma'lumot
            </Typography>

            <List>
                <ListItem sx={listItemStyle}>
                    <ListItemIcon><Phone className="w-5 h-5 text-blue-400" /></ListItemIcon>
                    <ListItemText primary={<span className="font-semibold">Telefon:</span>} secondary={doctor.phoneNumber || "Kiritilmagan"} />
                </ListItem>
                <ListItem sx={listItemStyle}>
                    <ListItemIcon><Layers className="w-5 h-5 text-blue-400" /></ListItemIcon>
                    <ListItemText primary={<span className="font-semibold">Kategoriya:</span>} secondary={doctor.categoryName || "Noma'lum"} />
                </ListItem>
                <ListItem sx={listItemStyle}>
                    <ListItemIcon><DollarSign className="w-5 h-5 text-blue-400" /></ListItemIcon>
                    <ListItemText primary={<span className="font-semibold">Kunlik maosh:</span>} secondary={`${new Intl.NumberFormat('uz-UZ').format(doctor.dailySalary || 0)} so‘m`} />
                </ListItem>
                <ListItem sx={listItemStyle}>
                    <ListItemIcon><CheckCircle className="w-5 h-5 text-blue-400" /></ListItemIcon>
                    <ListItemText primary={<span className="font-semibold">Nashr holati:</span>} secondary={doctor.published ? "Nashr qilingan (✅)" : "Nashrdan olingan (🛑)"} />
                </ListItem>
                <ListItem sx={listItemStyle}>
                    <ListItemIcon><CheckCircle className="w-5 h-5 text-blue-400" /></ListItemIcon>
                    <ListItemText primary={<span className="font-semibold">Bepul xizmat:</span>} secondary={doctor.free ? "Ha (🟢)" : "Yo'q (🔴)"} />
                </ListItem>
                <ListItem sx={listItemStyle}>
                    <ListItemIcon><FileText className="w-5 h-5 text-blue-400" /></ListItemIcon>
                    <ListItemText primary={<span className="font-semibold">Biografiya:</span>} secondary={doctor.bio || "Kiritilmagan"} />
                </ListItem>
            </List>

            {/* Qo'shimcha ma'lumotlar: Images, Videos, Files, Futures */}
            <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }}>
                {renderMediaList(doctor.images, <Image className="w-4 h-4" />, "Rasmlar")}
                {renderMediaList(doctor.videos, <Video className="w-4 h-4" />, "Videolar")}
                {renderMediaList(doctor.files, <FileText className="w-4 h-4" />, "Fayllar")}
                
                {doctor.futures && doctor.futures.length > 0 && (
                    <Box sx={{ mt: 3, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: highlightColor, fontWeight: 'bold', mb: 1 }}>
                            Kelajakdagi imkoniyatlar ({doctor.futures.length})
                        </Typography>
                        <List dense>
                            {doctor.futures.map((future, index) => (
                                <ListItem key={index} sx={listItemStyle}>
                                    <ListItemIcon sx={{ minWidth: 30, color: highlightColor }}><Zap className="w-4 h-4" /></ListItemIcon>
                                    <ListItemText primary={future} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <Button onClick={onClose} color="inherit" variant="outlined" className="normal-case">
                    Yopish
                </Button>
            </Box>
        </Box>
    );
}

// 💻 Doktorlar Ro'yxati Komponenti
export default function Doctorlar() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useUserStore(); // isDark store dan olinyapti
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alert, setAlert] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false); // Yangi: To'liq ma'lumot modali
  const [password, setPassword] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limit = 9;
  const token = localStorage.getItem("accessToken");
  const Base_url = "https://faxriddin.bobur-dev.uz";

  // 🟢 Doktorlarni olish (GET /admin/doctors)
  const fetchDoctors = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${Base_url}/admin/doctors`, {
        params: { limit, page, firstName:search }, 
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // API ma'lumotlarini Doctor interfeysiga moslashtirish va categoryName qo'shish
      const fetchedDoctors: Doctor[] = res.data.data.map((doc: any) => {
          const profile = doc.doctorProfile || {};

          // console.log(profile.salary[0].daily);
          
          return {
              id: doc.id,
              firstName: doc.firstName,
              lastName: doc.lastName,
              email: doc.email,
              age: doc.age || 0,
              profileImg: doc.profileImg || null,
              isActive: doc.isActive,
              blockedUser: doc.blockedUser,
              phoneNumber: doc.phoneNumber || '', // Telefon raqami qo'shildi
              categoryId: profile.categoryId || mockCategories[0].id,
              categoryName: profile.category?.name || "Kategoriya yo‘q",
              bio: profile.bio || "",
              dailySalary: profile.salary && profile.salary.length > 0 ? profile.salary[0].daily : 0,
              published: profile.published || false,
              images: profile.images || [],
              videos: profile.videos || [],
              files: profile.files || [],
              futures: profile.futures || [],
              free: profile.free || false, // free maydoni qo'shildi
          };
      });

      setDoctors(fetchedDoctors);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error(err);
      setAlert("❌ Doktorlar ma'lumotlarini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [page, search, token, limit]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const showAlert = (text: string) => {
    setAlert(text);
    setTimeout(() => setAlert(""), 5000); // 5 sekundga uzaytirildi
  };

  // 🔍 Qidiruv
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  // 🔄 Nashr holatini o'zgartirish (PUT /admin/doctor/{id}/publish/{status})
  const handlePublishToggle = async (doctorId: string, isPublished: boolean) => {
    try {
      const newStatus = !isPublished;
      await axios.put(
        `${Base_url}/admin/doctor/${doctorId}/publish/${newStatus}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDoctors();
      showAlert(
        newStatus
          ? "✅ Doktor profili nashr qilindi"
          : "🛑 Doktor profili nashrdan olindi"
      );
    } catch (err) {
      if(isAxiosError(err)){
        // Server xatosini chiqarish
        const serverMessage = err.response?.data?.message?.message || err.response?.data?.message || err.message;
        showAlert(`❌ ${serverMessage} `)
      } else {
        showAlert("❌ Nashr holatini o‘zgartirishda kutilmagan xatolik yuz berdi");
      }
    }
  };

  // ✏️ Tahrirlash modalni ochish
  const handleEditOpen = (doctor: Doctor) => {
    // Tahrirlash uchun mavjud kategoriya ID ni to'g'ri o'rnatish
    const initialCategory = mockCategories.find(c => c.name === doctor.categoryName) || mockCategories[0];
    
    setSelectedDoctor({
        ...doctor,
        categoryId: initialCategory.id, // ID ni o'rnatish
        videos: doctor.videos || [], // Agar videos bo'lmasa, bo'sh array
        phoneNumber: doctor.phoneNumber || '+998', // Telefon raqami +998 bilan
    });
    setPassword("");
    setProfileImg(null);
    setError(null);
    setOpenEditModal(true);
  };
  
  // ℹ️ To'liq ma'lumot modalini ochish
  const handleInfoOpen = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setOpenInfoModal(true);
  };
  

  // ➕ Yangi doktor qo‘shish (POST /admin/create/doctor)
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    // Telefon raqamini tozalash (+998 va bo'shliqlarni olib tashlash)
    const rawPhoneNumber = selectedDoctor.phoneNumber?.replace(/[\s()+-]/g, '');
    const isPhoneNumberValid = rawPhoneNumber && rawPhoneNumber.length >= 12; // Minimal 998XXXXXXXXX

    if (
      !selectedDoctor.firstName ||
      !selectedDoctor.lastName ||
      !selectedDoctor.email ||
      !password ||
      !selectedDoctor.categoryId ||
      !selectedDoctor.bio ||
      !selectedDoctor.dailySalary ||
      !selectedDoctor.age ||
      !isPhoneNumberValid
    ) {
      setError("Barcha belgili (*) maydonlar, shu jumladan to'g'ri kiritilgan telefon raqami (+998 bilan) majburiy!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstName", selectedDoctor.firstName);
      formData.append("lastName", selectedDoctor.lastName);
      formData.append("email", selectedDoctor.email);
      formData.append("password", password);
      formData.append("age", selectedDoctor.age.toString());
      formData.append("categoryId", selectedDoctor.categoryId);
      formData.append("bio", selectedDoctor.bio);
      formData.append("dailySalary", selectedDoctor.dailySalary.toString());
      formData.append("phoneNumber", rawPhoneNumber || ''); // Serverga tozalangan raqam

      if (profileImg) {
        formData.append("profileImg", profileImg);
      }
      
      // API talabiga ko'ra bo'sh array JSON string sifatida yuboriladi
      formData.append("images", JSON.stringify([])); 
      formData.append("videos", JSON.stringify([])); 
      formData.append("files", JSON.stringify([]));
      formData.append("futures", JSON.stringify([]));

      await axios.post(`${Base_url}/admin/create/doctor`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setOpenAddModal(false);
      fetchDoctors();
      showAlert("🟢 Yangi doktor qo‘shildi");
    } catch (err) {
      console.error(err);
      if(isAxiosError(err)){
        const serverMessage = err.response?.data?.message?.message || err.response?.data?.message || err.message;
        setError(`❌ Xatolik: ${serverMessage}`);
      } else {
        setError(`❌ Kutilmagan xatolik: doktor qo‘shilmadi`);
      }
    }
  };

  // 💾 Tahrirni saqlash (PATCH /doctor-profile/update/{id})
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    if (!selectedDoctor.categoryId || !selectedDoctor.bio || !selectedDoctor.dailySalary) {
      setError("Kategoriya, Biografiya va Maosh majburiy!");
      return;
    }

    // Telefon raqamini tekshirish va tozalash
    const rawPhoneNumber = selectedDoctor.phoneNumber?.replace(/[\s()+-]/g, '');
    const isPhoneNumberValid = rawPhoneNumber && rawPhoneNumber.length >= 12;

    if (!isPhoneNumberValid) {
        setError("Telefon raqami noto'g'ri formatda yoki to'liq kiritilmagan (+998 bilan)");
        return;
    }

    try {
      const formData = new FormData();
      // Faqat o'zgarishi mumkin bo'lgan maydonlar (API talabiga ko'ra)
      formData.append("categoryId", selectedDoctor.categoryId);
      formData.append("bio", selectedDoctor.bio);
      formData.append("dailySalary", selectedDoctor.dailySalary.toString());
      formData.append("phoneNumber", rawPhoneNumber); // Yangi telefon raqami

      if (selectedDoctor.free !== undefined) {
        // free boolean ni string sifatida yuborish
         formData.append("free", String(selectedDoctor.free));
      }
      if (password) {
        formData.append("password", password); // Agar parolni o'zgartirish kerak bo'lsa
      }
      if (profileImg) {
        formData.append("profileImg", profileImg); // Yangi profil rasmi
      }
      
      // Video URL larini JSON string sifatida yuborish (qo'shish/o'zgartirish)
      formData.append("videos", JSON.stringify(selectedDoctor.videos || [])); 
      
      // API talabiga ko'ra, agar rasmlar, fayllar, futures o'zgarmasa bo'sh array string yuborilishi kerak
      // Lekin tahrirlashda ularni qo'shish logikasi yo'q, shuning uchun faqat mavjudlarini o'zgarishsiz qoldiramiz.
      // Agar API ularni doimo talab qilsa, ularni JSON.stringify([]) orqali yuborish kerak:
      // formData.append("images", JSON.stringify(selectedDoctor.images || [])); 
      // formData.append("files", JSON.stringify(selectedDoctor.files || []));
      // formData.append("futures", JSON.stringify(selectedDoctor.futures || []));


      await axios.patch(
        `${Base_url}/doctor-profile/update/${selectedDoctor.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setOpenEditModal(false);
      fetchDoctors();
      showAlert("✏️ Doktor ma’lumotlari yangilandi");
    } catch (err) {
      console.error(err);
      if(isAxiosError(err)){
        const serverMessage = err.response?.data?.message?.message || err.response?.data?.message || err.message;
        setError(`❌ Xatolik: ${serverMessage}`);
      } else {
        setError(`❌ Kutilmagan xatolik: ma’lumot yangilanmadi!`);
      }
    }
  };
  
  // 🗑️ O‘chirish (DELETE /admin/delete)
  const handleDelete = async (doctorId: string) => {
    if (!window.confirm("Rostdan ham doktor profilini o‘chirmoqchimisiz?")) return;
    try {
        await axios.delete(`${Base_url}/admin/delete`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { userId: doctorId }, 
        });
        fetchDoctors();
        showAlert("🗑️ Doktor profili o‘chirildi");
    } catch (err) {
        console.error(err);
        if(isAxiosError(err)){
            const serverMessage = err.response?.data?.message?.message || err.response?.data?.message || err.message;
            showAlert(`❌ O‘chirishda xatolik yuz berdi: ${serverMessage}`);
        } else {
            showAlert("❌ O‘chirishda kutilmagan xatolik yuz berdi");
        }
    }
  };


  const handleBlock = async (userId: string) => {
    try {
      await axios.post(
        `${Base_url}/admin/block/user`,
        { userId, reason: "Qoidabuzarlik" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDoctors();
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
      fetchDoctors();
      showAlert("✅ Foydalanuvchi blokdan chiqarildi");
    } catch (err) {
      console.error(err);
      showAlert("❌ Blokdan chiqarishda xatolik yuz berdi");
    }
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 transition-colors rounded-xl shadow-lg ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 border-b pb-4">
        <h1 className="text-3xl font-extrabold mb-3 sm:mb-0 text-green-500">
          <span role="img" aria-label="doctor">
            👨‍⚕️
          </span>{" "}
          Doktorlar Ro‘yxati
        </h1>
        <div className="flex gap-4">
          <Button
            variant="contained"
            startIcon={<PlusCircle />}
            onClick={() => {
              setSelectedDoctor({
                id: "",
                firstName: "",
                lastName: "",
                email: "",
                age: 30,
                profileImg: null,
                isActive: true,
                blockedUser: null,
                phoneNumber: '+998', // Default telefon raqami
                categoryId: mockCategories[0].id, // Default kategoriya
                categoryName: mockCategories[0].name,
                bio: "",
                dailySalary: 100000,
                published: false,
                images: [],
                videos: [],
                files: [],
                futures: [],
                free: false,
              });
              setPassword("");
              setProfileImg(null);
              setError(null);
              setOpenAddModal(true);
            }}
            className="normal-case bg-green-500 hover:bg-green-600"
            color="success"
          >
            Yangi doktor qo‘shish
          </Button>
        </div>
      </div>

      {/* 🔍 Qidiruv */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-2 mb-6"
      >
        <input
          type="text"
          placeholder="Ism/familiya bo‘yicha qidirish..."
          className={`px-4 py-3 rounded-lg w-full transition-shadow focus:shadow-md outline-none border ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white focus:border-green-500"
              : "bg-gray-50 border-gray-300 focus:border-green-500"
          }`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<Search />}
          className="normal-case h-auto"
          color="success"
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
          <CircularProgress color="success" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-10 rounded-xl bg-gray-50/10 border border-dashed border-gray-300/20 mt-10">
          <p className="text-lg text-gray-400">
            ❌ Hech qanday doktor topilmadi
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 ${
                  doctor.published ? "border-green-500" : "border-yellow-500"
                } ${isDark ? "bg-gray-800/80" : "bg-white"}`}
              >
                <div className="flex items-start gap-4">
                  {/* Profil rasmi */}
                  <img
                    src={
                      doctor.profileImg ||
                      `https://placehold.co/60x60/10b981/ffffff?text=${doctor.firstName.charAt(0).toUpperCase()}`
                    }
                    alt={`${doctor.firstName} ${doctor.lastName}`}
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/60x60/10b981/ffffff?text=D")
                    }
                    className="w-16 h-16 min-w-16 min-h-16 rounded-full object-cover border-2 border-green-400 shadow"
                  />
                  {/* Ma'lumotlar */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <Tooltip title={`${doctor.firstName} ${doctor.lastName}`} arrow>
                      <h2 className="font-bold text-lg truncate text-green-400">
                        {doctor.firstName} {doctor.lastName}
                      </h2>
                    </Tooltip>
                    <Tooltip title={doctor.email} arrow>
                      <p className="text-sm opacity-80 truncate text-gray-400">
                        {doctor.email}
                      </p>
                    </Tooltip>
                    <p className="text-sm flex items-center gap-1">
                      <Layers className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Kategoriya:</span>{" "}
                      {doctor.categoryName}
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">Kunlik maosh:</span>{" "}
                      {new Intl.NumberFormat('uz-UZ').format(doctor.dailySalary) || "0"} so‘m
                    </p>
                  </div>
                </div>

                {/* Harakat tugmalari */}
                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  
                  {/* ℹ️ To'liq ma'lumot */}
                  <Button
                      onClick={() => handleInfoOpen(doctor)}
                      color="info"
                      variant="outlined"
                      size="small"
                      startIcon={<Info className="w-4 h-4" />}
                      className="normal-case"
                  >
                      To'liq ma'lumot
                  </Button>
                  
                  {/* Nashr qilish/Nashrdan olish */}
                  {doctor.published ? (
                    <Button
                      onClick={() => handlePublishToggle(doctor.id, true)}
                      color="warning"
                      variant="contained"
                      size="small"
                      startIcon={<XCircle className="w-4 h-4" />}
                      className="normal-case"
                    >
                      Nashrdan olish
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePublishToggle(doctor.id, false)}
                      color="success"
                      variant="outlined"
                      size="small"
                      startIcon={<CheckCircle className="w-4 h-4" />}
                      className="normal-case"
                    >
                      Nashr qilish
                    </Button>
                  )}

                  {/* Tahrirlash */}
                  <Button
                    onClick={() => handleEditOpen(doctor)}
                    color="primary"
                    variant="contained"
                    size="small"
                    startIcon={<Edit2 className="w-4 h-4" />}
                    className="normal-case"
                  >
                    Tahrirlash
                  </Button>

                  {/* O‘chirish */}
                  <Button
                    onClick={() => handleDelete(doctor.id)}
                    color="error"
                    variant="outlined"
                    size="small"
                    startIcon={<Trash2 className="w-4 h-4" />}
                    className="normal-case"
                    sx={{
                      borderColor: isDark ? "#ef4444" : "error.main",
                      color: isDark ? "#ef4444" : "error.main",
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(239, 68, 68, 0.04)",
                      },
                    }}
                  >
                    O‘chirish
                  </Button>


                  {doctor.blockedUser ? (
                    <Button
                      onClick={() => handleUnblock(doctor.id)}
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
                      onClick={() => handleBlock(doctor.id)}
                      color="error"
                      variant="contained"
                      size="small"
                      startIcon={<Lock className="w-4 h-4" />}
                      className="normal-case"
                    >
                      Block
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center mt-8 gap-4">
            <IconButton
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              color="success"
            >
              <ChevronLeft />
            </IconButton>

            <Typography
              variant="body1"
              className={isDark ? "text-gray-300" : "text-gray-700"}
            >
              Sahifa <span className="font-bold">{page}</span> /{" "}
              <span className="font-bold">{totalPages}</span>
            </Typography>

            <IconButton
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={page === totalPages || totalPages === 0}
              color="success"
            >
              <ChevronRight />
            </IconButton>
          </div>
        </>
      )}

      {/* ✏️ Tahrirlash Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <DoctorModal
          title="✏️ Doktor ma'lumotlarini tahrirlash"
          selectedDoctor={selectedDoctor}
          setSelectedDoctor={setSelectedDoctor}
          password={password}
          setPassword={setPassword}
          profileImg={profileImg}
          setProfileImg={setProfileImg}
          onSave={handleEditSave}
          onClose={() => setOpenEditModal(false)}
          error={error}
          isDark={isDark}
          isEdit={true}
        />
      </Modal>

      {/* ➕ Qo‘shish Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <DoctorModal
          title="➕ Yangi doktor qo‘shish"
          selectedDoctor={selectedDoctor}
          setSelectedDoctor={setSelectedDoctor}
          password={password}
          setPassword={setPassword}
          profileImg={profileImg}
          setProfileImg={setProfileImg}
          onSave={handleAddDoctor}
          onClose={() => setOpenAddModal(false)}
          error={error}
          isDark={isDark}
          isEdit={false}
        />
      </Modal>
      
      {/* ℹ️ To'liq Ma'lumot Modali */}
      <Modal open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
          {selectedDoctor ? (
              <DoctorInfoModal
                  doctor={selectedDoctor}
                  onClose={() => setOpenInfoModal(false)}
                  isDark={isDark}
              />
          ) : (
              <div />
          )}
      </Modal>
    </div>
  );
}