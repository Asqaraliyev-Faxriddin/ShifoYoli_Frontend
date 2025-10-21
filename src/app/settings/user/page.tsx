"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios, { isAxiosError } from "axios"
import {
    User,
    Lock,
    Users,
    Monitor,
    ShieldAlert,
    CheckCircle,
    X,
    Loader2,
    Moon,
    Sun,
    Edit,
    Stethoscope,
    Briefcase,
    Trash2,
    Upload,
    Menu,
    ArrowLeft,
} from "lucide-react"

// --- Oylar Utilitysi ---
const MONTHS = [
    { num: 1, name: "Yanvar" },
    { num: 2, name: "Fevral" },
    { num: 3, name: "Mart" },
    { num: 4, name: "Aprel" },
    { num: 5, name: "May" },
    { num: 6, name: "Iyun" },
    { num: 7, name: "Iyul" },
    { num: 8, name: "Avgust" },
    { num: 9, name: "Sentyabr" },
    { num: 10, name: "Oktyabr" },
    { num: 11, name: "Noyabr" },
    { num: 12, name: "Dekabr" },
]
const getMonthName = (num: number | null | undefined): string =>
    MONTHS.find((m) => m.num === num)?.name || "Kiritilmagan"
const getMonthNumber = (name: string): number | null => MONTHS.find((m) => m.name === name)?.num || null

// --- INTERFACES (Tiplash) ---

export type UserRole = "DOCTOR" | "SUPERADMIN" | "USER"
export type NotificationType = "success" | "error"
export type SetNotification = (message: string, type: NotificationType) => void

interface Wallet {
    id: string
    userId: string
    balance: string
    createdAt: string
    updatedAt: string
}

interface DoctorProfile {
    id: string
    doctorId: string
    categoryId: string
    bio: string
    published: boolean
    images: string[]
    videos: string[]
    files: string[]
    salary: { daily: string | number }[]
    futures: string[]
    createdAt: string
    updatedAt: string
    free?: boolean
}

interface Device {
    id: string
    deviceId: string
    deviceType: string
    address: string
    name: string
    createdAt: string
    updatedAt: string
    isBlocked?: boolean
}

interface CountData {
    devices: number
    ChatParticipant: number
    Message: number
    UserNotification: number
    meetingsAsUser: number
    meetingsAsDoctor: number
    reviewsGiven: number
    reviewsReceived: number
    meetingsMessages: number
    dailyAccess: number
    doctorAccess: number
}

interface Notifications {
    isFalseRead: number
    isTrueRead: number
}

export interface UserData {
    id: string
    firstName: string
    lastName: string
    email: string
    role: UserRole
    profileImg: string | null
    wallet: Wallet | null
    createdAt: string
    updatedAt: string
    age: number | null
    month: number | null
    day: number | null
    phoneNumber: string | null
    dailyAccess: unknown[]
    doctorProfile: DoctorProfile | null
    devices: Device[]
    meetingsAsDoctor: unknown[]
    _count: CountData
    notifications: Notifications
}

// --- MOCKING STORE (Dark/Light Mode uchun) ---
const useUserStore = () => {
    const [isDark, setIsDark] = useState(false)
    const toggleDark = () => setIsDark((prev) => !prev)
    return { isDark, toggleDark }
}

// --- Kichik Yordamchi Komponentlar ---

interface NotificationProps {
    message: string
    type: NotificationType | ""
    clearNotification: () => void
    isDark: boolean
}

function NotificationMessage({ message, type, clearNotification }: NotificationProps) {
    if (!message) return null

    const styleMap = {
        success: "bg-green-500 border-green-600 dark:bg-green-700",
        error: "bg-red-500 border-red-600 dark:bg-red-700",
        "": "bg-gray-500 border-gray-600 dark:bg-gray-700",
    }

    const Icon = type === "success" ? CheckCircle : ShieldAlert

    return (
        <div
            className={`fixed top-4 right-4 z-[100] p-4 border-l-4 rounded-xl shadow-2xl transition-all duration-300 transform ${styleMap[type]}`}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-white flex-shrink-0" />
                <p className="text-white font-medium max-w-sm">{message}</p>
                <button onClick={clearNotification} className="ml-4 text-white hover:text-gray-200 transition flex-shrink-0">
                    <X size={18} />
                </button>
            </div>
        </div>
    )
}

const getErrorMessage = (err: unknown): string => {
    if (isAxiosError(err)) {
      const rawMessage =
        err.response?.data?.message?.message ||
        err.response?.data?.message ||
        err.message;
  
      if (typeof rawMessage === "string" && rawMessage.trim()) {
        return rawMessage;
      }
    }
  
    return "Kutilmagan xato yuz berdi. Server javobini tekshiring.";
  };
