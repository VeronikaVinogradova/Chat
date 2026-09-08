"use client";

import {
  Menu,
  Users,
  CalendarDays,
  ShoppingCart,
  Zap,
  ChartColumn,
  Folder,
  Phone,
  Settings,
  Info,
  Mail,
} from "lucide-react";

const items = [
  { icon: Users, label: "Сотрудники", active: true },
  { icon: CalendarDays, label: "Календарь" },
  { icon: ShoppingCart, label: "Магазин" },
  { icon: Zap, label: "Быстрые действия" },
  { icon: ChartColumn, label: "Статистика" },
  { icon: Folder, label: "Файлы" },
  { icon: Phone, label: "Телефония" },
  { icon: Settings, label: "Настройки" },
  { icon: Info, label: "Справка" },
  { icon: Mail, label: "Сообщения" },
];

export default function Sidebar() {
  return (
    <nav
      aria-label="Основное меню"
      className="w-14 shrink-0 border-r border-[#ECECEE] bg-white flex flex-col items-center"
    >
      <button
        type="button"
        aria-label="Меню"
        className="h-14 w-full flex items-center justify-center border-b border-[#F1F1F3] text-[#42454C] hover:bg-[#F6F6F7] transition-colors cursor-pointer"
      >
        <Menu className="size-5" strokeWidth={1.8} />
      </button>

      <ul className="flex flex-col items-center pt-3 gap-1.5">
        {items.map(({ icon: Icon, label, active }) => (
          <li key={label} className="relative w-full">
            {active && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-full bg-[#FDD835]"
              />
            )}
            <button
              type="button"
              aria-label={label}
              title={label}
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer hover:bg-[#F6F6F7] ${
                active ? "text-[#181A25]" : "text-[#868894] hover:text-[#42454C]"
              }`}
            >
              <Icon className="size-5" strokeWidth={1.7} />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
