"use client";

import { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import MainContent from "./main-content";

export default function PrototypeHome() {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#181A25]">
      <Header
        notifOpen={notifOpen}
        onToggleNotif={() => setNotifOpen((v) => !v)}
        onCloseNotif={() => setNotifOpen(false)}
      />
      <div className="flex flex-1">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}
