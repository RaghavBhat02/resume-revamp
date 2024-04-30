import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from './page.module.css'
import Link from 'next/link'
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className="font-exo flex flex-col items-center justify-center max-h-screen h-screen bg-gradient-to-b from-black to-purple-900 gap-y-2 p-4 md:p-0">
        <h1 className="w-full text-center text-7xl md:text-8xl font-exo font-extrabold bg-clip-text bg-gradient-to-r from-blue-600 to-red-600 text-transparent">Resume Revamp</h1>
    
        <div className="text-xl md:text-2xl text-center">The Resume Writer made by students for students</div>
        <br />
        <Link href="/enter?join=us">
          <button className="block bg-blue-700 py-1.5 px-4 md:py-3 md:px-8 rounded-lg hover:scale-105 hover:drop-shadow-md transition-all hover:bg-red-400 font-bold text-xl md:text-2xl">Try it Now! &#8594;</button>
        </Link>
       
    </main>
  )
}
