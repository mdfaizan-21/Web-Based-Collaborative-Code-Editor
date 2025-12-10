import Navbar from "@/components/navbar";
import { currentUser } from "@clerk/nextjs/server";
import Dashboard from "@/components/dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div>
      <Navbar />
      <Dashboard />
    </div>
  );
}

