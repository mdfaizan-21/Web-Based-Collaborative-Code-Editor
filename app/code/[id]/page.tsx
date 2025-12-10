"use client";

import Navbar from "@/components/navbar";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const CodeEditor = dynamic(() => import("@/components/editor"), {
    ssr: false,
  });

  const { isLoaded } = useUser();

  return (
    <div className="flex flex-col w-screen h-screen bg-background">
      <Navbar />
      <div className="w-screen flex grow">
        {isLoaded ? <CodeEditor /> : null}
      </div>
    </div>
  );
}

