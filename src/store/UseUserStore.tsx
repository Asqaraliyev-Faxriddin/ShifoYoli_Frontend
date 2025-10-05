import { create } from "zustand";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  password: string; 
  age:number;
};


interface UserState {
  user: User | null;
  isDark: boolean;
  email:string
  setUser: (user: User) => void;
  setIsDark: (value: boolean) => void;
  setEmail: (email: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isDark: false,
  user: null,
  email:"",

  setUser: (user) => set({ user }),
  setIsDark: (value: boolean) => set({ isDark: value }),
  setEmail: (email) => set({ email }),
}));
