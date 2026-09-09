"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, X, ArrowRight } from "lucide-react";

/* Иконка чата: белый заполненный бабл с тремя строками */
function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path
        fill="#fff"
        d="M5.2 3.2h13.6c1.55 0 2.8 1.25 2.8 2.8v8.4c0 1.55-1.25 2.8-2.8 2.8h-8.06l-3.6 3.02c-.86.72-2.18.11-2.18-1.02v-2.1c-1.53-.03-2.76-1.27-2.76-2.8V6c0-1.55 1.25-2.8 2.8-2.8Z"
      />
      <rect x="6.6" y="6.9" width="10.8" height="1.9" rx="0.95" fill="#1F212D" />
      <rect x="6.6" y="10.3" width="10.8" height="1.9" rx="0.95" fill="#1F212D" />
      <rect x="6.6" y="13.7" width="6.8" height="1.9" rx="0.95" fill="#1F212D" />
    </svg>
  );
}

type Agent = {
  id: string;
  name: string;
  caption: string;
  avatar: string;
};

const dialogAgents: Agent[] = [
  {
    id: "consultant",
    name: "Консультант",
    caption: "Помогу подобрать услуги",
    avatar: "/agents/consultant.png",
  },
  {
    id: "setter",
    name: "Настройщик",
    caption: "Помогу настроить услуги",
    avatar: "/agents/setter.png",
  },
  {
    id: "worker",
    name: "Работяга",
    caption: "Помогу с рабочими задачами",
    avatar: "/agents/worker.png",
  },
];

const helpAgents: Agent[] = [
  {
    id: "tg-support",
    name: "Поддержка в тг",
    caption: "Ответы на вопросы",
    avatar: "/agents/tg-support.png",
  },
  {
    id: "lk-support",
    name: "Чат-поддержка в лк",
    caption: "Можно позвать оператора",
    avatar: "/agents/lk-support.png",
  },
];

const suggestions = [
  { label: "Выбрать услуги", accent: false },
  { label: "Загрузить номера", accent: true },
  { label: "Настройка маршрутизации", accent: false },
  { label: "Настройка записи звонков", accent: false },
  { label: "Настройка файлового хранилища", accent: false },
];

function AgentCard({ agent, onPick }: { agent: Agent; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full items-center gap-3 rounded-2xl bg-[#F3F3F5] p-[7px] pr-4 text-left transition-colors hover:bg-[#EBEBED] cursor-pointer"
    >
      <img
        src={agent.avatar}
        alt=""
        aria-hidden
        className="size-10 shrink-0 rounded-[10px] object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium leading-[18px] text-[#181A25]">
          {agent.name}
        </span>
        <span className="mt-0.5 block truncate text-[13px] leading-4 text-[#868894]">
          {agent.caption}
        </span>
      </span>
      <ArrowRight className="size-[18px] shrink-0 text-[#6E7178]" strokeWidth={1.7} />
    </button>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "agents">("chat");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Кнопка чата */}
      <button
        type="button"
        aria-label={open ? "Закрыть чат" : "Открыть чат"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-8 right-8 z-50 flex size-12 items-center justify-center rounded-full bg-[#1F212D] shadow-[0_6px_20px_rgba(31,33,45,0.28)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChatBubbleIcon />
      </button>

      {/* Окно чата */}
      {open && (
        <section
          role="dialog"
          aria-label="Чат с АИ консультантом"
          className="chat-pop fixed bottom-[104px] right-8 top-24 z-50 flex w-[364px] flex-col overflow-hidden rounded-2xl border border-[#ECECEE] bg-white shadow-[0_16px_48px_-8px_rgba(20,22,26,0.18)]"
        >
          {/* Шапка */}
          <div className="flex h-16 shrink-0 items-center justify-between pl-6 pr-4">
            <h2 className="text-[16px] font-semibold text-[#181A25]">
              {view === "chat" ? "АИ консультант" : "Как настроить АТС"}
            </h2>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Возможности чата"
                title="Возможности чата"
                onClick={() => setView((v) => (v === "chat" ? "agents" : "chat"))}
                className={`flex size-11 items-center justify-center rounded-[14px] border transition-colors cursor-pointer ${
                  view === "agents"
                    ? "border-transparent bg-[#F1F1F3] text-[#181A25]"
                    : "border-[#E9E9EB] text-[#42454C] hover:bg-[#F6F6F7]"
                }`}
              >
                <LayoutGrid className="size-5" strokeWidth={1.7} />
              </button>
              <button
                type="button"
                aria-label="Закрыть чат"
                onClick={() => setOpen(false)}
                className="flex size-11 items-center justify-center rounded-[14px] border border-[#E9E9EB] text-[#42454C] transition-colors hover:bg-[#F6F6F7] cursor-pointer"
              >
                <X className="size-5" strokeWidth={1.7} />
              </button>
            </div>
          </div>

          {view === "chat" ? (
            <>
              {/* Диалог */}
              <div className="chat-scroll flex-1 overflow-y-auto px-6 pt-3">
                <p className="max-w-[300px] text-[14px] leading-5 text-[#181A25]">
                  Для загрузки номера могу помочь с перенесением номера,
                  добавлением новых номеров или их покупкой
                </p>
              </div>

              {/* Ввод и подсказки */}
              <div className="shrink-0 px-6 pb-5">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Например, подключить сотрудник"
                  aria-label="Сообщение консультанту"
                  className="h-11 w-full rounded-xl bg-[#EFEFF1] px-4 text-[14px] text-[#181A25] outline-none placeholder:text-[#868894]"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setMessage(s.label)}
                      className={`flex h-11 items-center rounded-xl px-4 text-[14px] transition-colors cursor-pointer ${
                        s.accent
                          ? "bg-[#FDD835] text-[#181A25] hover:bg-[#F5CE0A]"
                          : "bg-[#EFEFF1] text-[#181A25] hover:bg-[#E5E5E8]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Выбор агентов */
            <div className="chat-scroll flex-1 overflow-y-auto px-6 pb-6 pt-1">
              <p className="text-[13px] leading-4 text-[#181A25]">
                Выбери агента для диалога
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {dialogAgents.map((a) => (
                  <AgentCard
                    key={a.id}
                    agent={a}
                    onPick={() => setView("chat")}
                  />
                ))}
              </div>
              <p className="mt-7 text-[13px] leading-4 text-[#181A25]">
                Выбери другой тип помощи
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {helpAgents.map((a) => (
                  <AgentCard
                    key={a.id}
                    agent={a}
                    onPick={() => setView("chat")}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
