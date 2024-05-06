"use client";
import { Inter, Mukta } from "next/font/google";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import useDebounce from "@/hooks/debounce";
import type { Experience } from "@/types/experience";
import Link from "next/link";
import ClientProtectedRoute from "@/components/client-protected";
import { useExperienceContext } from "@/context/expContext";

const inter = Inter({ subsets: ["latin"] });
const mukta = Mukta({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

function Loading() {
  return (
    <div className="rounded-full h-6 w-6 border-l-1 border-t-2 border-r-2 border-white animate-spin"></div>
  );
}
function Exp({
  index,
  arr,
  changeFunction,
}: {
  index: number;
  arr: Experience[];
  changeFunction: (exp: Experience) => void;
}) {
  function handlerBase(
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) {
    switch (e.target.name) {
      case "company-name":
        changeFunction({
          company: e.target.value,
          position: arr[index].position,
          description: arr[index].description,
        });
        break;
      case "position":
        changeFunction({
          company: arr[index].company,
          position: e.target.value,
          description: arr[index].description,
        });
        break;
      case "description":
        changeFunction({
          company: arr[index].company,
          position: arr[index].position,
          description: e.target.value,
        });
        break;
      default:
        throw Error("impossible experience state.");
    }
  }
  return (
    <div className="bg-gray-900 rounded-md py-4 space-y-2 md:space-y-4 px-4">
      <h3 className="text-3xl font-semibold">Experience #{index + 1}</h3>
      <div className="flex flex-wrap md:flex-row justify-evenly gap-2">
        <div className="bg-gray-800 rounded-lg w-96 p-2 space-y-0.5">
          <label className="text-base " htmlFor="application-link">
            Company Name
          </label>
          <input
            onChange={handlerBase}
            name="company-name"
            className="rounded-md block w-72 p-1 bg-gray-950 outline-red-400 -outline-offset-2"
            placeholder="Amazon"
            type="text"
            value={arr[index].company}
          />
        </div>
        <div className="bg-gray-800 rounded-lg w-96 p-2 space-y-0.5">
          <label className="text-base font-mukta" htmlFor="application-link">
            Position
          </label>
          <input
            onChange={handlerBase}
            name="position"
            className="rounded-md block w-72 p-1 bg-gray-950 outline-red-400 -outline-offset-2"
            placeholder="Software Engineering Intern"
            type="text"
            value={arr[index].position}
          />
        </div>
      </div>
      <div className="flex flex-row justify-center">
        <div className="flex flex-col w-96 p-2 bg-gray-800 rounded-lg gap-0.5">
          <label className="text-base font-mukta" htmlFor="application-link">
            Description
          </label>
          <textarea
            onChange={handlerBase}
            className="rounded-md p-1 bg-gray-950 outline-red-400 -outline-offset-2"
            name="description"
            id="desc"
            cols={30}
            rows={10}
            placeholder="The more detail the better. Numbers are a big plus."
            value={arr[index].description}
          ></textarea>
        </div>
      </div>
    </div>
  );
}

function Write() {
  const [error, setError] = useState<string | null>(null);
  const [arr, setArr] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setExp } = useExperienceContext();

  const [posting, setPosting] = useState<string>("");
  useEffect(() => {
    const expArr = localStorage.getItem("expArr");
    const post = localStorage.getItem("posting");
    if (post) {
      setPosting(JSON.parse(post));
    }
    if (expArr) {
      setArr(JSON.parse(expArr));
    }
  }, []);

  const debouncedArr = useDebounce<Experience[]>(arr, 300);
  const debouncedPosting = useDebounce<string>(posting, 300);
  useEffect(() => {
    localStorage.setItem("expArr", JSON.stringify(debouncedArr));
    localStorage.setItem("posting", JSON.stringify(debouncedPosting));
  }, [debouncedArr, debouncedPosting]);

  async function handleFetch() {
    setLoading(true);
    const res = [
      fetch(`/api/ranks/`, {
        method: "POST",
        body: JSON.stringify({ experiences: arr, job: posting }),
      }),
      fetch(`/api/bullets/`, {
        method: "POST",
        body: JSON.stringify(arr),
      }),
    ];
    const settled = await Promise.allSettled(res);
    if (settled[0].status === "rejected") {
      setLoading(false);
      throw Error("Failed to rank experiences.");
    }
    const ranks = await settled[0].value.json();

    if (settled[1].status === "rejected") {
      setLoading(false);
      throw Error("Failed to summarize experiences as bullet points.");
    }
    const bullets = await settled[1].value.json();
    const finExperiences = ranks.map(
      (
        item: {
          companyName: { index: number; content: string };
          role: { index: number; content: string };
          rating: { index: number; content: string; numerator: number };
          reason: { index: number; content: string };
        },
        i: number
      ) => ({
        company: item.companyName.content,
        position: item.role.content,
        rating: item.rating.numerator / 10,
        reason: item.reason.content,
        points: bullets[i].points.bullets.map(
          (pt: { index: number; content: string }) => pt.content
        ),
      })
    );
    setExp(finExperiences);
    setLoading(false);
    router.push("/results");
  }

  return (
    <main className="font-exo p-4 space-y-4">
      <h1 className="font-extrabold text-6xl">Craft your Resume!</h1>
      <div className="flex flex-col bg-gray-800 w-full md:w-auto md:max-w-max p-2 rounded-lg gap-0.5">
        <label className="text-base" htmlFor="application">
          Paste the job posting here:
        </label>
        <textarea
          name="application"
          className="rounded-md block bg-gray-950 w-full md:w-96 outline-red-400 -outline-offset-2 p-1"
          onChange={(e) => {
            setPosting(e.target.value);
            console.log(posting);
          }}
          placeholder="Job Posting goes here"
          value={posting}
        ></textarea>
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-bold">Your Experiences</h2>
        <div className="space-y-2">
          {arr.map((_, i) => (
            <Exp
              key={i}
              index={i}
              arr={arr}
              changeFunction={(exp: Experience) =>
                setArr((prev) => {
                  const newArr = [...prev];
                  newArr[i] = exp;
                  console.log(newArr);
                  return newArr;
                })
              }
            />
          ))}
        </div>

        <button
          role="button"
          onClick={() =>
            setArr((prev) => [
              ...prev,
              { company: "", position: "", description: "" },
            ])
          }
          className="bg-blue-500 text-2xl font-semibold px-3 rounded-md py-1 mt-10"
        >
          Add Experience +{" "}
        </button>
      </div>

      <button
        onClick={handleFetch}
        className={`${
          loading
            ? "opacity-75 hover:cursor-wait pointer-events-none hover:scale-100"
            : "hover:scale-105"
        } bg-red-300 transition-all flex gap-2 hover:opacity-75 text-xl font-semibold px-3 rounded-md py-1 mt-10`}
      >
        {loading ? <Loading /> : ""}Rank your Results{" "}
      </button>
    </main>
  );
}

export default function Page() {
  return (
    <ClientProtectedRoute>
      <Write />
    </ClientProtectedRoute>
  );
}
