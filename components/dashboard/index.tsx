"use client";

import CustomButton from "../ui/customButton";
import { Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div>
      <div>
        <div>
          <CustomButton className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
