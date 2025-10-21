"use client";

import React, { useState, useEffect } from 'react';
// useUserStore import qilinishi so'ralgan
import { useUserStore } from '@/store/UseUserStore'; 

// Rasmlar ma'lumotining turi
interface RasmTuri {
  id: number;
  url: string;
  sarlavha: string;
}

// 1. Tibbiyotga oid rasmlar ma'lumotlari (Siz bergan mahalliy yo'llar ishlatildi)
const tibbiyotRasmlari: RasmTuri[] = [
  { id: 1, url: './img/premium_photo-1658506671316-0b293df7c72b.avif', sarlavha: "Tibbiy mutaxassislarni tayyorlash" },
  { id: 2, url: './img/photo-1551601651-2a8555f1a136.avif', sarlavha: "Hayotiy Jarrohlik Amaliyotlari" },
  { id: 3, url: './img/premium_photo-1681966826227-d008a1cfe9c7.avif', sarlavha: "Kasalliklarni Tadqiq Qilish Laboratoriyasi" },
];

// Dark mode uchun ranglar palitrasi
const colors = {
    light: {
        background: '#f8f9fa',
        text: '#212529',
        card: '#ffffff',
        primary: '#007bff', // Asosiy rang (Ko'k)
        secondary: '#0056b3', // To'q ko'k
        accent: '#28a745', // Yashil (aksent)
        shadow: 'rgba(0, 0, 0, 0.1)',
        border: '#e9ecef',
    },
    dark: {
        background: '#1a1a1a', // To'q fon
        text: '#f1f1f1',
        card: '#2c2c2c',
        primary: '#6ab0f7', // Ochiqroq ko'k
        secondary: '#007bff',
        accent: '#38c756',
        shadow: 'rgba(0, 0, 0, 0.5)',
        border: '#444444',
    }
};

/**
 * Shifo Yo'li Kompaniyasi haqida ma'lumot va Media Galereya
 */
