"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";


// ⚡ Masalan, Zustand yoki boshqa store ishlatayotgan bo‘lsangiz, uni o‘zingiz ulang
import { useUserStore } from "@/store/UseUserStore"; 

export default function Header() {
  const { isDark, setIsDark } = useUserStore();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(false);

  const menuItems = [
    { name: "Asosiy", path: "/" },
    { name: "Biz haqimizda", path: "/contact" },
    { name: "Bog'lanish", path: "/boglanish" },
  ];

  const logoSrc = isDark ?  "/img/logo-dark.svg" :  "/img/logo.svg"

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors backdrop-blur-md shadow-md ${
        isDark ? "!bg-[#0B1222]/90" : "bg-white/90"
      }`}
    >
      <div className="max-w-[1200px] ml-[6%] md:ml-[7.5%] lg:ml-[9.12%] h-[86px] flex justify-between items-center px-4 md:px-10">
        {/* Logo */}
        <Link href="/" className="gap-2">
          <img src={logoSrc} alt="logo" className="h-[50px] w-[120px]" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 text-[18px] z-50 relative mr-[280px]">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`transition-colors pb-1 ${
                    isActive
                      ? "text-blue-500 underline underline-offset-4 font-semibold"
                      : isDark
                      ? "text-white hover:text-blue-400"
                      : "text-black hover:text-blue-500"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
  onClick={() => setIsDark(!isDark)}
  className={`w-[38px] h-[40px] flex items-center justify-center rounded-full transition-shadow ${
    isDark
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-300 hover:bg-gray-400"
  }`}
>
  {isDark ? (
    <DarkModeIcon style={{ fontSize: 24, opacity: 0.7 }} />
  ) : (
    <LightModeIcon style={{ fontSize: 24, opacity: 0.7 }} />
  )}
</button>


          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-2.5 rounded-xl transition-transform"
            >
              Kirish
            </Link>
          </div>

          {/* Mobile Kirish Button */}
          <div className="md:hidden">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Kirish
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setOpenMenu(true)}>
            <MenuIcon className="text-blue-500" fontSize="large" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        PaperProps={{
          style: {
            backgroundColor: isDark
              ? "rgba(11, 18, 34, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            color: isDark ? "#fff" : "#000",
            backdropFilter: "blur(6px)",
          },
        }}
      >
        <div className="w-[250px] p-4 flex flex-col h-full">
          {/* Drawer Logo */}
          <div className="flex justify-between items-center mb-4">
            <Link href="/" onClick={() => setOpenMenu(false)}>
              <img src={logoSrc} alt="logo" className="h-[40px] w-auto" />
            </Link>
            <button onClick={() => setOpenMenu(false)}>
              <CloseIcon className="text-blue-500" />
            </button>
          </div>

          {/* Mobile Menu Items */}
          <ul className="flex flex-col gap-4 text-[18px]">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path} onClick={() => setOpenMenu(false)}>
                  <Link
                    href={item.path}
                    className={`pb-1 ${
                      isActive
                        ? "text-blue-500 underline underline-offset-4 font-semibold"
                        : isDark
                        ? "text-white hover:text-blue-400"
                        : "text-black hover:text-blue-500"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Drawer>
    </header>
  );
}
