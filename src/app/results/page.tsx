'use client'
import { useExperienceContext } from '@/context/expContext'
import { Inter } from 'next/font/google'
import Link from 'next/link'
const inter = Inter({ subsets: ['latin'] })
import { useMemo, useState } from 'react'
const results: {rank: number, company: string, title: string, points: string[], rating: number}[] = [
    {
        rank: 1,
        company: "Google",
        rating: 0.9,
        title: "Programming Language Designer",
        points: [
            "Designed the Pattern Matching Algorithm in Google's new Carbon Language.",
            "Optimized language parsing, increasing compile-time by 35%.",
            "Used cryptography to design and implement an automatic waitlist that moved users through the queue on it's own."
        ]
    },
    {
        rank: 2,
        rating: 0.7,
        company: "Bhakti Origins",
        title: "Full Stack Developer",
        points: [
            "Migrated API from servers to edge functions, increasing up time by 12%.",
            "Created a random profile picture generator using deep learning models such as Stable Diffusion and LLMs like OpenAI's Davinci.",
            "Enhanced type-system usability by simplifying generics and templating- allows 20% more new users to pick up the language."
        ]
    }
]

function Rank({rank, company, title, points, rating, reason}: {rank: number, company: string, title: string, points: string[], rating: number, reason: string}) {
    const [mouseOver, setMouseOver ] = useState(false);
    return (
        <div className="flex flex-row bg-red-400 rounded-lg drop-shadow-lg relative hover:z-10">
            <div className="hover:scale-10 flex flex-row gap-4 p-4">
                <div className="text-6xl min-h-full flex flex-col justify-center font-bold">
                    <span>
                        #{rank}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-semibold list-disc"> <span className="font-bold"> {company} </span> | <em> {title}</em></span>
                    <ul className="ml-4 list-disc">
                    {points.map((point, i) => (
                        <li key={i}>{point}</li>
                    ))}
                    </ul>
                </div>
            </div>
            <div onMouseEnter={() => setMouseOver(true)} onMouseLeave={() => setMouseOver(false)} className={`mr-0 ml-auto rounded-r-lg flex flex-col justify-center hover:cursor-pointer items-center text-5xl font-bold bg-gray-800 w-28 p-4 ${rating > 0.7 ? "text-green-400" : rating > 0.4 ? "text-orange-400": "text-red-400"}`}>
                <span className="text-white text-2xl">Rating</span>
                {rating}
                {mouseOver && (
                  <div className="absolute bg-gray-900 text-base text-white font-normal top-full w-96 right-0 p-2 mt-2 rounded-md z-10">
                    {reason}
                  </div>
                )}
            </div>
            
        </div>
    )
}
export default function Results() {
  const { exp } = useExperienceContext();
  useMemo(() => exp.sort((a, b) => b.rating - a.rating), [exp]);
  return (
    <main className="font-exo p-4">
        <h1 className="font-extrabold text-6xl">Your Experience Ranking!</h1>
        <br />
        <div className="space-y-4">
            {exp.map((res,i) => (
                <Rank  rank={i + 1} title={res.position} company={res.company}  points={res.points} key={i} rating={res.rating} reason={res.reason} />
            ))}
        </div>
        <Link href="/write" className="rounded-md p-2">
            &larr; Back
        </Link>
       
    </main>
  )
}
