"use client";

import React, { useEffect, useState } from "react";

interface ChatDoctorProps {
  doctorId: string;
  onClose?: () => void;
}

const Chat_Doctor: React.FC<ChatDoctorProps> = ({ doctorId, onClose }) => {
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      const fakeDoctor = {
        id: doctorId,
        name: doctorId === "1" ? "Alijon Valiyev" : "Mohira Karimova",
        category: doctorId === "1" ? "Kardiolog" : "Pediatr",
      };
      setDoctor(fakeDoctor);
    };

    fetchDoctor();
  }, [doctorId]);

  if (!doctor) return null;

  return (
    <>
      {/* 🔹 Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 399,
        }}
      />

      {/* 🔹 Modal oyna */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          borderRadius: "10px",
          padding: "20px",
          width: "500px",
          maxWidth: "90%",
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>💬 {doctor.name} bilan suhbat</h2>
        <p style={{ marginBottom: "20px" }}>
          Mutaxassisligi: <b>{doctor.category}</b>
        </p>

        <div
          style={{
            height: "200px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            overflowY: "auto",
            marginBottom: "10px",
          }}
        >
          <p style={{ color: "#666" }}>Chat bo‘sh. Xabar yuboring...</p>
        </div>

        <input
          type="text"
          placeholder="Xabar yozing..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "10px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Yopish
          </button>

          <button
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Yuborish
          </button>
        </div>
      </div>
    </>
  );
};

export default Chat_Doctor;
