
"use client";

import { getIconForFile } from "vscode-icons-js";
import { TFile } from "./types";
import Image from "next/image";

export default function SidebarFile({ data }: { data: TFile }) {
  const icon = getIconForFile(data.name);

  return (
    <div className="w-full flex items-center h-6 transition-colors hover:bg-muted-foreground/25 cursor-pointer">
      {icon ? (
        <Image
          src={`/icons/${icon}`}
          alt="File Icon"
          width={16}
          height={16}
          className="mr-2"
        />
      ) : (
        <span className="mr-2">📄</span>
      )}
      {data.name}
    </div>
  );
}
