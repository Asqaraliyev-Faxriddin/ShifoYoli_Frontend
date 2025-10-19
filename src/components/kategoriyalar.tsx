"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Plus, X, Pencil, Search, Trash2 } from "lucide-react";
import { useUserStore } from "@/store/UseUserStore";
import { useRouter } from "next/navigation";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar"; // MUI Snackbar
import MuiAlert, { AlertProps } from "@mui/material/Alert"; // MUI Alert


const Base_url = "https://faxriddin.bobur-dev.uz"

// --- MUI Alert Komponentasi ---
// Snackbar ichida ishlatish uchun (forwardRef o'rniga oddiy funksiya bilan)
const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

// --- Typelar ---
type Kategoriya = {
  id: string | number;
  nom: string;
  tavsif: string;
  doktorSoni: number;
  rasm?: string; // Eski rasm URL'i
};

// Yangi kategoriya yaratish/tahrirlash uchun qabul qilinadigan data
type SaqlashData = {
  nom: string;
  tavsif: string;
  rasmURL: string | null; // Ko'rsatish uchun URL (eski yoki yangi)
  rasmFile: File | null; // Yangi yuklangan rasm File obyekti
};

// --- Kategoriya KARTASI ---
const KategoriyaKarta = ({
  kategoriya,
  ochirish,
  tahrirlash,
  qorongu,
  role,
}: {
  kategoriya: Kategoriya;
  ochirish: (id: number | string) => void;
  tahrirlash: (k: Kategoriya) => void;
  qorongu: boolean;
  role: string;
}) => {
  const [tasdiqOchirish, setTasdiqOchirish] = useState(false);

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl 
        ${qorongu ? "bg-gray-800 border border-gray-700 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
    >
      {/* Rasm */}
      <div className="relative w-full aspect-video bg-gray-700 flex items-center justify-center">
        {kategoriya.rasm ? (
          <Image
            src={kategoriya.rasm}
            alt={kategoriya.nom}
            width={600}
            height={400}
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="text-gray-400 text-sm p-4">📷 Rasm yo‘q</div>
        )}
      </div>

      {/* Pastki qism */}
      <div className="p-6 flex flex-col items-center text-center">
        <h2 className="text-xl font-bold line-clamp-1">{kategoriya.nom}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{kategoriya.doktorSoni} doktor</p>

        {role === "SUPERADMIN" && (
          <div className="flex gap-3 mt-4 w-full">
            <button
              onClick={() => tahrirlash(kategoriya)}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition duration-200"
            >
              <Pencil className="w-4 h-4 mr-1" /> Tahrirlash
            </button>

            <button
              onClick={() => setTasdiqOchirish(true)}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition duration-200"
            >
              <Trash2 className="w-4 h-4 mr-1" /> O‘chirish
            </button>
          </div>
        )}
      </div>

      {/* Tasdiqlash modal */}
      {tasdiqOchirish && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300"
          onClick={() => setTasdiqOchirish(false)}
        >
          <div
            className={`p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ${
              qorongu ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-center border-b pb-3 border-gray-200 dark:border-gray-700">
              O‘chirishni tasdiqlash
            </h2>
            <p className="text-center mb-6">
              Haqiqatan ham **“{kategoriya.nom}”** kategoriyasini o‘chirmoqchimisiz?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setTasdiqOchirish(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  ochirish(kategoriya.id);
                  setTasdiqOchirish(false);
                }}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition font-medium shadow-md"
              >
                Ha, O‘chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Qo‘shish / Tahrirlash MODALI ---
const KategoriyaModal = ({
  yopish,
  saqlash,
  qorongu,
  tahrirData,
}: {
  yopish: () => void;
  saqlash: (data: SaqlashData, id?: string | number) => void; 
  qorongu: boolean;
  tahrirData?: Kategoriya | null;
}) => {
  const [nom, setNom] = useState(tahrirData?.nom || "");
  const [rasmFile, setRasmFile] = useState<File | null>(null); // Yangi fayl
  const [rasmURL, setRasmURL] = useState<string | null>(tahrirData?.rasm || null); // Ko'rsatish uchun URL

  const yuborish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom) return;

    saqlash(
      { 
        nom, 
        tavsif: "Tavsif kiritilmagan", 
        rasmURL: rasmURL,
        rasmFile: rasmFile 
      },
      tahrirData?.id
    );
    // Modal yopish mantig'i saqlash funksiyasi ichida emas, balki saqlash muvaffaqiyatli bo'lganidan keyin chaqiriladi. 
    // Hozircha saqlash funksiyasi ichidan yopish chaqirilyapti, agar uni asinxron qilsak, bu joy o'zgarishi mumkin.
    // Lekin hozirgi strukturada, saqlash funksiyasi ichidagi axios.post/patch muvaffaqiyatli bo'lsa ham, bu yerda yopiladi.
    // Saqlash funksiyasi asinxron bo'lgani uchun, u yerda snackbar ko'rsatilsa, bu yopish chaqiruvini olib tashlash kerak.
    // Lekin saqlash funksiyasi ichida qayta yuklash logikasi bor, shuning uchun uni tashqarida chaqirmaymiz.
  };

  const rasmTanlash = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRasmFile(file);
      // Agar rasmFile bo'lsa, URL.createObjectURL ni ishlatamiz.
      setRasmURL(URL.createObjectURL(file)); 
    }
  };

  const rasmOchirish = () => {
    // Rasm faylini va URL ni o'chiramiz
    setRasmFile(null);
    setRasmURL(null);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        qorongu ? "bg-black/80" : "bg-black/50"
      }`}
      onClick={yopish}
    >
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl p-8 transform transition-all duration-300 ${
          qorongu ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">
            {tahrirData ? "Kategoriyani tahrirlash" : "Yangi kategoriya qo‘shish"}
          </h2>
          <button
            onClick={yopish}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={yuborish} className="space-y-6">
          {/* Kategoriya nomi */}
          <div>
            <label htmlFor="nom" className="block text-sm font-medium mb-2">
              Kategoriya nomi <span className="text-red-500">*</span>
            </label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition 
                ${qorongu ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
              placeholder="Masalan: Kardiologiya"
              required
            />
          </div>

          {/* Rasm yuklash */}
          <div className="border border-dashed border-gray-400 dark:border-gray-600 p-4 rounded-lg">
            <label className="block text-sm font-medium mb-3">Rasm yuklash/almashtirish</label>
            <input
              type="file"
              accept="image/*"
              onChange={rasmTanlash}
              className={`block w-full text-sm 
                ${qorongu ? "file:bg-gray-700 file:text-white" : "file:bg-blue-50 file:text-blue-700"}
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                hover:file:bg-blue-100 dark:hover:file:bg-gray-600 transition`}
            />

            {rasmURL && (
              <div className="mt-4 flex items-start gap-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={rasmURL}
                    alt="preview"
                    width={100}
                    height={100}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col justify-center flex-grow">
                  <p className="text-sm font-medium truncate">
                    {rasmFile ? rasmFile.name : "Mavjud rasm"}
                  </p>
                  <button
                    type="button"
                    onClick={rasmOchirish}
                    className="mt-2 text-red-500 hover:text-red-700 flex items-center text-xs"
                  >
                    <X className="w-3 h-3 mr-1" /> Rasmni olib tashlash
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tugmalar */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={yopish}
              className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={!nom}
              className="px-5 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition"
            >
              {tahrirData ? "Yangilash" : "Qo‘shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ASOSIY SAHIFA ---
export default function Kategoriyalar() {
  const router = useRouter();
  const { isDark: qorongu } = useUserStore();
  const [role, setRole] = useState("BEMOR");
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [modalOchilgan, setModalOchilgan] = useState(false);
  const [tahrirData, setTahrirData] = useState<Kategoriya | null>(null);
  const [qidiruv, setQidiruv] = useState("");
  const [sahifa, setSahifa] = useState(1);
  const limit = 9;
  
  // Snackbar state'i
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });


  interface User{

    id:string,
    name:string,
    description:string,
    img:string
    _count:{
      doctors:number
    },

  } 

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };


  // ROLE olish
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return router.push("/login");
      try {
        const { data } = await axios.get(`${Base_url}/profile/my/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(data.data.role);
      } catch (e) {
        console.error("Rolni yuklash xatosi:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kategoriyalarni olish
  const fetchKategoriyalar = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return router.push("/login");

      const res = await axios.get(
        `${Base_url}/doctor-category/all?limit=${limit}&offset=${(sahifa - 1) * limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const yangi: Kategoriya[] = res.data.map((el: User) => ({
        id: el.id,
        nom: el.name,
        tavsif: el.description || "",
        doktorSoni: el._count?.doctors || 0,
        rasm: el.img,
      }));

      setKategoriyalar(yangi);
      return yangi; // Qayta yuklash uchun
    } catch (err) {
      console.error("Kategoriyalarni yuklash xatosi:", err);
      return [];
    }
  };

  useEffect(() => {
    fetchKategoriyalar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sahifa, limit, router]);

  // Qo‘shish yoki yangilash
  const saqlash = async (data: SaqlashData, id?: string | number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return router.push("/login");

    const formData = new FormData();
    formData.append("name", data.nom);
    if (data.rasmFile) {
      formData.append("img", data.rasmFile);
    } 

    try {
        if (id) {
            // Tahrirlash (PATCH)
            await axios.patch(`${Base_url}/doctor-category/${id}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            showSnackbar("Kategoriya muvaffaqiyatli yangilandi!", 'success');

        } else {
            // Yaratish (POST)
            await axios.post(`${Base_url}/doctor-category/create`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            showSnackbar("Yangi kategoriya muvaffaqiyatli qo'shildi!", 'success');
        }
        
        // Muvaffaqiyatli saqlangandan so'ng qayta yuklash va modalni yopish
        await fetchKategoriyalar();
        setModalOchilgan(false);
        setTahrirData(null);


    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.data && typeof error.response.data.message) {
            showSnackbar(error.response.data.message.message, 'error');
            
        } else if (axios.isAxiosError(error) && error.response && error.response.data && Array.isArray(error.response.data.message.message)) {
            // Agar xato xabarlari massiv bo'lsa
            console.log(error.response.data.message);
            
            showSnackbar(error.response.data.message.message, 'error');
        } 
        else {
            showSnackbar("Saqlashda kutilmagan xato yuz berdi.", 'error');
        }
    }
  };

  // O‘chirish
  const ochirish = async (id: string | number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return router.push("/login");
    try {
        await axios.delete(`${Base_url}/doctor-category/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setKategoriyalar((old) => old.filter((k) => k.id !== id));
        showSnackbar("Kategoriya muvaffaqiyatli o'chirildi!", 'success');
    } catch (error) {
        console.error("O'chirish xatosi:", error);
        if (axios.isAxiosError(error) && error.response && error.response.data && typeof error.response.data.message === 'string') {
            showSnackbar(error.response.data.message, 'error');
        } else {
            showSnackbar("O'chirishda xato yuz berdi.", 'error');
        }
    }
  };

  const filtrlangan = useMemo(
    () => kategoriyalar.filter((k) => k.nom.toLowerCase().includes(qidiruv.toLowerCase())),
    [kategoriyalar, qidiruv]
  );
  
  return (
    <div
      className={`min-h-screen p-4 sm:p-6 ${
        qorongu ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 pt-4">Tibbiy Kategoriyalar Boshqaruvi</h1>

        {/* Boshqaruv qismi (Qidiruv + Qo‘shish) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-2/3 lg:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                type="text"
                value={qidiruv}
                onChange={(e) => setQidiruv(e.target.value)}
                placeholder="Kategoriyalar ichidan qidirish..."
                className={`w-full p-3 pl-10 rounded-xl border transition duration-200 shadow-sm 
                    ${qorongu ? "bg-gray-800 border-gray-700 placeholder-gray-500" : "bg-white border-gray-300 placeholder-gray-400"}`}
                />
            </div>
            
            {role === "SUPERADMIN" && (
                <button
                onClick={() => {
                    setTahrirData(null);
                    setModalOchilgan(true);
                }}
                className="w-full md:w-auto flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 transition shadow-md"
                >
                <Plus className="w-5 h-5 mr-2" /> Yangi Kategoriya
                </button>
            )}
        </div>

        {/* Kategoriyalar Ro'yxati */}
        {filtrlangan.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                <h3 className="text-xl font-medium mb-2">Hech qanday kategoriya topilmadi.</h3>
                <p>Qidiruv so‘zingizni tekshiring yoki yangi kategoriya qo‘shing.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {filtrlangan.map((kat) => (
                    <KategoriyaKarta
                        key={kat.id}
                        kategoriya={kat}
                        ochirish={ochirish}
                        tahrirlash={(k) => {
                            setTahrirData(k);
                            setModalOchilgan(true);
                        }}
                        qorongu={qorongu}
                        role={role}
                    />
                ))}
            </div>
        )}
        
        {/* Pagination */}
        <div className="flex justify-center mt-10 space-x-4">
            <button
                onClick={() => setSahifa((s) => Math.max(1, s - 1))}
                disabled={sahifa === 1}
                className={`px-4 py-2 rounded-lg border transition ${
                    sahifa === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${qorongu ? 'border-gray-700' : 'border-gray-300'}`}
            >
                Oldingi
            </button>
            <span className={`px-4 py-2 font-semibold rounded-lg ${qorongu ? 'bg-gray-800' : 'bg-white border border-gray-300'}`}>{sahifa}</span>
            <button
                // Agar kelgan elementlar soni limitdan kam bo'lsa, keyingi sahifa yo'q
                onClick={() => setSahifa((s) => s + 1)}
                disabled={kategoriyalar.length < limit}
                className={`px-4 py-2 rounded-lg border transition ${
                    kategoriyalar.length < limit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${qorongu ? 'border-gray-700' : 'border-gray-300'}`}
            >
                Keyingi
            </button>
        </div>


        {/* Modal */}
        {modalOchilgan && (
          <KategoriyaModal
            yopish={() => {
              setModalOchilgan(false);
              setTahrirData(null);
            }}
            saqlash={saqlash}
            qorongu={qorongu}
            tahrirData={tahrirData}
          />
        )}
      </div>

      {/* --- Snackbar (MUI) --- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%', minWidth: 250 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}