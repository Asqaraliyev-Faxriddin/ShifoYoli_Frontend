"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UseUserStore";

interface DoctorProfile {
  bio: string;
  images: string[];
  category: { name: string };
  salary?: { monthly?: string }[];
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profileImg?: string;
  doctorProfile?: DoctorProfile;
}

const TopDoctors: React.FC = () => {
  const { isDark } = useUserStore();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Doctor[]>("https://faxriddin.bobur-dev.uz/User/top-doctors")
      .then((res) => setDoctors(res.data.slice(0, 10) || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: "80px 0",
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? "#0b1321" : "#fff",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "80px 20px",
        backgroundColor: isDark ? "#0b1321" : "#fff",
        color: isDark ? "#fff" : "#000",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: "40px",
          color: isDark ? "#60a5fa" : "#1976d2",
          fontSize: "28px",
        }}
      >
        Eng zo‘r Shifokorlar
      </h2>

      {/* Grid container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {doctors.map((doctor) => {
          const fullName = `${doctor.firstName} ${doctor.lastName}`;
          const category = doctor.doctorProfile?.category?.name || "Shifokor";
          const img = doctor.profileImg || "./img/user.png";

          const salaryStrings =
            doctor.doctorProfile?.salary?.map((s) => s.monthly || "") || [];
          const numericSalaries = salaryStrings
            .map((s) => {
              const digits = String(s).replace(/\D/g, "");
              return digits ? Number(digits) : NaN;
            })
            .filter((n) => !Number.isNaN(n));
          const firstSalary = salaryStrings[0] || "Noma'lum";
          const avgSalary =
            numericSalaries.length > 0
              ? Math.round(
                  numericSalaries.reduce((a, b) => a + b, 0) /
                    numericSalaries.length
                ).toLocaleString()
              : "Noma'lum";

          return (
            <div
              key={doctor.id}
              onClick={() => router.push(`/doctors/about/${doctor.id}`)}
              style={{
                position: "relative",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: isDark ? "#120C0B" : "#fff",
                boxShadow: isDark
                  ? "0 6px 18px rgba(0,0,0,0.5)"
                  : "0 6px 18px rgba(2,6,23,0.08)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 300ms ease, box-shadow 300ms ease",
                minHeight: 380, // kattaroq balandlik
              }}
              className="doctor-card"
            >
              {/* Image (biroz kattaroq nisbat, vizual kattaroqlik uchun) */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/10",
                  overflow: "hidden",
                }}
              >
                <img
                  src={img}
                  alt={fullName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.35s ease",
                    filter: isDark ? "brightness(0.95)" : "none",
                  }}
                  className="doctor-img"
                />
              </div>

              {/* Content */}
              <div style={{ padding: "18px", flexGrow: 1 }}>
                <h3
                  style={{
                    fontWeight: "700",
                    fontSize: "18px",
                    margin: 0,
                    marginBottom: "8px",
                  }}
                >
                  {fullName}
                </h3>

                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    marginTop: "6px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.04)",
                    color: isDark ? "#ccc" : "#555",
                    width: "fit-content",
                  }}
                >
                  {category}
                </div>

                {/* Short bio preview if exists */}
                {doctor.doctorProfile?.bio ? (
                  <p
                    style={{
                      marginTop: "12px",
                      marginBottom: "18px",
                      fontSize: "14px",
                      lineHeight: 1.4,
                      color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
                      maxHeight: "3.2em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {doctor.doctorProfile.bio}
                  </p>
                ) : (
                  <div style={{ height: 18 }} />
                )}
              </div>

              {/* Bottom bar: doim ko'rinadi */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderTop: isDark ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,0,0,0.06)",
                  background: isDark ? "rgba(0,0,0,0.25)" : "transparent",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>
                    Oylik: {firstSalary} so‘m
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // karta clickni to'xtatadi
                    router.push(`/doctors/about/${doctor.id}`);
                  }}
                  style={{
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 6px 14px rgba(25,118,210,0.15)",
                    transition: "transform 150ms ease, box-shadow 150ms ease",
                  }}
                  aria-label={`Batafsil ${fullName}`}
                >
                  Batafsil
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Styles */}
      <style jsx>{`
        .doctor-card:hover {
          transform: translateY(-10px);
          box-shadow: ${isDark
            ? "0 16px 40px rgba(0,0,0,0.6)"
            : "0 16px 40px rgba(2,6,23,0.12)"};
        }
        .doctor-card:hover .doctor-img {
          transform: scale(1.04);
        }
        @media (max-width: 900px) {
          /* biroz kichikroq kartalar tablet uchun */
          .doctor-card {
            min-height: 360px;
          }
        }
        @media (max-width: 600px) {
          h2 {
            font-size: 22px;
          }
          .doctor-card {
            min-height: 340px;
          }
        }
      `}</style>
    </div>
  );
};

export default TopDoctors;
