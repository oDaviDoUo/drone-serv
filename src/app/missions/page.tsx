"use client";

import dynamic from "next/dynamic";

const MissionEditor = dynamic(() => import("@/components/MissionEditor"), {
  ssr: false,
});

export default function MissionPage() {
  return (
    <div className="h-screen">
      <MissionEditor />
    </div>
  );
}
