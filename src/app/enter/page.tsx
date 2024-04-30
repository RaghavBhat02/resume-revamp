'use client'

import { useState, FormEvent, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation";
import { UserCredential } from "firebase/auth";

import { Mukta } from "next/font/google";
import signUp from "@/firebase/auth/signup";
import signIn from "@/firebase/auth/signin";
import Link from "next/link";

const mukta = Mukta({ subsets: [ 'latin'], weight: ['200', '300', '400', '500', '600', '700', '800']})

export default function Page() {
  const [email, setEmail ] = useState<string>("");
  const [password, setPassword ] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const signInOrUp = useMemo(() => searchParams.get('join') === 'us' ? false : true, [searchParams]);
  let authFunction: (email: string, password: string) => Promise<{result: UserCredential | null; error: unknown;}>;
  if(signInOrUp) {
    authFunction = signIn
  } else {
    authFunction = signUp
  }
  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { result, error } = await authFunction(email, password);
    if (error) {
      console.error(error);
      return (
        <main>
          Sorry there was an error getting you in! Please reload the page and try again. If this issue persists, please contact bhatr@umich.edu
        </main>
      )
    }

    // else successful
    console.log(result)
    return router.push("/write")
  
  }
  return (
    <main className={`md:p-8 p-4 h-screen flex items-center justify-center`}>
      <div className="w-full space-y-4">
        
        <form onSubmit={submitHandler} action="" className="flex flex-col gap-3 bg-gray-800 rounded-md px-12 py-10 max-w-sm mx-auto">
          <h1 className="text-4xl font-bold max-w-max mx-auto">{signInOrUp ? "Log In" : "Sign Up"}</h1>
          <div className="h-1" />
          <div className={`flex flex-col gap-0.5 ${mukta.className}`}>
            <label className="text-base font-medium" htmlFor="email">Email</label>
            <input type="email" className="rounded p-2 w-full" onChange={(e) => setEmail(e.target.value)} required name="email" id="email" placeholder="example@mail.com" />
          </div>
          <div className={`flex flex-col gap-0.5 ${mukta.className}`}>
            <label className="text-base font-medium" htmlFor="password">Password</label>
            <input type="password" className="rounded p-2" onChange={(e) => setPassword(e.target.value)} required name="password" id="password" placeholder="P&S$W0RD!:)" />
          </div>
          <button className="rounded-md bg-emerald-600 p-2 hover:scale-95 hover:opacity-75 transition" type="submit">{signInOrUp ? "Log In" : "Sign Up"}</button>
          <div className="flex items-center gap-2">
            <div className="border-t grow h-0 border-white" />
            <span className={mukta.className}>OR</span>
            <div className="border-t grow h-0 border-white" />
          </div>
          <span>{signInOrUp ? "Don't have an account?" : "Already signed up?"} <Link className="hover:underline font-semibold" href={`/enter?${signInOrUp ? "join=us" : "log=in"}`}> {signInOrUp ? "Sign up" : "Log in"} Here!</Link></span>
        </form>
      </div>
      
    </main>
  )

}