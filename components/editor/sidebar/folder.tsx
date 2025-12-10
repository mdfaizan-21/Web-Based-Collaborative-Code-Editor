"use client";
import {TFolder } from "./types";

import { useState } from "react";
import Image from "next/image";
import SidebarFile from "./file";
import { getIconForOpenFolder, getIconForFolder } from "vscode-icons-js";

export default function SidebarFolder({ data }: { data: TFolder }) {
  const [isOpen, setIsOpen] = useState(false);

  const folderIcon = isOpen
    ? getIconForOpenFolder(data.name)
    : getIconForFolder(data.name);

  return (
    <>
      {/* Folder Row */}
      <div onClick={()=> setIsOpen((prev) => !prev)}
        className="w-full flex items-center h-7 px-1 transition-colors hover:bg-secondary cursor-pointer rounded-sm"
        
      >
        <Image
          src={`/icons/${folderIcon}`}
          alt="Folder Icon"
          width={18}
          height={18}
          className="mr-2"
        />
        {data.name}
      </div>

      {/* Children */}
      {isOpen ? (
        <div className="flex w-full items-stretch ml-4">
          <div className="w-[1px] bg-border mx-2" />

          <div className="flex flex-col grow">
            {data.children.map((child) =>
              child.type === "file" ? (
                <SidebarFile key={child.id} data={child} />
              ) : (
                <SidebarFolder key={child.id} data={child} />
              )
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}


