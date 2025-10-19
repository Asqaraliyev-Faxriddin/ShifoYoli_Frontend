"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/UseUserStore";
import Header from "@/pages/Header";
import Footer from "@/pages/Footer";

interface DoctorProfile {
  bio: string;
  images: string[];
  category: { name: string; img?: string };
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  profileImg: string;
  doctorProfile?: DoctorProfile;
}

interface DoctorsResponse {
  data: Doctor[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const Base_url = "https://faxriddin.bobur-dev.uz"


const Home: React.FC = () => {
  const { isDark } = useUserStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const fetchDoctors = async (limitValue = 10) => {
    setLoading(true);
    try {
      const res = await axios.get<DoctorsResponse>(
        `${Base_url}/User/doctors/All?limit=${limitValue}&page=1`
      );
      setDoctors(res.data.data);
      setTotal(res.data.meta.total);
    } catch (err) {
      console.error("Doktorlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(limit);
  }, [limit]);

  const handleShowMore = () => {
    setLimit((prev) => prev + 10);
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? "#0b1321" : "#fff",
        color: isDark ? "#fff" : "#000",
      }}
    >
      <Header />

      {/* --- Tajribali Doktorlar --- */}
      <section style={{ padding: "100px 20px" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#007bff",
            marginBottom: "50px",
          }}
        >
          Bizning Tajribali Doktorlarimiz
        </h2>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px 0",
            }}
          >
            <div className="loader"></div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "30px",
              maxWidth: "1300px",
              margin: "0 auto",
            }}
          >
            {doctors.map((doctor) => {
              const fullName = `${doctor.firstName} ${doctor.lastName}`;
              const bio = doctor.doctorProfile?.bio || "Ma'lumot mavjud emas";
              const category =
                doctor.doctorProfile?.category?.name || "Shifokor";
              const img = doctor.profileImg || "/img/user.png";

              return (
                <div
                  key={doctor.id}
                  className="doctor-card"
                  style={{
                    backgroundColor: isDark ? "#120C0B" : "#fff",
                    color: isDark ? "#fff" : "#000",
                    borderRadius: "20px",
                    overflow: "hidden",
                    position: "relative", // <--- MUHIM!
                    boxShadow: isDark
                      ? "0 6px 12px rgba(0,0,0,0.5)"
                      : "0 6px 12px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/doctors/about/${doctor.id}`)}
                >
                  <img
                    src={img}
                    alt={fullName}
                    style={{
                      width: "100%",
                      height: "280px",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = "/img/user.png")
                    }
                  />

                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        marginBottom: "6px",
                      }}
                    >
                      {fullName}
                    </h3>
                    <p
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)",
                        color: isDark ? "#ccc" : "#555",
                      }}
                    >
                      {category}
                    </p>
                  </div>

                  {/* Hover info */}
                  <div className="hover-info">
                    <p>{bio.length > 100 ? bio.slice(0, 100) + "..." : bio}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/doctors/about/${doctor.id}`);
                      }}
                    >
                      Batafsil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && doctors.length < total && (
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <button
              onClick={handleShowMore}
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                padding: "12px 40px",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ko‘proq ko‘rish
            </button>
          </div>
        )}
      </section>

      <Footer />

      <style jsx>{`
        .loader {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .doctor-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
        }

        .hover-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          transform: translateY(20px);
        }

        .doctor-card:hover .hover-info {
          opacity: 1;
          transform: translateY(0);
        }

        .hover-info button {
          background-color: #007bff;
          border: none;
          color: white;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 8px;
        }

        @media (hover: none) {
          .hover-info {
            opacity: 1 !important;
            transform: none !important;
            position: relative;
            background: transparent;
            color: inherit;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
