"use client";

import { useUserStore } from "@/store/UseUserStore";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { shallow } from "zustand/shallow";
import Chat_Doctor from "./chat-doktor";

// --- Typing ---
interface DoktorType {
  id: number;
  firstName: string;
  lastName: string;
  category: string;
  bio: string;
  salary: number;
  photoUrl: string;
}

// --- Mock Data ---
const MOCK_DOKTORS_DATA: DoktorType[] = [
  {
    id: 1,
    firstName: "Alijon",
    lastName: "Valiyev",
    category: "Kardiolog",
    bio: "5 yillik tajribaga ega, yurak xastaliklari bo'yicha yuqori malakali shifokor.",
    salary: 15000000,
    photoUrl: "https://via.placeholder.com/150x150?text=Alijon+V.",
  },
  {
    id: 2,
    firstName: "Mohira",
    lastName: "Karimova",
    category: "Pediatr",
    bio: "Bolalar salomatligi bo'yicha mutaxassis, ota-onalar bilan a'lo darajada muloqot qiladi.",
    salary: 12000000,
    photoUrl: "https://via.placeholder.com/150x150?text=Mohira+K.",
  },
  {
    id: 3,
    firstName: "Jahongir",
    lastName: "Sobirov",
    category: "Nevropatolog",
    bio: "Asab tizimi kasalliklarini davolashda katta tajribaga ega yetakchi mutaxassis.",
    salary: 18000000,
    photoUrl: "https://via.placeholder.com/150x150?text=Jahongir+S.",
  },
];

// --- Oylik formatlash ---
const formatSalary = (salary: number): string => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  })
    .format(salary)
    .replace(/\sUZS$/, " UZS");
};

// --- Asosiy komponent ---
const Doktor: React.FC = () => {
  const [doktors] = useState<DoktorType[]>(MOCK_DOKTORS_DATA);
  const router = useRouter();

  // Zustand — shallow bilan
  const { isDark, SetDoctorId, doctorId } = useUserStore( );

  const [isChatOpen, setIsChatOpen] = useState(false);

  // --- Funksiyalar ---1
  const handleFullInfoClick = (id: number) => {
    router.push(`/doctors/about/${id}`);
  };

  const handleChatClick = (id: number) => {
    SetDoctorId(id.toString());
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // --- Dark mode style ---
  const styles = useMemo(
    () => ({
      mainBackground: isDark ? "#1a1a1a" : "#f0f2f5",
      cardBackground: isDark ? "#2c2c2c" : "#fff",
      headerBackground: isDark ? "#333" : "#e6f7ff",
      primaryText: isDark ? "#fff" : "#333",
      secondaryText: isDark ? "#ccc" : "#555",
      primaryColor: "#007bff",
      successColor: "#28a745",
      boxShadow: isDark
        ? "0 6px 12px rgba(0, 0, 0, 0.5)"
        : "0 6px 12px rgba(0, 0, 0, 0.15)",
      borderColor: isDark ? "#444" : "#ddd",
    }),
    [isDark]
  );

  return (
    <div style={{ backgroundColor: styles.mainBackground, minHeight: "100vh" }}>
      {/* Sarlavha */}
      <div
        style={{
          padding: "20px",
          backgroundColor: styles.headerBackground,
          borderBottom: `2px solid ${styles.primaryColor}`,
        }}
      >
        <h1
          style={{
            color: styles.primaryColor,
            textAlign: "center",
            margin: 0,
            fontSize: "2.5rem",
          }}
        >
          Shifokorlar Ro'yxati
        </h1>
      </div>

      {/* Kartalar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "30px",
          padding: "30px",
          justifyContent: "center",
        }}
      >
        {doktors.map((doktor) => (
          <div
            key={doktor.id}
            style={{
              flex: "0 0 calc(50% - 15px)",
              minWidth: "350px",
              border: `1px solid ${styles.borderColor}`,
              borderRadius: "15px",
              padding: "25px",
              boxShadow: styles.boxShadow,
              backgroundColor: styles.cardBackground,
              display: "flex",
              gap: "25px",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = isDark
                ? "0 10px 20px rgba(0, 0, 0, 0.8)"
                : "0 8px 16px rgba(0, 0, 0, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = styles.boxShadow;
            }}
          >
            {/* Rasm */}
            <div style={{ flexShrink: 0, paddingTop: "5px" }}>
              <img
                src={doktor.photoUrl}
                alt={`${doktor.firstName} ${doktor.lastName}`}
                style={{
                  width: "130px",
                  height: "130px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `4px solid ${styles.primaryColor}`,
                }}
              />
            </div>

            {/* Ma'lumot */}
            <div style={{ flexGrow: 1 }}>
              <h2
                style={{
                  margin: "0 0 10px 0",
                  color: styles.primaryText,
                  fontSize: "1.7rem",
                }}
              >
                {doktor.firstName} {doktor.lastName}
              </h2>
              <p
                style={{
                  margin: "5px 0",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  color: styles.primaryColor,
                }}
              >
                Mutaxassisligi: {doktor.category}
              </p>
              <p
                style={{
                  margin: "5px 0",
                  color: styles.secondaryText,
                  fontSize: "0.95rem",
                }}
              >
                Bio: {doktor.bio}
              </p>
              <p
                style={{
                  margin: "5px 0",
                  fontWeight: "600",
                  color: styles.successColor,
                }}
              >
                Oylik maosh: {formatSalary(doktor.salary)}
              </p>

              {/* Tugmalar */}
              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleFullInfoClick(doktor.id)}
                  style={{
                    padding: "10px 15px",
                    cursor: "pointer",
                    backgroundColor: styles.primaryColor,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    flexGrow: 1,
                    transition: "background-color 0.3s",
                  }}
                >
                  To'liq Ma'lumot
                </button>

                <button
                  onClick={() => handleChatClick(doktor.id)}
                  style={{
                    padding: "10px 15px",
                    cursor: "pointer",
                    backgroundColor: styles.successColor,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    flexGrow: 1,
                    transition: "background-color 0.3s",
                  }}
                >
                  Suhbatlashish
                </button>
              </div>
            </div>
          </div>
        ))}

        {doktors.length === 0 && (
          <p
            style={{
              width: "100%",
              textAlign: "center",
              color: styles.primaryText,
            }}
          >
            Hozircha shifokorlar ro'yxati bo'sh.
          </p>
        )}
      </div>

      {/* ✅ Faqat Chat_Doctor ni ochamiz */}
      {isChatOpen && <Chat_Doctor  />}
    </div>
  );
};

export default Doktor;
