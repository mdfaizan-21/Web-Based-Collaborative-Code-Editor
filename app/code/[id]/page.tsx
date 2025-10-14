import Navbar from "@/components/navbar";
import dynamic from "next/dynamic";

export default function Home() {
  const CodeEditor = dynamic(() => import("@/components/editor"), {
    ssr: false,
  });
  return (
    <div className="flex flex-col w-screen h-screen bg-background">
      <Navbar />
      <div className="w-screen flex grow">
        <CodeEditor />
      </div>
    </div>
  );
}
