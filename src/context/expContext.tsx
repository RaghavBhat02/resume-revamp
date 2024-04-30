'use client'
import type { FinalExperience } from "@/types/experience";
import { createContext, useContext, useState, ReactNode } from "react";

type ExperienceContext = {
  exp: FinalExperience[],
  setExp: (e: FinalExperience[]) => void
}

const constInit: ExperienceContext = {
  exp: [],
  setExp: (e: FinalExperience[]) => {}
}
const Context = createContext(constInit);

export function useExperienceContext() {
  const context = useContext(Context);

  return context;
}

export default function ExperienceContextProvider({ children }: { children: ReactNode}) {
  const [ exp, setExp ] = useState<FinalExperience[]>([]);

  return (
    <Context.Provider value={{ exp, setExp }}>
      {children}
    </Context.Provider>
  )
}