"use client"


import FullTeachers from "@/components/full-teachers";
import TopDoctors from "@/components/teachers";
import Footer from "@/pages/Footer";
import Header from "@/pages/Header";
import { useUserStore } from "@/store/UseUserStore";


export default function Home() {
  
  
  const { isDark } = useUserStore();
  
  return (
  
      <>

      <Header/>
      <main className={`w-full pt-10  mt-[80px] ${isDark ? "bg-gray-900 text-white" : "bg-white  text-black"}`}  >
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-16 gap-10">
              <div className="flex-1 space-y-5 text-center md:text-left ">
                <h1 className="text-4xl md:text-5xl font-bold leading-snug w-[330px] text-left">
                  <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Shifokor bilan
                  </span>{" "}

                  <span className="w-[100px]">{`masofadan tez va qulay bog‘laning!`}</span>

                </h1>
                <p className={`text-lg  ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Online shifokorlarni toping
                </p>
              
              </div>
              <div className="flex-1 flex justify-center">
                <img src="./img/home.jpg" alt="Hero" className="max-w-full md:max-w-[500px] rounded-2xl" />
              </div>
            </div>
          </main>


            <section className={`${isDark ? "bg-gray-900 text-white" : "bg-white text-black"} py-10`}>
            <div className="max-w-[1200px] mx-auto text-center px-4">
              <p className="text-3xl md:text-4xl font-bold">Ko‘p murojaat qilinadigan shifokorlar</p>
              <p className={`mt-4 max-w-3xl mx-auto w-[320px] ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Tajribali shifokorlar bilan masofadan tez va qulay bog‘laning.
               Sizning sog‘lig‘ingiz uchun eng zamonaviy usullar asosida maslahat va yo‘l-yo‘riqlar oling.

              </p>
            </div>


          {/* components */} {/* Corrected spelling */}

            </section>


          <section className={`${isDark ? "bg-gray-900 text-white" : "bg-white text-black"} py-10 px-4`}>

        <TopDoctors/>

    </section>


    
    <section className={`${isDark ? "bg-gray-900 text-white" : "bg-white text-black"} py-10 px-4`}>
  <div className="max-w-6xl mx-auto px-4 text-center">
      <h2 className="text-4xl font-bold mb-4">Bizga qo'shiling</h2>
    <p className={`${isDark ? "bg-gray-900 text-white" : "bg-white text-black"} mb-5 mt-5`}>
      Bizning safimizga nafaqat o‘rganuvchi balki yetarlicha tajribangiz bo‘lsa  sifatida ham qo‘shilishingiz mumkin.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-3 mt-6">
  <div className={`p-6 rounded-lg shadow hover:shadow-lg transition ${
      isDark ? "bg-gray-900 text-white" : "bg-white text-black"
    }`}
  >
    <h3 className="text-2xl font-semibold mb-2">Bemorsizmi?</h3>
    <p className="mb-5 mt-5">
      Agarda bemor bo‘lsangiz bizning xalqaro darajadagi tajribali shifokorlarimiz orqali tezroq davolaning.
    </p>
    <a 
      href="/register" 
      className="bg-blue-500 text-white px-7 py-2 rounded-lg hover:bg-blue-600 transition inline-block"
    >
      Boshlash
    </a>
  </div>

  <div className={`p-6 rounded-lg shadow hover:shadow-lg transition ${
      isDark ? "bg-gray-900 text-white" : "bg-white text-black"
    }`}
  >
    <h3 className="text-2xl font-semibold mb-2">Shifokormisiz?</h3>
    <p className="mb-5 mt-5">
      Bizning Shifokorlar jamoamizga qo‘shilib, o‘z tajribangizni boshqalar bilan oson va qulay platforma orqali ulashing
    </p>
    <a 
      href="https://t.me/Asqaraliyev_Faxriddin" 
      className="bg-blue-500 text-white px-7 py-2 rounded-lg hover:bg-blue-600 transition inline-block"
    >
      Boshlash
    </a>
  </div>
</div>



  </div>
</section>


    <section className={`${isDark ? "bg-gray-900 text-white" : "bg-white text-black"} py-10 px-4`}>
      <FullTeachers/>
    </section>




      <Footer/>

      </>



  );
}
