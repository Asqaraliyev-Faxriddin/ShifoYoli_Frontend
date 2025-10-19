"use client";

import { useState, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import {
  Home,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Moon,
  Sun,
  Layers,
  MessageCircleMore,
  Menu as MenuIcon,
  List,
  Stethoscope,
  UserX,
  MessageSquare,
} from "lucide-react";
import { Snackbar, Alert, Slide, SlideProps } from "@mui/material";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UseUserStore";

// Component imports
import Doktor from "@/components/doktor";
import Tolovlar from "@/components/tolovlar";
import Sozlamalar from "@/components/sozlamalar";
import HomeUser from "@/components/home";
import Notification from "@/components/notification";
import Kategoriyalar from "@/components/kategoriyalar";
import Bemorlar from "@/components/bemorlar";
import Xabarlashish from "@/components/xabarlashish";
import MyDocktors from "@/components/MyDoctors";
import Mybemors from "@/components/Mybemors";
import Check_Docktor from "@/components/Check_Docktor";

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

interface MenuItem {
  id: string;
  label: string;
  icon: JSX.Element;
}

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profileImg?: string;
  notifications: {
    isFalseRead: number;
  };
} 


const Base_url = "https://faxriddin.bobur-dev.uz"


export default function ProfileLayout() {
  const [active, setActive] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User>({} as User);
  const [notifications, setNotifications] = useState(0);
  const [dropdown, setDropdown] = useState(false);
  const [openGreet, setOpenGreet] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { isDark, setIsDark } = useUserStore();
  const router = useRouter();

  // ✅ Rolga qarab menyularni tanlash
  const getMenusByRole = (role: string | undefined): MenuItem[] => {
    const baseMenus = {
      home: { id: "home", label: "Bosh sahifa", icon: <Home size={20} /> },
      shifokorlar: { id: "shifokorlar", label: "Shifokorlar", icon: <Users size={20} /> },
      bemorlar: { id: "bemorlar", label: "Bemorlar", icon: <UserX size={20} /> },
      kategoriyalar: { id: "kategoriyalar", label: "Kategoriyalar", icon: <List size={20} /> },
      izohlar: { id: "notifications", label: "Izohlar", icon: <MessageCircleMore size={20} /> },
      xabarlashish: { id: "xabarlashish", label: "Xabarlashish", icon: <MessageSquare size={20} /> },
      tolovlar: { id: "settings", label: "To‘lovlar", icon: <Layers size={20} /> },
      mybemors: { id: "mybemors", label: "Mening Bemorlarim", icon: <Users size={20} /> },
      checkDocktor: { id: "checkdocktor", label: "Shifokorlarni tekshirish", icon: <Users size={20} /> },


      mydoctors: { id: "mydoctors", label: "Mening shifokorlarim", icon: <Stethoscope size={20} /> },

      sozlamalar: { id: "sozlamalar", label: "Sozlamalar", icon: <Settings size={20} /> },


      chiqish: { id: "chiqish", label: "Chiqish", icon: <LogOut size={20} /> },
    };

    // 🧑‍⚕️ Shifokor (DOCTOR)
    if (role === "DOCTOR") {
      return [
        baseMenus.home,
        baseMenus.mybemors,
        baseMenus.tolovlar,
        baseMenus.izohlar,
        baseMenus.kategoriyalar,
        baseMenus.xabarlashish,
        baseMenus.sozlamalar,
        baseMenus.chiqish,
      ];
    }

    // 👨‍🧑 Bemor (USER yoki PATIENT)
    if (role === "BEMOR") {
      return [
        baseMenus.home,
      baseMenus.kategoriyalar,
        baseMenus.shifokorlar,
        baseMenus.mydoctors,
        baseMenus.tolovlar,
        baseMenus.izohlar,
        baseMenus.xabarlashish,
        baseMenus.sozlamalar,
        baseMenus.chiqish,
      ];
    }

    // 🧑‍💼 SuperAdmin (SUPERADMIN)
    return [
      baseMenus.home,
      baseMenus.shifokorlar,
      baseMenus.bemorlar,
      baseMenus.mydoctors,
      baseMenus.mybemors,
      baseMenus.checkDocktor,
      baseMenus.kategoriyalar,
      baseMenus.xabarlashish,
      baseMenus.tolovlar,
      baseMenus.izohlar,
      baseMenus.sozlamalar,
      baseMenus.chiqish,
    ];
  };

  const menus = getMenusByRole(user?.role);


  // ✅ Foydalanuvchi ma'lumotlarini olish
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return router.push("/login");

        const { data } = await axios.get(`${Base_url}/profile/my/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = {
          ...data.data,
          fullName: `${data.data.firstName} ${data.data.lastName}`,
        };

        
        
        setUser(userData);
        setNotifications(data.data.notifications.isFalseRead || 0);
      }  catch (error) {
        const err = error as AxiosError;
      
        if (err.response?.status === 401) {
          router.push("/login");
        } else {
          console.error("Profile fetch error:", err.message || err);
        }
      }
    }

    fetchProfile();
  }, [router]);

  // ✅ Salomlashish
  useEffect(() => {
    if (user?.fullName) {
      speechSynthesis.cancel();
      const speakUser = () => {
        const text = `Welcome to the site, ${user.firstName}!`;
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();
        const englishVoice =
          voices.find((v) => v.lang === "en-US") ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];

        if (englishVoice) utterance.voice = englishVoice;
        utterance.lang = "en-US";
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
      };

      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = speakUser;
      } else {
        speakUser();
      }
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  const handleMenuClick = (id: string) => {
    if (id === "chiqish") {
      handleLogout();
    } else {
      setActive(id);
    }
    setIsMobileMenuOpen(false);
  };

  // ✅ Sahifani render qilish
  const renderPage = () => {
    switch (active) {
      case "home":
        return <HomeUser />;
      case "doktor":
      case "shifokorlar":
        return <Doktor />;
      case "settings":
        return <Tolovlar />;
      case "notifications":
        return <Notification />;
      case "sozlamalar":
        return <Sozlamalar />;
      case "kategoriyalar":
        return <Kategoriyalar />;
      case "bemorlar":
        return <Bemorlar />;
      case "xabarlashish":
        return <Xabarlashish />;
        case "checkdocktor":
          return <Check_Docktor />;


        case "mydoctors":
          return <MyDocktors />;

          
        case "mybemors":
          return <Mybemors />;


      default:
        return <HomeUser />;
    }
  };
  return (
    <div className={`flex min-h-screen ${isDark ? "dark bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
      
      {/* 1. Sidebar (Desktop) */}
      <aside
  className={`hidden md:flex flex-col shadow-2xl transition-all duration-300 z-30 fixed left-0 top-0 bottom-0
    ${collapsed ? "w-20 items-center" : "w-64"}
    ${isDark ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"}
  `}
>
  {/* Logo/Header */}
  <div
    className={`flex items-center ${
      collapsed ? "justify-center" : "justify-between"
    } p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
  >
    {!collapsed && (
      <img
        src={isDark ? "/img/logo-dark.svg" : "/img/logo.svg"}
        alt="logo"
        className="h-10 w-auto"
      />
    )}
    <button
      onClick={() => setCollapsed(!collapsed)}
      className={`p-2 rounded-full transition
        ${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}
      `}
    >
      {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
    </button>
  </div>

  {/* Asosiy menyu scroll bo‘ladigan qism */}
  <div className="flex-1 overflow-y-auto px-3 py-4">
    <nav className="flex flex-col gap-2">
      {menus.map((menu) => (
        <button
          key={menu.id}
          onClick={() => (menu.id === "chiqish" ? handleLogout() : setActive(menu.id))}
          className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 
            ${collapsed ? "justify-center" : ""}
            ${
              active === menu.id
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/50 font-semibold"
                : `hover:bg-blue-100 hover:text-blue-600 ${
                    isDark
                      ? "text-gray-300 dark:hover:bg-gray-700 dark:hover:text-orange-400"
                      : "text-gray-700"
                  }`
            }`}
        >
          {menu.icon}
          {!collapsed && <span className="text-left flex-1">{menu.label}</span>}
          {(menu.id === "notifications") && notifications > 0 && !collapsed && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
      ))}
    </nav>
  </div>


</aside>


      {/* 2. Main Content Area */}
      <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        
        {/* Salomlashish Snackbar */}
        {user && (
          <Snackbar
            open={openGreet}
            onClose={() => setOpenGreet(false)}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            TransitionComponent={SlideTransition}
          >
            <Alert
              onClose={() => setOpenGreet(false)}
              severity="success"
              variant="filled"
              sx={{
                width: "100%",
                fontWeight: "bold",
                fontSize: "1rem",
                borderRadius: "12px",
                backgroundColor: "#22C55E",
                color: "white"
              }}
            >
              👋 Salom {user.firstName || "Foydalanuvchi"}! Xush kelibsiz
            </Alert>
          </Snackbar>
        )}

        {/* Top Navbar */}
        <div className={`flex justify-between mb-8 items-center p-3 rounded-2xl shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
          
          {/* Title / Mobile Menu Button */}
          <div className="flex items-center">
             <button 
                 onClick={() => setIsMobileMenuOpen(true)} 
                 className="p-2 mr-3 rounded-full md:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
             >
                 <MenuIcon size={24} />
             </button>
             <div
               className={`font-extrabold text-2xl md:text-3xl ${
                 isDark ? "text-white" : "text-gray-800"
               }`}
             >
       { user?.role? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase():""} Panel

             </div>
          </div>
          

          {/* Icons and User Info */}
          <div className="flex gap-4 items-center">
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setActive("notifications")}
                className={`p-3 rounded-full transition hover:scale-105 ${
                  isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Bell size={20} className={`${isDark ? "text-white" : "text-blue-500"}`} />
              </button>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-3 rounded-full transition hover:scale-105 bg-gray-200 dark:bg-gray-700"
            >
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
            </button>

            {/* User info */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdown(!dropdown)}
                className={`flex items-center gap-3 rounded-2xl p-1 pr-3 transition hover:shadow-xl ${
                  isDark ? "bg-gray-700" : "bg-white border border-gray-200"
                }`}
              >
                <img
                  src={
                    user?.profileImg ? `${user.profileImg}`: "/img/user.png"
                  }
                  alt="user"
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
                />
                <div className="hidden sm:block text-left">
                  <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                    {user?.firstName || "Foydalanuvchi"}
                  </p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {user?.role || "USER"}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content Render */}
        <div className="mt-8">
            {renderPage()}
        </div>
      </main>

      {/* 3. Mobile Sidebar (Modal) */}
      <div
  ref={mobileMenuRef}
  className={`fixed top-0 left-0 h-full w-full bg-black bg-opacity-50 z-50 transform md:hidden transition-opacity duration-300
    ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
>
  <aside
    className={`absolute top-0 left-0 h-full w-64 flex flex-col shadow-2xl transition-transform duration-300 
      ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}
      ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
    onClick={(e) => e.stopPropagation()}
  >
    {/* Yuqori qismlar */}
    <div className="flex justify-end mb-4 p-2">
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronLeft size={24} />
      </button>
    </div>

    {/* Scroll bo‘ladigan qism */}
    <div className="flex-1 overflow-y-auto px-2 pb-6">
      <nav className="flex flex-col gap-2">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => handleMenuClick(menu.id)}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-left
              ${
                active === menu.id
                  ? "bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/50"
                  : `hover:bg-blue-100 hover:text-blue-600 ${
                      isDark
                        ? "text-gray-300 dark:hover:bg-gray-700 dark:hover:text-orange-400"
                        : "text-gray-700"
                    }`
              }`}
          >
            {menu.icon}
            <span>{menu.label}</span>
          </button>
        ))}
      </nav>


    </div>
  </aside>
</div>

      
    </div>
  );
}