// --- Shaxsiy Ma'lumotlarni Tahrirlash Komponenti ---

interface EditFormState {
    firstName: string
    lastName: string
    age: string | number
    month: string
    day: string | number
    phoneNumber: string | number
}

interface ProfilniTahrirlashProps {
    user: UserData
    token: string | null
    setNotification: SetNotification
    closeEdit: () => void
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
    isDark: boolean
}

function ProfilniTahrirlash({ user, token, setNotification, closeEdit, setUserData, isDark }: ProfilniTahrirlashProps) {
    const [formData, setFormData] = useState<EditFormState>({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        age: user.age || "",
        month: getMonthName(user.month),
        day: user.day || "",
        phoneNumber: user.phoneNumber || "",
    })

    const [profileImg, setProfileImg] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileImg(e.target.files?.[0] || null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) {
            setNotification("Tizimga kirish tokeni yo'q. Iltimos, qayta kiring.", "error")
            return
        }

        setIsSubmitting(true)
        const data = new FormData()
        const monthNumber = getMonthNumber(formData.month)

        Object.keys(formData).forEach((key) => {
            const fieldKey = key as keyof EditFormState
            const value = formData[fieldKey]

            if (value !== null && value !== undefined && value !== "") {
                if (key === "month") {
                    if (monthNumber) data.append(key, String(monthNumber))
                } else if (key === "age" || key === "day") {
                    data.append(key, String(Number(value)))
                } else {
                    data.append(key, String(value))
                }
            }
        })

        if (profileImg) {
            data.append("profileImg", profileImg)
        }

        try {
            await axios.patch("https://faxriddin.bobur-dev.uz/profile/update", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            })

            const updated = await axios.get("https://faxriddin.bobur-dev.uz/profile/my/profile", {
                headers: { Authorization: `Bearer ${token}` },
            })
            setUserData(updated.data.data as UserData)

            setNotification("Profil ma'lumotlari muvaffaqiyatli yangilandi!", "success")
            closeEdit()
        } catch (err) {
            setNotification(`Tahrirlashda xato: ${getErrorMessage(err)}`, "error")
        } finally {
            setIsSubmitting(false)
        }
    }

    const fields = [
        { key: "firstName", label: "Ism", type: "text" },
        { key: "lastName", label: "Familiya", type: "text" },
        { key: "phoneNumber", label: "Telefon raqami", type: "text" },
        { key: "age", label: "Yosh", type: "number" },
        { key: "day", label: "Tug'ilgan kun", type: "number" },
    ] as const

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm ${isDark ? "dark" : ""}`}
        >
            <div
                className={`w-full max-w-xl max-h-[90vh] overflow-y-auto ${isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} rounded-3xl shadow-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700`}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <Edit size={24} className="text-indigo-500" /> Profilni Tahrirlash
                    </h2>
                    <button onClick={closeEdit} className="text-gray-500 hover:text-red-500 transition flex-shrink-0">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map(({ key, label, type }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
                                <input
                                    type={type}
                                    name={key}
                                    value={formData[key] || ""}
                                    onChange={handleChange}
                                    className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                                />
                            </div>
                        ))}

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Tug'ilgan oy</label>
                            <select
                                name="month"
                                value={formData.month}
                                onChange={handleChange}
                                className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                            >
                                <option value="">Oyni tanlang</option>
                                {MONTHS.map((m) => (
                                    <option key={m.num} value={m.name}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                            Profil Rasmi (Faqat bitta rasm)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={`w-full text-sm ${isDark ? "text-white" : "text-gray-900"} file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition duration-300`}
                        />
                        {profileImg && <p className="text-xs text-green-500 mt-1">Tanlangan: {profileImg.name}</p>}
                        {!profileImg && user.profileImg && (
                            <p className="text-xs text-gray-400 mt-1">Hozirgi rasm mavjud. Yangilash uchun fayl tanlang.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !token}
                        className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                        {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
                </form>
            </div>
        </div>
    )
}

// --- Shifokor Sozlamalari Komponenti (DOCTOR/SUPERADMIN) ---

interface DoctorFormState {
    bio: string
    salary: { daily: string | number }[];
    free: boolean
    categoryId: string
    futures: string
}

interface ShifokorSozlamalariProps {
    user: UserData
    token: string | null
    setNotification: SetNotification
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
    isDark: boolean
}

interface Category {
    id: string;
    name: string;
    // Boshqa maydonlar bo'lishi mumkin: description, icon, etc.
  }

function ShifokorSozlamalari({ user, token, setNotification, isDark, setUserData }: ShifokorSozlamalariProps) {
    const { doctorProfile } = user;
    console.log("Doctor salary:", doctorProfile);

  
    const initialFormState: DoctorFormState = {
        bio: doctorProfile?.bio || "",
        salary: [
          {
            daily:
              doctorProfile?.salary?.[0]?.daily !== undefined
                ? String(doctorProfile.salary[0].daily)
                : "",
          },
        ],
        free: doctorProfile?.published ?? false,
        categoryId: doctorProfile?.categoryId || "",
        futures: doctorProfile?.futures?.join(", ") || "",
      };
      
  
    const [form, setForm] = useState<DoctorFormState>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [newVideo, setNewVideo] = useState<File | null>(null);
    const [isFileLoading, setIsFileLoading] = useState(false);
  
    // Yangi state: Kategoriyalar ro'yxatini saqlash uchun
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  
    // --- useEffect: Kategoriyalarni yuklash ---
    useEffect(() => {
      const fetchCategories = async () => {
        setIsCategoriesLoading(true);
        try {
          const response = await axios.get("https://faxriddin.bobur-dev.uz/doctor-category/all?limit=100&offset=0",
            { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
          );
          
          setCategories(response.data || []); // Ma'lumotlar to'g'ri joylashgan deb faraz qilamiz
        } catch (err) {
            console.log(err);
            
          setNotification(`Kategoriyalarni yuklashda xato: ${getErrorMessage(err)}`, "error");
        } finally {
          setIsCategoriesLoading(false);
        }
      };
  
      fetchCategories();
    }, [setNotification]); // setNotification funksiyasi o'zgarmas deb faraz qilamiz
  
    // --- Form o'zgarishini boshqarish ---
    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        const { name, value, type } = e.target;
        const isChecked = type === "checkbox" && (e.target as HTMLInputElement).checked;
      
        // Agar bu dailySalary bo‘lsa — salary[0].dailySalary ni yangilaymiz
        if (name === "dailySalary") {
            setForm((prev) => ({
              ...prev,
              salary: [{ ...prev.salary[0], daily: value }],
            }));
          }
           else {
          // Oddiy fieldlar uchun (bio, categoryId, futures, free)
          setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? isChecked : value,
          }));
        }
      };
      
    // --- Profilni yangilash funksiyasi ---
    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token) {
        setNotification("Tizimga kirish tokeni yo'q. Iltimos, qayta kiring.", "error");
        return;
      }
      setIsSubmitting(true);
      const data = new FormData();
  
      data.append("bio", form.bio);
      // Number() dan foydalanib, bo'sh stringni 0 ga aylantirish xavfsizroq
      data.append("dailySalary", String(Number(form.salary[0].daily) || 0));

      data.append("free", String(form.free));
      data.append("categoryId", form.categoryId); // Yangi categoryId yuboriladi
  
      const futuresArray = form.futures
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      futuresArray.forEach((future) => data.append("futures[]", future));
  
      try {
        await axios.patch("https://faxriddin.bobur-dev.uz/doctor-profile/update/doctor/profile", data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
  
        // Yangilangan profilni olish
        const updated = await axios.get("https://faxriddin.bobur-dev.uz/profile/my/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(updated.data.data as UserData);
  
        setNotification("Shifokor profili muvaffaqiyatli yangilandi! 🎉", "success");
      } catch (err) {
        console.log(err);
        
        setNotification(`Profilni yangilashda xato: ${getErrorMessage(err)}`, "error");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    // --- Fayllar bilan ishlash funksiyasi (o'zgartirishsiz qoldirildi, yaxshi yozilgan) ---
    const handleFileAction = async (
        actionType: "add" | "remove",
        fileData: File | string | null,
        fileType: "images" | "videos" | "files"
      ) => {
        if (!token) {
          setNotification("Tizimga kirish tokeni yo'q. Iltimos, qayta kiring.", "error");
          return;
        }
      
        if (!user.id) {
          setNotification("Foydalanuvchi ID topilmadi.", "error");
          return;
        }
      
        setIsFileLoading(true);
        let url: string;
        let method: "POST" | "DELETE";
        let data: FormData | Record<string, string> | undefined;
      
        // ➕ Yangi fayl qo‘shish
        if (actionType === "add" && fileData instanceof File) {
          method = "POST";
          const formData = new FormData();
      
          // Backendda "image" va "video" field nomlari kutilmoqda
          if (fileType === "images") {
            formData.append("image", fileData);
          } else if (fileType === "videos") {
            formData.append("video", fileData);
          }
      
          // URL ni to‘g‘ri tanlash
          url = `https://faxriddin.bobur-dev.uz/doctor-profile/add-${fileType === "images" ? "image" : "video"}/${user.id}`;
          data = formData;
        }
      
        // ❌ Faylni o‘chirish
        else if (actionType === "remove" && typeof fileData === "string") {
          method = "DELETE";
      
          // URL
          url = `https://faxriddin.bobur-dev.uz/doctor-profile/remove-${fileType === "images" ? "image" : "video"}/${user.id}`;
      
          // DELETE uchun body
          data = {
            [fileType === "images" ? "image" : "video"]: fileData, // masalan { image: "rasm.jpg" }
          };
        } else {
          setIsFileLoading(false);
          return;
        }
      
        try {
          const res = await axios({
            method,
            url,
            data: method === "POST" ? data : data, // JSON.stringify shart emas
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": method === "POST" ? "multipart/form-data" : "application/json",
            },
          });
      
          console.log("✅ File Action Response:", res.data);
      
          // Yangilangan profilni olish
          const updated = await axios.get("https://faxriddin.bobur-dev.uz/profile/my/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setUserData(updated.data.data as UserData);
      
          setNotification(
            `${fileType === "images" ? "Rasm" : "Video"} muvaffaqiyatli ${
              actionType === "add" ? "qo‘shildi" : "o‘chirildi"
            }!`,
            "success"
          );
          setNewImage(null);
          setNewVideo(null);
        } catch (err) {
          console.error("❌ Fayl boshqaruvida xato:", err);
          setNotification(`Fayl boshqaruvida xato: ${getErrorMessage(err)}`, "error");
        } finally {
          setIsFileLoading(false);
        }
      };
      
  
    // --- Fayllar ro'yxatini chiqarish (o'zgartirishsiz qoldirildi) ---
    const   renderFileList = (files: string[] | undefined, type: "images" | "videos" | "files") => (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
        {files?.map((file, index) => (
          <div
            key={index}
            className={`relative p-2 rounded-xl border flex flex-col justify-between ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"}`}
          >
            <p className={`text-xs font-medium truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {file.split("/").pop()}
            </p>
            <button
              onClick={() => handleFileAction("remove", file, type)}
              disabled={isFileLoading || !token}
              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
              title="O'chirish"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  
    const fileInputClasses = `w-full text-sm mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition duration-300 ${isDark ? "text-gray-300" : "text-gray-900"}`;
  
    // --- KOMPONENT RENDERI ---
    return (
      <div className="w-full space-y-8">
        <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
          <Stethoscope size={32} className="inline mr-2 text-indigo-500" />{" "}
          {user.role === "SUPERADMIN" ? "Superadmin Doktor Sozlamalari" : "Shifokor Profilini Boshqarish"}
        </h1>
        <p className={`mb-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Sizning kasbiy ma'lumotlaringizni va media fayllaringizni yangilash.
        </p>
  
        {/* Asosiy Profil Formasi */}
        <section
          className={`p-6 sm:p-8 rounded-3xl shadow-xl transition border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
        >
          <h2
            className={`text-lg sm:text-xl font-bold flex items-center gap-2 mb-6 border-b pb-3 ${isDark ? "text-gray-100 border-gray-700" : "text-gray-800 border-gray-200"}`}
          >
            <Briefcase size={20} className="text-indigo-500" /> Asosiy Ma'lumotlar
          </h2>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className={`block text-sm font-semibold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Bio (Qisqacha Ma'lumot) - (uz)
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleFormChange}
                rows={3}
                className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`}
              />
            </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Kunlik Maosh (UZS)
                </label>
                <input
                type="number"
            name="dailySalary"
            value={form.salary[0].daily || 0  }
            onChange={handleFormChange}
             className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-50 border-gray-200 text-gray-800"
            }`}
/>

              </div>
  
              {/* !!! TO'G'IRLANGAN JOY: Kategoriya ID o'rniga Kategoriya tanlash (Select) !!! */}
              <div>
                <label className={`block text-sm font-semibold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Kategoriya Tanlash
                </label>
                <div className="relative">
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleFormChange as React.ChangeEventHandler<HTMLSelectElement>} // Type ni to'g'irlash
                    disabled={isCategoriesLoading || !categories.length}
                    className={`appearance-none w-full border rounded-xl p-3 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none transition ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                  >
                    <option value="" disabled>
                      {isCategoriesLoading ? "Yuklanmoqda..." : "Kategoriyani tanlang"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                {/* Kategoriya yuklanish holatini ko'rsatish */}
                {isCategoriesLoading && (
                  <p className={`mt-1 text-xs ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Kategoriyalar yuklanmoqda...</p>
                )}
                {!categories.length && !isCategoriesLoading && (
                  <p className="mt-1 text-xs text-red-500">Kategoriyalar topilmadi.</p>
                )}
              </div>
  
              <div className="flex items-center pt-5">
                <input
                  type="checkbox"
                  id="free"
                  name="free"
                  checked={form.free}
                  onChange={handleFormChange}
                  className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="free"
                  className={`ml-2 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Bepul Konsultatsiya
                </label>
              </div>
            </div>
  
            <div>
              <label className={`block text-sm font-semibold mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Kelajakdagi imkoniyatlar (vergul bilan ajrating)
              </label>
              <input
                type="text"
                name="futures"
                value={form.futures}
                onChange={handleFormChange}
                className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                placeholder="Masalan: Ingliz tili, Jahon tajribasi, Xususiy kabinet"
              />
            </div>
  
            <button
              type="submit"
              disabled={isSubmitting || !token || isCategoriesLoading}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
              {isSubmitting ? "Saqlanmoqda..." : "Asosiy Ma'lumotlarni Saqlash"}
            </button>
          </form>
        </section>
  
        {/* Media Boshqaruvi (o'zgarishsiz qoldirildi) */}
        <section
          className={`p-6 sm:p-8 rounded-3xl shadow-xl transition border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
        >
          <h2
            className={`text-lg sm:text-xl font-bold flex items-center gap-2 mb-6 border-b pb-3 ${isDark ? "text-gray-100 border-gray-700" : "text-gray-800 border-gray-200"}`}
          >
            <Monitor size={20} className="text-indigo-500" /> Media va Fayllar Boshqaruvi
          </h2>
  
          {/* Rasmlar */}
          <div className="mb-8">
            <h3 className={`text-base sm:text-lg font-semibold mb-3 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Rasmlar ({doctorProfile?.images?.length || 0})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                className={`${fileInputClasses} flex-grow`}
              />
              <button
                onClick={() => newImage && handleFileAction("add", newImage, "images")}
                disabled={isFileLoading || !newImage || !token}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition disabled:opacity-50 whitespace-nowrap"
              >
                <Upload size={18} /> Qo'shish
              </button>
            </div>
            {renderFileList(doctorProfile?.images, "images")}
          </div>
  
          {/* Videolar */}
          <div>
            <h3 className={`text-base sm:text-lg font-semibold mb-3 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Videolar ({doctorProfile?.videos?.length || 0})
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setNewVideo(e.target.files?.[0] || null)}
                className={`${fileInputClasses} flex-grow`}
              />
              <button
                onClick={() => newVideo && handleFileAction("add", newVideo, "videos")}
                disabled={isFileLoading || !newVideo || !token}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition disabled:opacity-50 whitespace-nowrap"
              >
                <Upload size={18} /> Qo'shish
              </button>
            </div>
            {renderFileList(doctorProfile?.videos, "videos")}
          </div>
  
          {/* Fayllar qismi */}
          <div className="mt-8">
            <h3 className={`text-base sm:text-lg font-semibold mb-3 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Fayllar ({doctorProfile?.files?.length || 0})
            </h3>
            {renderFileList(doctorProfile?.files, "files")}
          </div>
        </section>
      </div>
    );
  }

// --- Parolni Tahrirlash Sahifasi ---
interface ParolniTahrirlashProps {
    token: string | null
    setNotification: SetNotification
    isDark: boolean
}

function ParolniTahrirlash({ token, setNotification, isDark }: ParolniTahrirlashProps) {
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) {
            setNotification("Tizimga kirish tokeni yo'q. Iltimos, qayta kiring.", "error")
            return
        }

        if (newPassword.length < 6) {
            setNotification("Yangi parol kamida 6 belgidan iborat bo'lishi kerak.", "error")
            return
        }

        setIsSubmitting(true)

        try {
            await axios.put(
                "https://faxriddin.bobur-dev.uz/profile/password/update",
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } },
            )
            setNotification("Parol muvaffaqiyatli yangilandi!", "success")
            setOldPassword("")
            setNewPassword("")
        } catch (err) {
            setNotification(`Parolni yangilashda xato: ${getErrorMessage(err)}`, "error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section
            className={`p-6 sm:p-8 rounded-3xl shadow-2xl transition border w-full ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
        >
            <h2
                className={`text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? "text-gray-100" : "text-gray-800"}`}
            >
                <Lock size={24} className="text-indigo-600" /> Parolni Tahrirlash
            </h2>
            <p className={`mb-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Xavfsizlikni ta'minlash uchun parolingizni muntazam yangilab turing.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col space-y-1">
                    <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Joriy Parol</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        className={`w-full border rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                        placeholder="Joriy parolingizni kiriting"
                    />
                </div>

                <div className="flex flex-col space-y-1">
                    <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Yangi Parol</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className={`w-full border rounded-xl p-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`}
                        placeholder="Kamida 8 belgi"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !token}
                    className="w-full flex justify-center items-center gap-2 mt-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                    {isSubmitting ? "Yangilanmoqda..." : "Parolni yangilash"}
                </button>
            </form>
        </section>
    )
}

// --- Profil Ma'lumotlari Sahifasi ---
interface ProfilProps {
    user: UserData
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
    token: string | null
    setNotification: SetNotification
    isDark: boolean
}

function Profil({ user, setUserData, token, setNotification, isDark }: ProfilProps) {
    const [deviceLoading, setDeviceLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const handleDeviceAction = useCallback(
        async (deviceId: string | undefined, action: "block" | "unblock") => {
            if (!token || !deviceId) {
                setNotification("Xato: Token yoki Qurilma ID topilmadi.", "error")
                return
            }
            setDeviceLoading(true)

            try {
                await axios.post(
                    `https://faxriddin.bobur-dev.uz/device/${action}/${deviceId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } },
                )

                const updated = await axios.get("https://faxriddin.bobur-dev.uz/profile/my/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                })



                setUserData(updated.data.data as UserData)
                setNotification(`Qurilma muvaffaqiyatli ${action === "block" ? "bloklandi" : "blokdan chiqarildi"}.`, "success")
            } catch (err) {
                setNotification(`Qurilma harakatida xato: ${getErrorMessage(err)}`, "error")
            } finally {
                setDeviceLoading(false)
            }
        },
        [token, setUserData, setNotification],
    )

    interface FormFieldDisplayProps {
        label: string
        value: string | number | null | undefined
    }
    const FormFieldDisplay: React.FC<FormFieldDisplayProps> = ({ label, value }) => {
        let displayValue = "Kiritilmagan"

        

        if (value !== null && value !== undefined) {
            if (label === "Tug'ilgan oy") {
                displayValue = getMonthName(Number(value)) || "Kiritilmagan"
            } else if (label === "Hamyon Balansi" && typeof value === "string") {
                displayValue = `${value} UZS`
            } else {
                displayValue = String(value)
            }
        }

        return (
            <div className="flex flex-col space-y-1">
                <label className={`text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {label}
                </label>
                <div
                    className={`w-full border rounded-xl px-4 py-2 font-semibold truncate ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-100 text-gray-800"}`}
                >
                    {displayValue}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-10">
            {isEditing && token && (
                <ProfilniTahrirlash
                    user={user}
                    token={token}
                    setNotification={setNotification}
                    closeEdit={() => setIsEditing(false)}
                    setUserData={setUserData}
                    isDark={isDark}
                />
            )}
            {/* Header */}
            <div
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 rounded-3xl shadow-lg border w-full ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
            >
                <div className="w-full">
                    <h1 className={`text-2xl sm:text-3xl font-extrabold ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                        {user.role === "DOCTOR"
                            ? "Shifokor Sozlamalari"
                            : user.role === "SUPERADMIN"
                                ? "Super Admin Sozlamalari"
                                : `${user.role} Sozlamalari`}
                    </h1>
                    <p className={`mt-1 text-sm sm:text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Shaxsiy ma'lumotlaringiz va tizimga kirgan qurilmalarni boshqaring.
                    </p>
                </div>
            </div>

            {/* Profil ma'lumotlari */}
            <section
                className={`shadow-xl rounded-3xl p-6 sm:p-8 border w-full ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-3 gap-4">
                    <h2
                        className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDark ? "text-gray-100" : "text-gray-800"}`}
                    >
                        <User size={20} className="text-indigo-600 flex-shrink-0" /> Shaxsiy Ma'lumotlar
                    </h2>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition shadow-md whitespace-nowrap"
                    >
                        <Edit size={18} /> Tahrirlash
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormFieldDisplay label="Ism" value={user.firstName} />
                    <FormFieldDisplay label="Familiya" value={user.lastName} />
                    <FormFieldDisplay label="Email Manzil" value={user.email} />
                    <FormFieldDisplay label="Yosh" value={user.age} />
                    <FormFieldDisplay label="Tug'ilgan oy" value={user.month} />
                    <FormFieldDisplay label="Tug'ilgan kun" value={user.day} />
                    <FormFieldDisplay label="Rol" value={user.role} />
                    <FormFieldDisplay label="Telefon raqami" value={user.phoneNumber} />
                    <FormFieldDisplay label="Hamyon Balansi" value={user.wallet?.balance || "0"} />
                </div>
            </section>

            {/* Qurilmalar */}
            <section
                className={`shadow-xl rounded-3xl p-6 sm:p-8 border w-full ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
            >
                <h2
                    className={`text-lg sm:text-xl font-bold flex items-center gap-2 mb-6 border-b pb-3 ${isDark ? "text-gray-100" : "text-gray-800"}`}
                >
                    <Monitor size={20} className="text-indigo-600 flex-shrink-0" /> Ulangan Qurilmalar
                </h2>

                {user.devices?.length ? (
                    <div className="space-y-4">
                        {user.devices.map((device) => (
                            <div
                                key={device.id}
                                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-2xl transition shadow-sm gap-4 ${isDark ? "bg-gray-700" : "bg-gray-50"} ${device.isBlocked ? "border-red-500" : "border-green-500"}`}
                            >
                                <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                                    <Monitor
                                        size={24}
                                        className={`${device.isBlocked ? "text-red-500" : "text-green-500"} flex-shrink-0`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"} truncate`}>{device.name}</p>
                                        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            IP: {device.address} | Turi: {device.deviceType} | Sana:{" "}
                                            {new Date(device.createdAt).toLocaleDateString("uz-UZ", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        {device.isBlocked && (
                                            <span className="text-xs font-bold text-red-500 dark:text-red-400">BLOKLANGAN</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeviceAction(device.deviceId, device.isBlocked ? "unblock" : "block")}
                                    disabled={deviceLoading || !token}
                                    className={`px-5 py-2 rounded-xl text-sm font-bold transition text-white shadow-md w-full sm:w-auto ${
                                        device.isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                    } disabled:opacity-50 flex items-center justify-center gap-2`}
                                >
                                    {deviceLoading && <Loader2 size={16} className="animate-spin" />}
                                    {device.isBlocked ? "Blokdan Chiqarish" : "Bloklash"}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p
                        className={`p-4 border border-dashed rounded-xl text-center ${isDark ? "text-gray-400 border-gray-600" : "text-gray-500 border-gray-300"}`}
                    >
                        Hech qanday qurilma topilmadi
                    </p>
                )}
            </section>
        </div>
    )
}

// --- ASOSIY APP KOMPONENTI (DEFAULT EXPORT) ---
const App: React.FC = () => {
    const router = useRouter()
    const { isDark, toggleDark } = useUserStore()
    const [activeMenu, setActiveMenu] = useState("profil")
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [notification, setNotificationState] = useState<{ message: string; type: NotificationType | "" }>({
        message: "",
        type: "",
    })
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Eslatma: localStorage'dan token olish Next.js'da useEffect ichida yoki shunga o'xshash joyda bo'lishi kerak.
    // Ammo oddiylik uchun bu yerda qoldirildi. To'g'ri ishlab chiqarish kodi uchun buni optimallashtirish kerak.
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

    const setNotification: SetNotification = useCallback((message, type = "success") => {
        setNotificationState({ message, type })
        setTimeout(() => setNotificationState({ message: "", type: "" }), 5000)
    }, [])

    const clearNotification = () => setNotificationState({ message: "", type: "" })

    useEffect(() => {
        if (!token) {
            setNotification("Tizimga kirish tokeni topilmadi. Ma'lumotlarni yuklab bo'lmaydi.", "error")
            setLoading(false)
            return
        }

        async function fetchUserData() {

            try {
                const response = await axios.get("https://faxriddin.bobur-dev.uz/profile/my/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setUserData(response.data.data as UserData)
                

            } catch (err) {
                setNotification(`Foydalanuvchi ma'lumotlarini olishda xato: ${getErrorMessage(err)}`, "error")
            } finally {
                setLoading(false)
            }



        }
            

        fetchUserData()

    }, [token, setNotification])

    const handleMenuClick = (key: string) => {
        setActiveMenu(key)
        setIsSidebarOpen(false)
    }

    if (loading)
        return (
            <div className={`flex items-center justify-center h-screen gap-3 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <Loader2 size={32} className="animate-spin text-indigo-500" />
                <span className={`text-lg font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>Yuklanmoqda...</span>
            </div>
        )

    if (!userData)
        return (
            <div className={`flex justify-center items-center h-screen gap-3 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ShieldAlert size={32} className="text-red-500" />
                <span className={`text-lg font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>
                    Profil ma'lumotlari topilmadi. Iltimos, qayta urinib ko'ring.
                </span>
            </div>
        )

    const role = userData.role

    const menuItems = [
        { key: "profil", label: "Mening Profilim", icon: <User size={20} /> },
        { key: "parol", label: "Parolni Tahrirlash", icon: <Lock size={20} /> },
        ...(role === "SUPERADMIN" || role === "DOCTOR"
            ? [{ key: "doctor_settings", label: "Shifokor Sozlamalari", icon: <Stethoscope size={20} /> }]
            : []),
        ...(role === "SUPERADMIN"
            ? [{ key: "userlar", label: "Barcha Userlar", icon: <Users size={20} /> }]
            : role === "DOCTOR"
                ? [{ key: "doktorlar", label: "Doktorlar Ro'yxati", icon: <Users size={20} /> }]
                : []),
    ]

    const renderContent = () => {
        if (!userData || !token) return null

        switch (activeMenu) {
            case "profil":
                return (
                    <Profil
                        user={userData}
                        setUserData={setUserData}
                        token={token}
                        setNotification={setNotification}
                        isDark={isDark}
                    />
                )
            case "parol":
                return <ParolniTahrirlash token={token} setNotification={setNotification} isDark={isDark} />
            case "doctor_settings":
                return (
                    <ShifokorSozlamalari
                        user={userData}
                        setUserData={setUserData}
                        token={token}
                        setNotification={setNotification}
                        isDark={isDark}
                    />
                )
            case "userlar":
                return (
                    <div
                        className={`p-6 sm:p-8 rounded-3xl shadow-xl border w-full ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-100 text-gray-800"}`}
                    >
                        <h2 className="text-xl sm:text-2xl font-bold">Barcha Userlar Ro'yxati</h2>
                        <p className="text-gray-500 mt-2 dark:text-gray-400">Bu sahifa faqat SUPERADMIN uchun.</p>
                    </div>
                )
            case "doktorlar":
                return (
                    <div
                        className={`p-6 sm:p-8 rounded-3xl shadow-xl border w-full ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-100 text-gray-800"}`}
                    >
                        <h2 className="text-xl sm:text-2xl font-bold">Doktorlar Ro'yxati</h2>
                        <p className="text-gray-500 mt-2 dark:text-gray-400">Doktorlar uchun maxsus boshqaruv paneli.</p>
                    </div>
                )
            default:
                return <div className={`text-lg p-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Sahifa topilmadi</div>
        }
    }

    return (
        <div className={isDark ? "dark" : ""}>
            {/* Asosiy flex konteyner */}
            <div className="flex min-h-screen font-sans bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <NotificationMessage
                    message={notification.message}
                    type={notification.type}
                    clearNotification={clearNotification}
                    isDark={isDark}
                />

                {/* Mobile Menu Button - Katta ekranlarda yashiringan */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed bottom-6 right-6 z-30 md:hidden p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
                >
                    <Menu size={24} />
                </button>

                {/* Sidebar (Yon menyu) */}
                <aside
                    className={`fixed md:static h-[1200px] rounded-2xl z-40 transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
                        ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}
                        md:block md:translate-x-0 border-r flex-shrink-0 overflow-y-auto`} 
                >
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className={`text-2xl font-extrabold ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>
                                Sozlamalar
                            </h2>
                            <button
                                onClick={toggleDark}
                                className={`p-2 rounded-full transition flex-shrink-0 ${
                                    isDark
                                        ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                                        : "bg-gray-100 text-indigo-600 hover:bg-gray-200"
                                }`}
                            >
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>

                        <ul className="space-y-2 flex-1">
                            {menuItems.map((item) => (
                                <li
                                    key={item.key}
                                    onClick={() => handleMenuClick(item.key)}
                                    className={`flex items-center gap-4 px-3 py-3 rounded-2xl cursor-pointer transition duration-200 ease-in-out ${
                                        activeMenu === item.key
                                            ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/50"
                                            : `hover:bg-indigo-50 dark:hover:bg-gray-700 ${
                                                isDark ? "text-gray-300" : "text-gray-700"
                                            } hover:text-indigo-600 dark:hover:text-indigo-400`
                                    }`}
                                >
                                    {item.icon}
                                    <span className="text-sm">{item.label}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => router.back()}
                            className={`flex items-center justify-center gap-2 w-full px-4 py-3 mt-auto rounded-xl font-semibold transition ${
                                isDark
                                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                            }`}
                        >
                            <ArrowLeft size={18} /> Ortga
                        </button>
                    </div>
                </aside>

                {/* Content */}
                {/* w-full klassi olib tashlandi, flex-1 faqat qolgan joyni egallaydi. */}
                <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">{renderContent()}</main>
            </div>
        </div>
    )
}

export default App