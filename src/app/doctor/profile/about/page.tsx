"use client"

import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function page() {

    let router = useRouter()
    let [User,SetUser] = useState([])

        async function top(){
        let token = localStorage.getItem("accessToken")

     let res =  await axios.get("https://faxriddin.bobur-dev.uz/profile/my/profile",
            {headers:{
                Authorization: `Bearer ${token}`
            }}
        )

        if(res.status ==401 ){
            router.push("/login")

            return
        }

        
        if(res.status ==400 ){
            router.push("/login")

            return
        }
        

            SetUser(res.data)
        return 

    }

    useEffect(()=>{

        let token = localStorage.getItem("accessToken")

        if(!token){
            router.replace("/login")
            return
        }


        top()
    
    },[])

    
  return (
   <>
   

    
   
   <div>


    <div className='flex-2 justify-between items-center'>




    </div>


    <div className='flex-1 flex justify-around '>


    </div>



   </div>
   
   </>
  )
}

export default page