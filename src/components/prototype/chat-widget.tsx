"use client";

import { useEffect, useRef, useState } from "react";
import {
  LayoutGrid,
  X,
  ArrowRight,
  Check,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  agentReply,
  classify,
  routingAction,
  DIRECTION_META,
  INTENT_META,
  type ChipMeta,
  type Direction,
  type Intent,
} from "./chat-routing";

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

function Chip({ meta }: { meta: ChipMeta }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[12px] font-medium leading-none"
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      {meta.label}
    </span>
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

/* Подсказки покрывают все ветки маршрутизации для юзабилити-теста */
const suggestions = [
  { label: "Выбрать услуги", accent: false, text: "Хочу выбрать услуги для АТС" },
  { label: "Загрузить номера", accent: true, text: "Загрузить номера" },
  { label: "Не работает запись звонков", accent: false, text: "Не работает запись звонков" },
  { label: "Спасибо менеджеру!", accent: false, text: "Спасибо менеджеру, всё решили быстро!" },
  { label: "Добавьте тёмную тему", accent: false, text: "Добавьте тёмную тему в кабинет" },
];

type TicketStatus = "inwork" | "done";

type Msg =
  | { id: number; kind: "greeting" }
  | { id: number; kind: "user"; text: string }
  | { id: number; kind: "bot"; text: string }
  | { id: number; kind: "route"; direction: Direction; intent: Intent; text: string }
  | { id: number; kind: "ticket"; direction: Direction; ticket: { no: number; status: TicketStatus } }
  | { id: number; kind: "manager"; name: string };

function StatusBadge({ status }: { status: TicketStatus }) {
  if (status === "done") {
    return (
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#E5F5EB] px-2.5 py-1 text-[12px] font-medium leading-none text-[#2CA853]">
        <Check className="size-3.5" strokeWidth={2.2} />
        Отработан
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#FFF6D6] px-2.5 py-1 text-[12px] font-medium leading-none text-[#9A7B0A]">
      <span className="size-1.5 animate-pulse rounded-full bg-current" />
      В работе
    </span>
  );
}

function MessageRow({ m }: { m: Msg }) {
  switch (m.kind) {
    case "greeting":
      return (
        <p className="max-w-[300px] text-[14px] leading-5 text-[#181A25]">
          Для загрузки номера могу помочь с перенесением номера, добавлением новых
          номеров или их покупкой
        </p>
      );
    case "user":
      return (
        <div className="ml-auto w-fit max-w-[280px] rounded-2xl rounded-br-md bg-[#1F212D] px-4 py-2.5 text-[14px] leading-5 text-white">
          {m.text}
        </div>
      );
    case "bot":
      return (
        <div className="w-fit max-w-[290px] rounded-2xl rounded-bl-md bg-[#F3F3F5] px-4 py-2.5 text-[14px] leading-5 text-[#181A25]">
          {m.text}
        </div>
      );
    case "route":
      return (
        <div className="max-w-[300px] rounded-2xl border border-[#ECECEE] bg-white p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9A9CA3]">
            Запрос распознан
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip meta={DIRECTION_META[m.direction]} />
            <Chip meta={INTENT_META[m.intent]} />
          </div>
          <p className="mt-2 text-[13.5px] leading-[18px] text-[#181A25]">{m.text}</p>
        </div>
      );
    case "ticket":
      return (
        <div className="max-w-[300px] rounded-2xl border border-[#ECECEE] bg-white p-3.5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FDECEC]">
              <TriangleAlert className="size-[18px] text-[#D64545]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium leading-[18px] text-[#181A25]">
                Инцидент №{m.ticket.no}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-4 text-[#868894]">
                Команда эксплуатации приступила
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={m.ticket.status} />
            <Chip meta={DIRECTION_META[m.direction]} />
            {m.ticket.status === "inwork" && (
              <span className="text-[12px] leading-none text-[#9A9CA3]">статус обновится здесь</span>
            )}
          </div>
        </div>
      );
    case "manager":
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFF6D6] text-[13px] font-semibold text-[#181A25]">
            {m.name[0]}
          </span>
          <p className="max-w-[250px] text-[13.5px] leading-[18px] text-[#181A25]">
            <span className="font-medium">{m.name}</span>, менеджер поддержки,
            подключилась к диалогу. Чем займёмся?
          </p>
        </div>
      );
  }
}

function TypingBubble() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-[#F3F3F5] px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-[#9A9CA3]"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "agents">("chat");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, kind: "greeting" }]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [typing, setTyping] = useState(false);

  const nextId = useRef(1);
  const ticketNo = useRef(5721);
  const scrollRef = useRef<HTMLDivElement>(null);
  const newId = () => nextId.current++;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* Автоскролл к последнему сообщению */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing, view]);

  function send(raw: string) {
    const text = raw.trim();
    if (!text) return;
    setMessages((p) => [...p, { id: newId(), kind: "user", text }]);
    setMessage("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      if (activeAgent) {
        /* Режим ИИ-агента: помощь по настройке АТС */
        setMessages((p) => [...p, { id: newId(), kind: "bot", text: agentReply(text) }]);
        return;
      }
      /* Умная маршрутизация по семантическим ядрам */
      const { direction, intent } = classify(text);
      setMessages((p) => [
        ...p,
        { id: newId(), kind: "route", direction, intent, text: routingAction(intent, direction) },
      ]);
      if (intent === "support") {
        window.setTimeout(() => {
          setMessages((p) => [...p, { id: newId(), kind: "manager", name: "Александра" }]);
        }, 2500);
      }
      if (intent === "incident") {
        const no = ticketNo.current++;
        setMessages((p) => [
          ...p,
          { id: newId(), kind: "ticket", direction, ticket: { no, status: "inwork" } },
        ]);
        /* Демо жизненного цикла: через 8 секунд инцидент отработан */
        window.setTimeout(() => {
          setMessages((p) =>
            p.map((m) =>
              m.kind === "ticket" && m.ticket.no === no
                ? { ...m, ticket: { no, status: "done" as TicketStatus } }
                : m,
            ),
          );
        }, 8000);
      }
    }, 1100);
  }

  function pickDialogAgent(a: Agent) {
    setView("chat");
    setActiveAgent(a);
    setMessages((p) => [
      ...p,
      {
        id: newId(),
        kind: "bot",
        text: `${a.name} на связи. ${a.caption} — опишите задачу, подскажу по шагам.`,
      },
    ]);
  }

  function pickHelpAgent(a: Agent) {
    setView("chat");
    setMessages((p) => [
      ...p,
      { id: newId(), kind: "bot", text: `Подключила «${a.name}»: ${a.caption}.` },
    ]);
  }

  function exitAgent() {
    setActiveAgent(null);
    setMessages((p) => [
      ...p,
      { id: newId(), kind: "bot", text: "Вернул вас в общий чат — снова включаю умную маршрутизацию обращений." },
    ]);
  }

  const headerTitle =
    view === "agents" ? "Как настроить АТС" : activeAgent ? activeAgent.name : "АИ консультант";

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
          aria-label="Чат с поддержкой"
          className="chat-pop fixed bottom-[104px] right-8 top-24 z-50 flex w-[364px] flex-col overflow-hidden rounded-2xl border border-[#ECECEE] bg-white shadow-[0_16px_48px_-8px_rgba(20,22,26,0.18)]"
        >
          {/* Шапка */}
          <div className="flex h-16 shrink-0 items-center justify-between pl-6 pr-4">
            <h2 className="text-[16px] font-semibold text-[#181A25]">{headerTitle}</h2>
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
              <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto px-6 pt-3">
                {messages.map((m) => (
                  <MessageRow key={m.id} m={m} />
                ))}
                {typing && <TypingBubble />}
              </div>

              {/* Ввод и подсказки */}
              <div className="shrink-0 px-6 pb-5">
                {activeAgent && (
                  <div className="mb-3 flex items-center justify-between rounded-xl bg-[#F3EBFF] px-3 py-2">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-[#7C3AED]">
                      <Sparkles className="size-4" strokeWidth={1.8} />
                      ИИ-агент: {activeAgent.name}
                    </span>
                    <button
                      type="button"
                      aria-label="Вернуться к поддержке"
                      title="Вернуться к поддержке"
                      onClick={exitAgent}
                      className="flex size-6 items-center justify-center rounded-lg transition-colors hover:bg-[#E9DDFC] cursor-pointer"
                    >
                      <X className="size-4 text-[#7C3AED]" strokeWidth={2} />
                    </button>
                  </div>
                )}
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send(message);
                  }}
                  placeholder="Например, подключить сотрудник"
                  aria-label="Сообщение в чат"
                  className="h-11 w-full rounded-xl bg-[#EFEFF1] px-4 text-[14px] text-[#181A25] outline-none placeholder:text-[#868894]"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => send(s.text)}
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
                  <AgentCard key={a.id} agent={a} onPick={() => pickDialogAgent(a)} />
                ))}
              </div>
              <p className="mt-7 text-[13px] leading-4 text-[#181A25]">
                Выбери другой тип помощи
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {helpAgents.map((a) => (
                  <AgentCard key={a.id} agent={a} onPick={() => pickHelpAgent(a)} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}

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
