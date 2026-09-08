"use client";

import { Moon, Bell, Settings, User } from "lucide-react";
import NotificationsPanel from "./notifications-panel";

export default function Header({
  notifOpen,
  onToggleNotif,
  onCloseNotif,
}: {
  notifOpen: boolean;
  onToggleNotif: () => void;
  onCloseNotif: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-[#ECECEE] bg-white">
      <div className="flex h-full items-center justify-between pl-5 pr-4">
        {/* Логотип */}
        <a href="/" className="flex items-center gap-2.5" aria-label="На главную">
          <span className="size-3.5 rounded-full bg-[#14161A]" aria-hidden />
          <span className="text-[16px] font-bold tracking-tight text-[#14161A]">
            логотип
          </span>
        </a>

        {/* Правые иконки */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Тёмная тема"
            title="Тёмная тема"
            className="flex size-9 items-center justify-center rounded-lg text-[#42454C] transition-colors hover:bg-[#F6F6F7] cursor-pointer"
          >
            <Moon className="size-5" strokeWidth={1.7} />
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="Уведомления"
              aria-expanded={notifOpen}
              onClick={onToggleNotif}
              className={`flex size-9 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                notifOpen
                  ? "bg-[#F6F6F7] text-[#181A25]"
                  : "text-[#42454C] hover:bg-[#F6F6F7]"
              }`}
            >
              <Bell className="size-5" strokeWidth={1.7} />
            </button>
            <NotificationsPanel open={notifOpen} onClose={onCloseNotif} />
          </div>

          <button
            type="button"
            aria-label="Настройки"
            title="Настройки"
            className="flex size-9 items-center justify-center rounded-lg text-[#42454C] transition-colors hover:bg-[#F6F6F7] cursor-pointer"
          >
            <Settings className="size-5" strokeWidth={1.7} />
          </button>

          <button
            type="button"
            aria-label="Профиль"
            title="Профиль"
            className="ml-2 flex size-9 items-center justify-center rounded-[10px] bg-[#F1F1F3] text-[#42454C] transition-colors hover:bg-[#E8E8EA] cursor-pointer"
          >
            <User className="size-[18px]" strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </header>
  );
}
