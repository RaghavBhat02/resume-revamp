'use client'

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation";

import { Mukta } from "next/font/google";
import signIn from "@/firebase/auth/signin";
import Link from "next/link";
const mukta = Mukta({ subsets: [ 'latin'], weight: ['200', '300', '400', '500', '600', '700', '800']})
export default function Page() {
  const [email, setEmail ] = useState<string>("");
  const [password, setPassword ] = useState<string>("");

  const router = useRouter();

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { result, error } = await signIn(email, password);
    if (error) {
      return console.log(error)
    }

    // else successful
    console.log(result)
    return router.push("/admin")
  
  }
  return (
    <main className={`md:p-8 p-4 h-screen flex items-center justify-center`}>
      <div className="w-full space-y-4">
        
        <form onSubmit={submitHandler} action="" className="flex flex-col gap-3 bg-gray-800 rounded-md px-12 py-10 max-w-sm mx-auto">
          <h1 className="text-4xl font-bold max-w-max mx-auto">Sign Up</h1>
          <div className="h-1" />
          <div className={`flex flex-col gap-0.5 ${mukta.className}`}>
            <label className="text-base font-medium" htmlFor="email">Email</label>
            <input type="email" className="rounded p-2 w-full" onChange={(e) => setEmail(e.target.value)} required name="email" id="email" placeholder="example@mail.com" />
          </div>
          <div className={`flex flex-col gap-0.5 ${mukta.className}`}>
            <label className="text-base font-medium" htmlFor="password">Password</label>
            <input type="password" className="rounded p-2" onChange={(e) => setPassword(e.target.value)} required name="password" id="password" placeholder="P&S$W0RD!:)" />
          </div>
          <button className="rounded-md bg-emerald-600 p-2 hover:scale-95 hover:opacity-75 transition" type="submit">Sign Up</button>
          <hr />
          
          <span>Don&apos;t have an account? <Link className="hover:underline font-semibold" href="/signin">Sign in Here!</Link></span>
        </form>
      </div>
      
    </main>
  )

}