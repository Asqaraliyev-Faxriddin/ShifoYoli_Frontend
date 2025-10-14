"use client";

import React, { useState } from "react";
import { useUserStore } from "@/store/UseUserStore";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  IconButton,
  Button,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

function Footer() {
  const { isDark } = useUserStore();
  const [showVideo, setShowVideo] = useState(false);

  const toggleVideo = () => setShowVideo((prev) => !prev);

  return (
    <footer
      className={`w-full ${
        isDark ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center px-5 py-12 gap-6">
        {/* Logo */}
        <Image
          src={isDark ?  "/img/logo-dark.svg" :  "/img/logo.svg"}
          alt="ShifoYoli Logo"
          width={160}
          height={50}
          priority
        />

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
          ShifoYoli – Sog‘liq yo‘lidagi hamrohingiz
        </h2>

        {/* Subtitle */}
        <p
          className={`max-w-[650px] text-base md:text-lg ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          ShifoYoli platformasi – tajribali shifokorlar va mutaxassislar
          tomonidan tayyorlangan tibbiy kurslar orqali sog‘liq va bilimni bir
          joyda taqdim etadi.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-3 flex-wrap justify-center">
          <Button
            onClick={toggleVideo}
            variant="outlined"
            startIcon={<PlayCircleOutlineIcon />}
            sx={{
              borderColor: isDark ? "#6b7280" : "#9ca3af",
              color: isDark ? "#e5e7eb" : "#374151",
              "&:hover": {
                backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
              },
            }}
          >
            {showVideo ? "Orqaga" : "Intro video"}
          </Button>

          <Button
            href="/boglanish"
            variant="contained"
            sx={{
              backgroundColor: isDark ? "#3b82f6" : "#2563eb",
              "&:hover": {
                backgroundColor: isDark ? "#2563eb" : "#1d4ed8",
              },
            }}
          >
            Bog‘lanish
          </Button>
        </div>

        {/* Video Dialog */}
        <Dialog
          open={showVideo}
          onClose={toggleVideo}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: isDark ? "#111827" : "#fff",
            },
          }}
        >
          <DialogContent className="relative p-0">
            <IconButton
              onClick={toggleVideo}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
            <video
              src="/video/shifokorlar.mp4"
              controls
              autoPlay
              className="w-full h-auto rounded-lg"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Footer bottom */}
      <div
        className={` ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center px-5 py-4 text-sm gap-2">
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            © 2024 ShifoYoli. Barcha huquqlar himoyalangan
          </p>
          <a
            href="#"
            className={`transition ${
              isDark ? "hover:text-blue-400" : "hover:text-blue-600"
            }`}
          >
            Maxfiylik siyosati
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
