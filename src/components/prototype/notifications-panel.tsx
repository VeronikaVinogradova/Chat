"use client";

import { useEffect, useRef, useState } from "react";
import {
  Star,
  CircleCheck,
  MessageSquareText,
  ChevronRight,
} from "lucide-react";

type Notification = {
  id: number;
  icon: "survey" | "incident" | "reply";
  title: string;
  text: string;
  time: string;
  unread: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    icon: "survey",
    title: "Оцените качество обслуживания",
    text: "Сегодня мы устранили инцидент в вашей АТС. Расскажите, как мы справляемся — это займёт минуту.",
    time: "2 ч назад",
    unread: true,
  },
  {
    id: 2,
    icon: "incident",
    title: "Инцидент устранён",
    text: "Многоканальный номер +7 (968) 181-14-10 снова принимает звонки.",
    time: "Вчера, 18:42",
    unread: true,
  },
  {
    id: 3,
    icon: "reply",
    title: "Ответ по обращению №5712",
    text: "Специалист техподдержки ответил на ваш запрос. Проверьте историю обращений.",
    time: "Вчера, 14:10",
    unread: true,
  },
];

const iconStyles: Record<
  Notification["icon"],
  { bg: string; color: string; Icon: typeof Star }
> = {
  survey: { bg: "bg-[#FFF6D6]", color: "text-[#B8960C]", Icon: Star },
  incident: { bg: "bg-[#E5F5EB]", color: "text-[#2CA853]", Icon: CircleCheck },
  reply: { bg: "bg-[#E9F1FC]", color: "text-[#2E7CE8]", Icon: MessageSquareText },
};

export default function NotificationsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState(initialNotifications);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Уведомления"
      className="absolute right-0 top-[calc(100%+10px)] z-50 w-[400px] rounded-2xl border border-[#ECECEE] bg-white shadow-[0_16px_40px_-8px_rgba(20,22,26,0.18)]"
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold text-[#181A25]">
            Уведомления
          </h2>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FDD835] px-1.5 text-[12px] font-semibold text-[#181A25]">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))}
          className="text-[13px] text-[#868894] hover:text-[#42454C] transition-colors cursor-pointer"
        >
          Прочитать все
        </button>
      </div>

      <div className="max-h-[380px] overflow-y-auto px-2 pb-2">
        {items.map((n) => {
          const { bg, color, Icon } = iconStyles[n.icon];
          return (
            <button
              key={n.id}
              type="button"
              onClick={() =>
                setItems((prev) =>
                  prev.map((it) => (it.id === n.id ? { ...it, unread: false } : it))
                )
              }
              className={`w-full text-left flex gap-3 rounded-xl px-3 py-3 transition-colors cursor-pointer hover:bg-[#F6F6F7] ${
                n.unread ? "bg-[#FFFDF4]" : ""
              }`}
            >
              <span
                className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
              >
                <Icon className="size-[18px]" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[14px] font-semibold leading-5 text-[#181A25]">
                    {n.title}
                  </span>
                  {n.unread && (
                    <span
                      aria-label="Непрочитано"
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-[#FDD835]"
                    />
                  )}
                </span>
                <span className="mt-0.5 block text-[13px] leading-[18px] text-[#6E7178]">
                  {n.text}
                </span>
                <span className="mt-1 block text-[12px] text-[#9A9CA3]">
                  {n.time}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-1 border-t border-[#F1F1F3] py-3 text-[13px] font-medium text-[#42454C] transition-colors hover:bg-[#F6F6F7] rounded-b-2xl cursor-pointer"
      >
        Смотреть все уведомления
        <ChevronRight className="size-4 text-[#868894]" />
      </button>
    </div>
  );
}