const ShifoYoliAkademiyaSahifasi: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dark/Light rejimini useUserStore dan olish
  let { isDark } = useUserStore();
  
  // Dark/Light rejimiga qarab stillarni tanlash
  const theme = isDark ? colors.dark : colors.light;
  const currentStyles = getStyles(theme);

  // Avtomatik Slayder Logikasi
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % tibbiyotRasmlari.length);
    }, 5000); // Har 5 soniyada slayd almashadi

    return () => clearInterval(interval);
  }, []);
  
  // Stilizatsiya funksiyasi
  function getStyles(theme: typeof colors.light): { [key: string]: React.CSSProperties } {
    return {
        konteyner: {
            maxWidth: '1200px',
            margin: '40px auto',
            padding: '30px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: theme.background,
            color: theme.text,
            borderRadius: '15px',
            boxShadow: `0 10px 30px ${theme.shadow}`,
            transition: 'background-color 0.5s, color 0.5s',
        },
        sarlavha: {
            textAlign: 'center',
            color: theme.primary,
            marginBottom: '40px',
            fontSize: '2.8em',
            fontWeight: '900',
            textTransform: 'uppercase',
            borderBottom: `4px solid ${theme.secondary}`,
            paddingBottom: '10px',
        },
        // BIZ HAQIMIZDA STILI
        sectionBizHaqimizda: {
            padding: '20px',
            marginBottom: '60px',
            lineHeight: 1.8,
            backgroundColor: theme.card,
            borderRadius: '12px',
            boxShadow: `0 4px 15px ${theme.shadow}`,
            borderLeft: `5px solid ${theme.primary}`,
        },
        bizHaqimizdaKichikSarlavha: {
            color: theme.primary,
            marginTop: '20px',
            marginBottom: '10px',
            fontSize: '1.5em',
            fontWeight: 'bold',
        },
        bizHaqimizdaMatn: {
            marginBottom: '15px',
            fontSize: '1.1em',
            color: theme.text,
        },
        bizHaqimizdaRuyxat: {
            listStyleType: 'disc',
            marginLeft: '40px',
            marginBottom: '20px',
            paddingLeft: '0',
        },
        // MEDIA GALEREYA STILI (Slayder)
        sectionGalereya: {
            padding: '20px 0',
            marginBottom: '30px',
        },
        slayderKonteyner: {
            position: 'relative',
            height: '500px', // Balandlik oshirildi
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: `0 6px 20px ${theme.shadow}`,
            backgroundColor: theme.card,
        },
        slayd: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            transition: 'opacity 1s ease-in-out',
        },
        rasmIchki: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
        },
        slaydSarlavha: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            fontSize: '1.8em', // Kattalashtirildi
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
        },
        nuqtaKonteyner: {
            position: 'absolute',
            bottom: '20px',
            width: '100%',
            textAlign: 'center',
            zIndex: 10,
        },
        nuqta: {
            height: '12px',
            width: '12px',
            margin: '0 8px',
            backgroundColor: theme.border, // Dark mode'da yaxshiroq ko'rinadi
            borderRadius: '50%',
            display: 'inline-block',
            cursor: 'pointer',
            transition: 'background-color 0.4s ease, transform 0.4s',
            // Faol nuqta uchun stil faqat JS da beriladi
        },
    };
  }


  return (
    <div style={currentStyles.konteyner}>
      
      {/* =======================================================
         1. BIZ HAQIMIZDA BO'LIMI
      ======================================================= */}
      <section style={currentStyles.sectionBizHaqimizda}>
        <h2 style={{...currentStyles.sarlavha, marginBottom: '20px'}}>BIZ HAQIMIZDA: SHIFO YO'LI KOMPANIYASI</h2>
        
        <p style={currentStyles.bizHaqimizdaMatn}>
            **"SHIFO YO'LI"** kompaniyasi 08.09.2022 yildan buyon inson salomatligi himoyachisi sifatida faoliyat yuritib kelmoqda. Bizning asosiy vazifamiz — malakali tibbiyot mutaxassislarini tayyorlash orqali yurtimizdagi sog'liqni saqlash sohasini takomillashtirishdir.
        </p>

        <h3 style={currentStyles.bizHaqimizdaKichikSarlavha}>Asosiy Yo'nalishlarimiz:</h3>
        <ul style={currentStyles.bizHaqimizdaRuyxat}>
            <li><span style={{fontWeight: 'bold', color: theme.primary}}>Kadrlar Malakasini Oshirish:</span> Tibbiyot sohasidagi eng yangi texnologiyalar, davolash usullari va xalqaro tibbiy standartlarga asoslangan chuqurlashtirilgan o'quv kurslari.</li>
            <li><span style={{fontWeight: 'bold', color: theme.primary}}>Sog'liqni Saqlash:</span> Aholiga tibbiy xizmatlarni samarali yetkazib berish, diagnostika va profilaktika jarayonlarini optimallashtirish bo'yicha ekspert maslahatlari.</li>
        </ul>
        
        <p style={currentStyles.bizHaqimizdaMatn}>
            Bizning Akademiyamiz shinam o‘quv zallari, eng zamonaviy simulyatsion uskunalar va yuqori malakali, xalqaro tajribaga ega o'qituvchilar bilan ta'minlangan. "Shifo Yo'li" bilan siz o'z professional karyerangizni yurtimizning va xalqaro miqyosdagi eng nufuzli tibbiyot muassasalarida davom ettirishingiz mumkin.
        </p>
      </section>

      <section style={currentStyles.sectionGalereya}>
        <h2 style={currentStyles.sarlavha}>MEDIA GALEREYA</h2>
        <div style={currentStyles.slayderKonteyner}>
          {tibbiyotRasmlari.map((rasm, index) => (
            <div
              key={rasm.id}
              style={{
                ...currentStyles.slayd,
                opacity: index === currentSlide ? 1 : 0,
                zIndex: index === currentSlide ? 1 : 0,
              }}
            >
              <img 
                src={rasm.url} 
                alt={rasm.sarlavha} 
                style={currentStyles.rasmIchki}
                onError={(e) => { 
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; 
                  target.src = "https://via.placeholder.com/1200x600/007bff/ffffff?text=SHIFO+YOLI+RASMI"; 
                }} 
              />
              <div style={currentStyles.slaydSarlavha}>{rasm.sarlavha}</div>
            </div>
          ))} 
          
          <div style={currentStyles.nuqtaKonteyner}>
              {tibbiyotRasmlari.map((_, index) => (
                  <span
                      key={index}
                      style={{
                          ...currentStyles.nuqta,
                          backgroundColor: index === currentSlide ? theme.primary : theme.border,
                          transform: index === currentSlide ? 'scale(1.3)' : 'scale(1)',
                      }}
                      onClick={() => setCurrentSlide(index)}
                  ></span>
              ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default ShifoYoliAkademiyaSahifasi;