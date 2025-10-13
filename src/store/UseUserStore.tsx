import { create } from "zustand";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  password: string; 
  age:number;
  day:number;
  month:number
};


interface UserState {
  user: User | null;
  isDark: boolean;
  doctorId:string;
  email:string
  setUser: (user: User) => void;
  setIsDark: (value: boolean) => void;
  setEmail: (email: string) => void;
  SetDoctorId: (id: string) => void; 
}

export const useUserStore = create<UserState>((set) => ({
  isDark: false,
  user: null,
  email:"",
  doctorId:"",

  SetDoctorId:(id:string)=>set({doctorId:id}),
  setUser: (user) => set({ user }),
  setIsDark: (value: boolean) => set({ isDark: value }),
  setEmail: (email) => set({ email }),
}));
