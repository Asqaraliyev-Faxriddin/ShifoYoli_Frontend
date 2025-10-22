"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  Info,
  Phone,
  Video,
  FileText,
  Zap,
  Unlock,
  Lock,
  Delete,
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useUserStore } from "@/store/UseUserStore";

// -------------------- Interfaces --------------------
interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  doctorProfileId?: string;
  profileImg: string | null;
  isActive: boolean;
  blockedUser: unknown;
  categoryId: string;
  categoryName?: string;
  bio: string;
  dailySalary: number;
  published?: boolean;
  images?: (string | File)[];
  videos?: (string | File)[];
  files?: (string | File)[];
  futures?: string[];
  free?: boolean;
  phoneNumber?: string;
}

interface DoctorProfile {
  id: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  bio?: string;
  salary?: {
    daily: number;
  }[];
  published?: boolean;
  images?: string[];
  videos?: string[];
  files?: string[];
  futures?: string[];
  free?: boolean;
}

interface Category {
  id: string;
  name: string;
}

// -------------------- Mock categories --------------------
const mockCategories: Category[] = [
  { id: "55023a8d-df1a-4e73-8850-6d00e7b59ca9", name: "Okulist" },
  { id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d", name: "Kardiolog" },
  { id: "98765432-10ab-cdef-fedc-ba9876543210", name: "Pediatr" },
  { id: "c7e8f9a0-b1c2-d3e4-f5a6-b7c8d9e0f1a2", name: "Dermatolog" },
];


interface DoctorModalProps {
  title: string;
  selectedDoctor: Doctor ;
  setSelectedDoctor: React.Dispatch<React.SetStateAction<Doctor>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  profileImg: File | null;
  setProfileImg: React.Dispatch<React.SetStateAction<File | null>>;
  onSave: () => void;
  onClose: () => void;
  error?: string | null;
  isDark: boolean;
  isEdit: boolean;
  imagesState: File[];
  setImagesState: React.Dispatch<React.SetStateAction<File[]>>;
  videosState: File[];
  setVideosState: React.Dispatch<React.SetStateAction<File[]>>;
  filesState: File[];
  setFilesState: React.Dispatch<React.SetStateAction<File[]>>;
  futuresState: string[];
  setFuturesState: React.Dispatch<React.SetStateAction<string[]>>;
  futureInput: string;
  setFutureInput: React.Dispatch<React.SetStateAction<string>>;
}

// -------------------- DoctorModal (improved) --------------------
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
  imagesState,
  setImagesState,
  videosState,
  setVideosState,
  filesState,
  setFilesState,
  futuresState,
  setFuturesState,
  futureInput,
  setFutureInput,
}:DoctorModalProps) {
  // Styles
  const inputStyle = {
    "& .MuiInputBase-input": {
      color: isDark ? "white" : "black",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0,0,0,0.12)",
      },
      "&:hover fieldset": {
        borderColor: isDark ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.24)",
      },
      "&.Mui-focused fieldset": {
        borderColor: isDark ? "#60a5fa" : "#1976d2",
      },
    },
    "& .MuiInputLabel-root": {
      color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
    },
  };

  const formCardStyle = {
    mb: 2,
    bgcolor: isDark ? "#111827" : "#ffffff",
    borderRadius: 2,
    boxShadow: isDark ? "0 6px 18px rgba(0,0,0,0.6)" : "0 6px 18px rgba(16,24,40,0.06)",
  };

  // File handlers
  const onProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setProfileImg(f);
  };

  const onImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImagesState([...imagesState, ...files]);
  };

  const onVideosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setVideosState([...videosState, ...files]);
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFilesState([...filesState, ...files]);
  };

  const removeImageAt = (idx: number) => {
    const copy = [...imagesState];
    copy.splice(idx, 1);
    setImagesState(copy);
    // sync to selectedDoctor.images if necessary
    setSelectedDoctor({ ...selectedDoctor, images: copy });
  };

  const removeVideoAt = (idx: number) => {
    const copy = [...videosState];
    copy.splice(idx, 1);
    setVideosState(copy);
    setSelectedDoctor({ ...selectedDoctor, videos: copy });
  };

  const removeFileAt = (idx: number) => {
    const copy = [...filesState];
    copy.splice(idx, 1);
    setFilesState(copy);
    setSelectedDoctor({ ...selectedDoctor, files: copy });
  };

  const addFuture = () => {
    const val = (futureInput || "").trim();
    if (!val) return;
    const copy = [...(futuresState || []), val];
    setFuturesState(copy);
    setSelectedDoctor({ ...selectedDoctor, futures: copy });
    setFutureInput("");
  };

  const removeFutureAt = (idx: number) => {
    const copy = [...(futuresState || [])];
    copy.splice(idx, 1);
    setFuturesState(copy);
    setSelectedDoctor({ ...selectedDoctor, futures: copy });
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: isDark ? "#0b1220" : "#f8fafc",
        color: isDark ? "white" : "black",
        borderRadius: 3,
        boxShadow: 28,
        p: { xs: 3, md: 5 },
        width: { xs: "95%", md: 720 },
        maxHeight: "92vh",
        overflowY: "auto",
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {title}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Personal Card */}
      <Card sx={{ ...formCardStyle }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Shaxsiy ma'lumotlar
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField
              label="Ism *"
              value={selectedDoctor?.firstName || ""}
              onChange={(e) => setSelectedDoctor({ ...selectedDoctor, firstName: e.target.value })}
              fullWidth
              sx={inputStyle}
              size="small"
              required
            />
            <TextField
              label="Familiya *"
              value={selectedDoctor?.lastName || ""}
              onChange={(e) => setSelectedDoctor({ ...selectedDoctor, lastName: e.target.value })}
              fullWidth
              sx={inputStyle}
              size="small"
              required
            />
            <TextField
              label="Email *"
              value={selectedDoctor?.email || ""}
              onChange={(e) => setSelectedDoctor({ ...selectedDoctor, email: e.target.value })}
              fullWidth
              sx={inputStyle}
              size="small"
              required
              type="email"
            />
            <TextField
              label="Yosh *"
              type="number"
              value={selectedDoctor?.age ?? 0}
              onChange={(e) => setSelectedDoctor({ ...selectedDoctor, age: Number(e.target.value) })}
              fullWidth
              sx={inputStyle}
              size="small"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Telefon"
              value={selectedDoctor?.phoneNumber || ""}
              onChange={(e) => setSelectedDoctor({ ...selectedDoctor, phoneNumber: e.target.value })}
              fullWidth
              sx={inputStyle}
              size="small"
              placeholder="+998 (XX) XXX-XX-XX"
            />
            <TextField
              label="Parol (faqat qo'shishda yoki o'zgartirishda)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={inputStyle}
              size="small"
              required={!isEdit}
              helperText={!isEdit ? "Kamida 8 ta belgi" : "Parolni o'zgartirish uchun kiriting (kamida 8 ta)"}
              inputProps={{ minLength: 8 }}
            />
          </div>

          <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Button variant="outlined" component="label" startIcon={<Image />} sx={{ textTransform: "none" }}>
              {profileImg ? profileImg.name : selectedDoctor?.profileImg ? "Yangi profil rasmini tanlash" : "Profil rasmini tanlash"}
              <input type="file" hidden accept="image/*" onChange={onProfileChange} />
            </Button>

            {/* preview small */}
            {profileImg ? (
              <Chip label={profileImg.name} onDelete={() => setProfileImg(null)} />
            ) : selectedDoctor?.profileImg ? (
              <a href={selectedDoctor.profileImg} target="_blank" rel="noreferrer">
                <Chip label="Serverdagi rasm" />
              </a>
            ) : null}
          </Box>
        </CardContent>
      </Card>

      {/* Doctor profile card */}
      <Card sx={{ ...formCardStyle }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Doktor ma'lumotlari
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormControl fullWidth size="small" sx={inputStyle}>
              <InputLabel id="category-label">Kategoriya *</InputLabel>
              <Select
                labelId="category-label"
                value={selectedDoctor?.categoryId || ""}
                label="Kategoriya *"
                onChange={(e) => setSelectedDoctor({ ...selectedDoctor, categoryId: e.target.value })}
                required
                size="small"
              >
                {mockCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Kunlik maosh (so'm) *"
              type="number"
              value={selectedDoctor?.dailySalary ?? 0}
              onChange={(e) => setSelectedDoctor({ ...selectedDoctor, dailySalary: Number(e.target.value) })}
              fullWidth
              sx={inputStyle}
              size="small"
              inputProps={{ min: 0 }}
              required
            />

            <TextField
              label="Biografiya (Bio) *"
              multiline
              rows={3}
              value={selectedDoctor?.bio ?? ""}
              onChange={(e) => setSelectedDoctor({ ...selectedDoctor, bio: e.target.value })}
              fullWidth
              sx={inputStyle}
              size="small"
              required
            />

            <FormControl fullWidth size="small" sx={inputStyle}>
              <InputLabel id="free-label">Bepul xizmat?</InputLabel>
              <Select
                labelId="free-label"
                value={String(selectedDoctor?.free ?? false)}
                label="Bepul xizmat?"
                onChange={(e) => setSelectedDoctor({ ...selectedDoctor, free: e.target.value === "true" })}
              >
                <MenuItem value={"false"}>Yo'q</MenuItem>
                <MenuItem value={"true"}>Ha</MenuItem>
              </Select>
            </FormControl>
          </div>
        </CardContent>
      </Card>

      {/* Media card */}
      <Card sx={{ ...formCardStyle }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Rasmlar / Videolar / Fayllar
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Button variant="outlined" component="label" size="small" startIcon={<Image />} sx={{ textTransform: "none" }}>
              Rasmlar (bir nechta)
              <input type="file" hidden accept="image/*" multiple onChange={onImagesChange} />
            </Button>

            <Button variant="outlined" component="label" size="small" startIcon={<Video />} sx={{ textTransform: "none" }}>
              Videolar (bir nechta)
              <input type="file" hidden accept="video/*" multiple onChange={onVideosChange} />
            </Button>

            <Button variant="outlined" component="label" size="small" startIcon={<FileText />} sx={{ textTransform: "none" }}>
              Fayllar (bir nechta)
              <input type="file" hidden multiple onChange={onFilesChange} />
            </Button>
          </Box>

          {/* Files lists */}
          <Box sx={{ display: "grid", gap: 2 }}>
            {/* Images */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Rasmlar ({imagesState.length})
              </Typography>
              {imagesState.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Hech qanday rasm tanlanmagan.</Typography>
              ) : (
                imagesState.map((f: File | string, idx: number) => (
                  <Box key={`img-${idx}`} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Image className="w-4 h-4" />
                    <Typography noWrap sx={{ maxWidth: 380 }}>
                      {typeof f === "string" ? f : f.name}
                    </Typography>
                    <IconButton size="small" color="error" onClick={() => removeImageAt(idx)}>
                      <Trash2 />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>

            {/* Videos */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Videolar ({videosState.length})
              </Typography>
              {videosState.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Hech qanday video tanlanmagan.</Typography>
              ) : (
                videosState.map((f: File | string, idx: number) => (
                  <Box key={`vid-${idx}`} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Video className="w-4 h-4" />
                    <Typography noWrap sx={{ maxWidth: 380 }}>{typeof f === "string" ? f : f.name}</Typography>
                    <IconButton size="small" color="error" onClick={() => removeVideoAt(idx)}>
                      <Trash2 />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>

            {/* Files */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Fayllar ({filesState.length})
              </Typography>
              {filesState.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Hech qanday fayl tanlanmagan.</Typography>
              ) : (
                filesState.map((f: File | string, idx: number) => (
                  <Box key={`file-${idx}`} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <FileText className="w-4 h-4" />
                    <Typography noWrap sx={{ maxWidth: 380 }}>{typeof f === "string" ? f : f.name}</Typography>
                    <IconButton size="small" color="error" onClick={() => removeFileAt(idx)}>
                      <Trash2 />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Futures */}
      <Card sx={{ ...formCardStyle }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Kelajakdagi imkoniyatlar (Futures)
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              value={futureInput}
              onChange={(e) => setFutureInput(e.target.value)}
              placeholder="Masalan: Nevrologiya bo'yicha kurs"
              fullWidth
              size="small"
            />
            <Button onClick={addFuture} variant="contained" startIcon={<PlusCircle />}>
              Qo'shish
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {(futuresState || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">Hech qanday ma'lumot qo'shilmagan.</Typography>
            ) : (
              (futuresState || []).map((fut: string, idx: number) => (
                <Chip
                  key={idx}
                  label={fut}
                  onDelete={() => removeFutureAt(idx)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" startIcon={<XCircle />}>
          Bekor qilish
        </Button>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={onSave}
          startIcon={<CheckCircle />}
        >
          Saqlash
        </Button>
      </Box>
    </Box>
  );
}

// -------------------- DoctorInfoModal (kept/improved) --------------------
function DoctorInfoModal({ doctor, onClose, isDark }: { doctor: Doctor; onClose: () => void; isDark: boolean }) {
  const defaultColor = isDark ? "white" : "black";
  const highlightColor = isDark ? "#4ade80" : "#10b981";

  const listItemStyle = {
    py: 1,
    px: 0,
    borderBottom: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
    "&:last-child": { borderBottom: "none" },
  };

  const renderMediaList = (items: unknown, icon: React.ReactNode, title: string, size: "small" | "large" = "large") => {
    const BASE_URL = "https://faxriddin.bobur-dev.uz/";
    const safeItems = Array.isArray(items) ? items : typeof items === "string" ? [items] : [];

    return (
      <Box sx={{ mt: 3, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ color: highlightColor, fontWeight: "bold", mb: 1 }}>
          {title} ({safeItems.length})
        </Typography>

        {safeItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Ma’lumot mavjud emas.</Typography>
        ) : (
          <List dense sx={{ maxHeight: size === "small" ? 250 : 400, overflowY: "auto" }}>
            {safeItems.map((url: string | File, index: number) => {
              // If it's a File, show its name, otherwise build full URL
              const isFile = typeof url !== "string";
              const display = isFile ? (url as File).name : (url.startsWith("http") ? url : `${BASE_URL}${url}`);
              const fullUrl = typeof url === "string" ? (url.startsWith("http") ? url : `${BASE_URL}${url}`) : "";
              const isVideo = !isFile && (fullUrl.endsWith(".mp4") || fullUrl.includes("/videos/"));
              const isImage = !isFile && (fullUrl.endsWith(".jpg") || fullUrl.endsWith(".png") || fullUrl.includes("/uploads/"));

              return (
                <ListItem key={index} sx={{ ...listItemStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ListItemIcon sx={{ minWidth: 30, color: highlightColor }}>{icon}</ListItemIcon>

                    {isFile ? (
                      <Typography>{(url as File).name}</Typography>
                    ) : isImage ? (
                      <img src={fullUrl} alt={`img-${index}`} style={{ width: size === "large" ? 200 : 90, height: size === "large" ? 130 : 60, borderRadius: 8, objectFit: "cover", cursor: "pointer" }} onClick={() => window.open(fullUrl, "_blank")} />
                    ) : isVideo ? (
                      <video src={fullUrl} width={size === "large" ? 280 : 140} height={size === "large" ? 160 : 80} controls style={{ borderRadius: 8 }} />
                    ) : (
                      <a href={fullUrl} target="_blank" rel="noreferrer">{display}</a>
                    )}
                  </Box>

                  <Delete size={18} color="red" style={{ cursor: "pointer" }} onClick={() => alert("Soxta o‘chirish!")} />
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{
      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      bgcolor: isDark ? "#111827" : "white", color: defaultColor, borderRadius: 3, boxShadow: 24, p: 4, width: "90%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto"
    }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: highlightColor }}>
        {doctor.firstName} {doctor.lastName} — To‘liq ma’lumot
      </Typography>

      <List>
        <ListItem sx={listItemStyle}>
          <ListItemIcon><Layers /></ListItemIcon>
          <ListItemText primary={<span className="font-semibold">Kategoriya:</span>} secondary={doctor.categoryName || "Noma’lum"} />
        </ListItem>
        <ListItem sx={listItemStyle}>
          <ListItemIcon><DollarSign /></ListItemIcon>
          <ListItemText primary={<span className="font-semibold">Kunlik maosh:</span>} secondary={`${new Intl.NumberFormat("uz-UZ").format(doctor.dailySalary || 0)} so‘m`} />
        </ListItem>
        <ListItem sx={listItemStyle}>
          <ListItemIcon><CheckCircle /></ListItemIcon>
          <ListItemText primary={<span className="font-semibold">Nashr holati:</span>} secondary={doctor.published ? "Nashr qilingan (✅)" : "Nashrdan olingan (🛑)"} />
        </ListItem>
        <ListItem sx={listItemStyle}>
          <ListItemIcon><CheckCircle /></ListItemIcon>
          <ListItemText primary={<span className="font-semibold">Bepul xizmat:</span>} secondary={doctor.free ? "Ha (🟢)" : "Yo‘q (🔴)"} />
        </ListItem>
        <ListItem sx={listItemStyle}>
          <ListItemIcon><FileText /></ListItemIcon>
          <ListItemText primary={<span className="font-semibold">Biografiya:</span>} secondary={doctor.bio || "Kiritilmagan"} />
        </ListItem>
      </List>

      <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${isDark ? "#374151" : "#e5e7eb"}` }}>
        {renderMediaList(doctor.images, <Image />, "Rasmlar", "large")}
        {renderMediaList(doctor.videos, <Video />, "Videolar", "large")}
        {renderMediaList(doctor.files, <FileText />, "Fayllar", "small")}
        {doctor.futures && doctor.futures.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ color: highlightColor, fontWeight: "bold", mb: 1 }}>Kelajakdagi imkoniyatlar ({doctor.futures.length})</Typography>
            <List dense>
              {doctor.futures.map((future, index) => (
                <ListItem key={index} sx={listItemStyle}>
                  <ListItemIcon sx={{ minWidth: 30, color: highlightColor }}><Zap /></ListItemIcon>
                  <ListItemText primary={future} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button onClick={onClose} variant="outlined">Yopish</Button>
      </Box>
    </Box>
  );
}

// -------------------- Main component --------------------
export default function Doctorlar() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useUserStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alert, setAlert] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [password, setPassword] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New states for local file arrays and futures
  const [imagesState, setImagesState] = useState<File[]>([]);
  const [videosState, setVideosState] = useState<File[]>([]);
  const [filesState, setFilesState] = useState<File[]>([]);
  const [futuresState, setFuturesState] = useState<string[]>([]);
  const [futureInput, setFutureInput] = useState("");

  const limit = 9;
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const Base_url = "https://faxriddin.bobur-dev.uz";

  interface RawDoctor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    age?: number;
    profileImg?: string | null;
    isActive: boolean;
    blockedUser: unknown;
    phoneNumber?: string;
    doctorProfile?: DoctorProfile;
  }
  // Fetch doctors
  const fetchDoctors = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${Base_url}/admin/doctors`, {
        params: { limit, page, firstName: search },
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedDoctors: Doctor[] = res.data.data.map((doc: RawDoctor) => {
        const profile = doc.doctorProfile || {} as DoctorProfile;
        return {
          id: doc.id,
          firstName: doc.firstName,
          lastName: doc.lastName,
          email: doc.email,
          age: doc.age || 0,
          profileImg: doc.profileImg || null,
          isActive: doc.isActive,
          blockedUser: doc.blockedUser,
          phoneNumber: doc.phoneNumber || "",
          categoryId: profile.categoryId || mockCategories[0].id,
          categoryName: profile.category?.name || "Kategoriya yo‘q",
          doctorProfileId: profile.id || "",
          bio: profile.bio || "",
          dailySalary: profile.salary && profile.salary.length > 0 ? profile.salary[0].daily : 0,
          published: profile.published || false,
          images: profile.images || [],
          videos: profile.videos || [],
          files: profile.files || [],
          futures: profile.futures || [],
          free: profile.free ?? false,
        } as Doctor;
      });

      setDoctors(fetchedDoctors);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setAlert("❌ Doktorlar ma'lumotlarini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [page, search, token]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const showAlert = (text: string) => {
    setAlert(text);
    setTimeout(() => setAlert(""), 4000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  const handlePublishToggle = async (doctorId: string, isPublished: boolean) => {
    try {
      const newStatus = !isPublished;
      await axios.put(`${Base_url}/admin/doctor/${doctorId}/publish/${newStatus}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDoctors();
      showAlert(newStatus ? "✅ Doktor profili nashr qilindi" : "🛑 Doktor profili nashrdan olindi");
    } catch (err) {
      if (isAxiosError(err)) {
        const serverMessage = err.response?.data?.message?.message || err.response?.data?.message || err.message;
        showAlert(`❌ ${serverMessage}`);
      } else {
        showAlert("❌ Nashr holatini o‘zgartirishda xatolik yuz berdi");
      }
    }
  };

  const handleEditOpen = (doctor: Doctor) => {
    setSelectedDoctor({
      ...doctor,
      // Keep files but as strings (server URLs) — UI will show names; for edit we keep arrays
      images: doctor.images || [],
      videos: doctor.videos || [],
      files: doctor.files || [],
      futures: doctor.futures || [],
      free: doctor.free ?? false,
    });
    setPassword("");
    setProfileImg(null);
    setError(null);

    // reset local file states (when editing we treat server arrays separately; user may add new files)
    setImagesState([]);
    setVideosState([]);
    setFilesState([]);
    setFuturesState(doctor.futures || []);
    setFutureInput("");
    setOpenEditModal(true);
  };

  const handleInfoOpen = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setOpenInfoModal(true);
  };

  // -------------------- Create doctor --------------------
  const handleAddDoctor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDoctor) return;

    // Validation
    if (
      !selectedDoctor.firstName ||
      !selectedDoctor.lastName ||
      !selectedDoctor.email ||
      !password ||
      password.length < 8 ||
      !selectedDoctor.categoryId ||
      !selectedDoctor.bio ||
      !selectedDoctor.dailySalary
    ) {
      setError("Barcha belgili (*) maydonlarni to‘ldiring va parol kamida 8 ta belgidan iborat bo'lsin!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", selectedDoctor.email);
      formData.append("password", password);
      formData.append("firstName", selectedDoctor.firstName);
      formData.append("lastName", selectedDoctor.lastName);
      formData.append("age", String(selectedDoctor.age ?? 0));
      formData.append("categoryId", selectedDoctor.categoryId);
      formData.append("bio", selectedDoctor.bio);
      formData.append("dailySalary", String(selectedDoctor.dailySalary));
      formData.append("free", String(selectedDoctor.free ?? false));
      if (selectedDoctor.phoneNumber) formData.append("phoneNumber", selectedDoctor.phoneNumber);

      // profileImg
      if (profileImg) {
        formData.append("profileImg", profileImg);
      }

      // images (multiple)
      if (imagesState && imagesState.length > 0) {
        imagesState.forEach((file) => {
          formData.append("images", file);
        });
      } else {
        // API may require empty array — if so send no files or send JSON empty; safe to not send
      }

      // videos
      if (videosState && videosState.length > 0) {
        videosState.forEach((file) => {
          formData.append("videos", file);
        });
      }

      // files
      if (filesState && filesState.length > 0) {
        filesState.forEach((file) => {
          formData.append("files", file);
        });
      }

      // futures (strings)
      if (futuresState && futuresState.length > 0) {
        futuresState.forEach((fut) => formData.append("futures", fut));
      }

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
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message?.message || err.response?.data?.message || err.message;
        setError(`❌ Xatolik: ${serverMessage}`);
      } else {
        setError("❌ Kutilmagan xatolik yuz berdi.");
      }
    }
  };

  // -------------------- Edit doctor --------------------
  const handleEditSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDoctor) return;

    if (!selectedDoctor.categoryId || !selectedDoctor.bio || !selectedDoctor.dailySalary || !selectedDoctor.doctorProfileId) {
      setError("Kategoriya, Biografiya va Maosh majburiy!");
      return;
    }

    try {

      setLoading(true);

      // 1) Update user info
      const userFormData = new FormData();
      userFormData.append("userId", selectedDoctor.id);
      userFormData.append("firstName", selectedDoctor.firstName);
      userFormData.append("lastName", selectedDoctor.lastName);
      userFormData.append("email", selectedDoctor.email);
      userFormData.append("age", String(selectedDoctor.age ?? 0));
      if (password && password.length >= 8) {
        userFormData.append("password", password);
      }
      if (profileImg) {
        userFormData.append("profileImg", profileImg);
      }

      await axios.patch(`${Base_url}/admin/user/update`, userFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // 2) Update doctor profile
      const profileFormData = new FormData();
      profileFormData.append("bio", selectedDoctor.bio);
      profileFormData.append("dailySalary", String(selectedDoctor.dailySalary));
      profileFormData.append("categoryId", selectedDoctor.categoryId);
      profileFormData.append("free", String(selectedDoctor.free ?? false));

          // Images
      const existingImages = Array.isArray(selectedDoctor.images)
      ? selectedDoctor.images.filter((i:unknown) => typeof i === "string")
      : [];
          
      existingImages.forEach((s: string) => profileFormData.append("images", s));
          
      if (imagesState && imagesState.length > 0) {
      imagesState.forEach((f) => profileFormData.append("images", f));
      }
      const existingVideos = Array.isArray(selectedDoctor.videos)
        ? selectedDoctor.videos.filter((i: unknown) => typeof i === "string")
        : [];
      existingVideos.forEach((s: string) => profileFormData.append("videos", s));
      
      if (videosState && videosState.length > 0) {
        videosState.forEach((f) => profileFormData.append("videos", f));
      }
      
      // Files
      const existingFiles = Array.isArray(selectedDoctor.files)
        ? selectedDoctor.files.filter((i: unknown) => typeof i === "string")
        : [];
      existingFiles.forEach((s: string) => profileFormData.append("files", s));
      
      if (filesState && filesState.length > 0) {
        filesState.forEach((f) => profileFormData.append("files", f));
      }

      // Futures
      const futures = futuresState.length ? futuresState : (selectedDoctor.futures || []);
      futures.forEach((fut) => profileFormData.append("futures", fut));


      console.log("editing doctor profile with data:", );
      

      await axios.patch(`${Base_url}/doctor-profile/update/${selectedDoctor.doctorProfileId}`, profileFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showAlert("✏️ Doktor ma’lumotlari muvaffaqiyatli yangilandi!");
      setOpenEditModal(false);
      fetchDoctors();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = err.response?.data?.message?.message || err.response?.data?.message || err.message;
        if (status === 401) {
          setError("Avtorizatsiya muddati tugagan. Qayta kiring.");
          window.location.href = "/login";
          return;
        }
        setError(`❌ Xatolik: ${msg}`);
      } else {
        setError("❌ Kutilmagan xatolik yuz berdi!");
      }
    } finally {
      setLoading(false); // ✅ LOADING YAKUNLANDI
    }
  };

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
      if (isAxiosError(err)) {
        const serverMessage = err.response?.data?.message?.message || err.response?.data?.message || err.message;
        showAlert(`❌ O‘chirishda xatolik yuz berdi: ${serverMessage}`);
      } else {
        showAlert("❌ O‘chirishda kutilmagan xatolik yuz berdi");
      }
    }
  };

  const handleBlock = async (userId: string) => {
    try {
      await axios.post(`${Base_url}/admin/block/user`, { userId, reason: "Qoidabuzarlik" }, { headers: { Authorization: `Bearer ${token}` } });
      fetchDoctors();
      showAlert("🛑 Foydalanuvchi bloklandi");
    } catch (err) {
      console.error(err);
      showAlert("❌ Bloklashda xatolik yuz berdi");
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await axios.post(`${Base_url}/admin/unblock/user`, { userId }, { headers: { Authorization: `Bearer ${token}` } });
      fetchDoctors();
      showAlert("✅ Foydalanuvchi blokdan chiqarildi");
    } catch (err) {
      console.error(err);
      showAlert("❌ Blokdan chiqarishda xatolik yuz berdi");
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors rounded-xl shadow-lg ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 border-b pb-4">
        <h1 className="text-3xl font-extrabold mb-3 sm:mb-0 text-green-500">
          <span role="img" aria-label="doctor">👨‍⚕️</span> Shifokorlar Ro‘yxati
        </h1>

        <div className="flex gap-4">
          <Button variant="contained" startIcon={<PlusCircle />} onClick={() => {
            setSelectedDoctor({
              id: "",
              firstName: "",
              lastName: "",
              email: "",
              age: 30,
              profileImg: null,
              isActive: true,
              blockedUser: null,
              categoryId: mockCategories[0].id,
              categoryName: mockCategories[0].name,
              bio: "",
              dailySalary: 100000,
              published: false,
              images: [],
              videos: [],
              files: [],
              futures: [],
              free: false,
            } as Doctor);
            setPassword("");
            setProfileImg(null);
            setError(null);
            setImagesState([]);
            setVideosState([]);
            setFilesState([]);
            setFuturesState([]);
            setFutureInput("");
            setOpenAddModal(true);
          }}
            sx={{
              textTransform: "none",
              backgroundColor: "#22c55e",
              color: "white",
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              "&:hover": { backgroundColor: "#16a34a", transform: "scale(1.03)" }
            }}
          >
            Shifokor qo‘shish
          </Button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input type="text" placeholder="Ism/familiya bo‘yicha qidirish..." className={`px-4 py-3 rounded-lg w-full transition-shadow outline-none border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="contained" startIcon={<Search />} color="success" sx={{ textTransform: "none" }}>Qidirish</Button>
      </form>

      {alert && (
        <Alert severity={alert.startsWith("❌") ? "error" : "success"} className="mb-4" onClose={() => setAlert("")}>
          {alert}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center mt-12"><CircularProgress color="success" /></div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-10 rounded-xl bg-gray-50/10 border border-dashed border-gray-300/20 mt-10">
          <p className="text-lg text-gray-400">❌ Hech qanday doktor topilmadi</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className={`p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 ${doctor.published ? "border-green-500" : "border-yellow-500"} ${isDark ? "bg-gray-800/80" : "bg-white"}`}>
                <div className="flex items-start gap-4">
                  <img src={doctor.profileImg || `https://placehold.co/60x60/10b981/ffffff?text=${doctor.firstName?.charAt(0)?.toUpperCase() || "D"}`} alt={`${doctor.firstName} ${doctor.lastName}`} onError={(e) => (e.currentTarget.src = "https://placehold.co/60x60/10b981/ffffff?text=D")} className="w-16 h-16 min-w-16 min-h-16 rounded-full object-cover border-2 border-green-400 shadow" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <Tooltip title={`${doctor.firstName} ${doctor.lastName}`} arrow>
                      <h2 className="font-bold text-lg truncate text-green-400">{doctor.firstName} {doctor.lastName}</h2>
                    </Tooltip>
                    <Tooltip title={doctor.email} arrow>
                      <p className="text-sm opacity-80 truncate text-gray-400">{doctor.email}</p>
                    </Tooltip>
                    <Tooltip title={doctor.categoryName} arrow>
                      <p className="text-sm flex items-center gap-1 truncate"><Layers className="w-4 h-4 text-green-500" /><span className="font-medium">Kategoriya:</span> {doctor.categoryName}</p>
                    </Tooltip>
                    <p className="text-sm flex items-center gap-1"><DollarSign className="w-4 h-4 text-yellow-500" /><span className="font-medium">Kunlik maosh:</span> {new Intl.NumberFormat("uz-UZ").format(doctor.dailySalary || 0)} so‘m</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  <Button onClick={() => handleInfoOpen(doctor)} color="info" variant="outlined" size="small" startIcon={<Info />}>To'liq ma'lumot</Button>

                  {doctor.published ? (
                    <Button onClick={() => handlePublishToggle(doctor.id, true)} color="warning" variant="contained" size="small" startIcon={<XCircle />}>Nashrdan olish</Button>
                  ) : (
                    <Button onClick={() => handlePublishToggle(doctor.id, false)} color="success" variant="outlined" size="small" startIcon={<CheckCircle />}>Nashr qilish</Button>
                  )}

                  <Button onClick={() => handleEditOpen(doctor)} color="primary" variant="contained" size="small" startIcon={<Edit2 />}>Tahrirlash</Button>
                  <Button onClick={() => handleDelete(doctor.id)} color="error" variant="outlined" size="small" startIcon={<Trash2 />}>O‘chirish</Button>

                  {doctor.blockedUser ? (
                    <Button onClick={() => handleUnblock(doctor.id)} color="success" variant="outlined" size="small" startIcon={<Unlock />}>Unblock</Button>
                  ) : (
                    <Button onClick={() => handleBlock(doctor.id)} color="error" variant="contained" size="small" startIcon={<Lock />}>Block</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <IconButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} color="success"><ChevronLeft /></IconButton>
            <Typography variant="body1" className={isDark ? "text-gray-300" : "text-gray-700"}>Sahifa <span className="font-bold">{page}</span> / <span className="font-bold">{totalPages}</span></Typography>
            <IconButton onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} color="success"><ChevronRight /></IconButton>
          </div>
        </>
      )}

      {/* Edit Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <DoctorModal
          title="✏️ Doktor ma'lumotlarini tahrirlash"
          selectedDoctor={selectedDoctor!}
          setSelectedDoctor={setSelectedDoctor as React.Dispatch<React.SetStateAction<Doctor>>}
          password={password}
          setPassword={setPassword}
          profileImg={profileImg}
          setProfileImg={setProfileImg}
          onSave={handleEditSave}
          onClose={() => setOpenEditModal(false)}
          error={error}
          isDark={isDark}
          isEdit={true}
          imagesState={imagesState}
          setImagesState={setImagesState}
          videosState={videosState}
          setVideosState={setVideosState}
          filesState={filesState}
          setFilesState={setFilesState}
          futuresState={futuresState}
          setFuturesState={setFuturesState}
          futureInput={futureInput}
          setFutureInput={setFutureInput}
        />
      </Modal>

      {/* Add Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <DoctorModal
          title="➕ Yangi doktor qo'shish"
          selectedDoctor={selectedDoctor!}
          setSelectedDoctor={setSelectedDoctor as React.Dispatch<React.SetStateAction<Doctor>>}
          password={password}
          setPassword={setPassword}
          profileImg={profileImg}
          setProfileImg={setProfileImg}
          onSave={handleAddDoctor}
          onClose={() => setOpenAddModal(false)}
          error={error}
          isDark={isDark}
          isEdit={false}
          imagesState={imagesState}
          setImagesState={setImagesState}
          videosState={videosState}
          setVideosState={setVideosState}
          filesState={filesState}
          setFilesState={setFilesState}
          futuresState={futuresState}
          setFuturesState={setFuturesState}
          futureInput={futureInput}
          setFutureInput={setFutureInput}
        />
      </Modal>

      {/* Info Modal */}
      <Modal open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
        {selectedDoctor ? (
          <DoctorInfoModal doctor={selectedDoctor} onClose={() => setOpenInfoModal(false)} isDark={isDark} />
        ) : <div />}
      </Modal>
    </div>
  );
}
