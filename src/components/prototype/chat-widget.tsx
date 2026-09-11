"use client";

import { useEffect, useRef, useState } from "react";
import {
  LayoutGrid,
  X,
  ArrowRight,
  Check,
  Sparkles,
  TriangleAlert,
  ChevronDown,
  Phone,
  Mail,
  Inbox,
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

/* Прямые каналы связи — блок «Или свяжитесь напрямую» в панели агентов */
const contacts: {
  id: string;
  icon: typeof Phone;
  title: string;
  caption: string;
}[] = [
  {
    id: "phone",
    icon: Phone,
    title: "8 800 700 06 28",
    caption: "Среднее время ответа — до 15 минут",
  },
  {
    id: "email",
    icon: Mail,
    title: "vassupport@beeline.ru",
    caption: "Среднее время ответа — до 8 часов",
  },
];

/* Подсказки покрывают 4 ключевых сценария юзабилити-теста;
   special включает особый флоу вместо маршрутизации:
   setup/tariff — подключение ИИ-агента, incident — выбор действия перед заведением */
const suggestions: { label: string; text: string; special?: "setup" | "tariff" | "incident" }[] = [
  {
    label: "Помочь настроить",
    text: "Помогите настроить переадресацию звонков",
    special: "setup",
  },
  { label: "Что-то не работает", text: "Что-то не работает: не сохраняется схема вызова", special: "incident" },
  {
    label: "Не хватает нового функционала",
    text: "Не хватает функционала — добавьте тёмную тему",
  },
  { label: "Вопросы про тариф", text: "Вопрос про тариф", special: "tariff" },
];

/* Первое сообщение бота при открытии чата */
const GREETING =
  "Напишите любой вопрос одним сообщением — зарегистрирую инцидент, подключу менеджера или передам отзыв. А ещё помогу настроить АТС по шагам.";

/* Сообщения флоу инцидента: пользователь описал проблему — сразу заводим */
const DIRECT_INCIDENT_TEXT =
  "Распознал инцидент. Завожу обращение — статус покажу в этом чате.";

const DETAILS_ASK =
  "Расскажите подробнее, что именно не работает и когда это началось — так команде будет проще разобраться.";

const DETAILS_OK = "Принял, спасибо за подробности! Регистрирую инцидент.";

/* Сообщения флоу продуктового предложения */
const SUGGESTION_ASK =
  "Опишите, какого функционала вам не хватает. И какую задачу вы хотите решить.";

const SUGGESTION_SENT =
  "Ваше сообщение отправлено в команду разработки Облачной АТС. Спасибо, что написали! Оставьте номер телефона и имя, если хотите, чтобы мы связались с вами.";

const SUGGESTION_CONTACTS_OK =
  "Спасибо! Сохранил контакты — команда разработки Облачной АТС сможет связаться с вами.";

type TicketStatus = "inwork" | "done";

type TicketRec = {
  no: number;
  direction: Direction;
  subject: string;
  status: TicketStatus;
  date: string;
};

function nowTime(): string {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/* Тема тикета: длинный текст обрезаем */
function truncSubject(text: string): string {
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

/* Есть ли в сообщении телефон (для необязательных контактов в флоу предложения) */
function hasPhone(text: string): boolean {
  return text.replace(/\D/g, "").length >= 10;
}

/* Флоу инцидента (чип «Что-то не работает»): выбор действия → (опционально) детали → регистрация */
type IncidentFlow = {
  stage: "choice" | "details";
  direction: Direction;
  subject: string;
};

/* Флоу продуктового предложения: описание → (необязательно) контакты */
type SuggestionFlow = { stage: "description" | "contacts" };

type Msg =
  | { id: number; kind: "user"; text: string }
  | { id: number; kind: "bot"; text: string }
  | { id: number; kind: "route"; direction: Direction; intent: Intent; text: string }
  | { id: number; kind: "choice"; chosen: "create" | "details" | null }
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

function MessageRow({
  m,
  onChoose,
}: {
  m: Msg;
  onChoose: (id: number, choice: "create" | "details") => void;
}) {
  switch (m.kind) {
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
    case "choice":
      return (
        <div className="flex max-w-[310px] flex-wrap gap-2">
          {m.chosen === null ? (
            <>
              <button
                type="button"
                onClick={() => onChoose(m.id, "create")}
                className="flex h-10 items-center rounded-xl bg-[#1F212D] px-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
              >
                Завести инцидент
              </button>
              <button
                type="button"
                onClick={() => onChoose(m.id, "details")}
                className="flex h-10 items-center rounded-xl bg-[#EFEFF1] px-4 text-[14px] text-[#181A25] transition-colors hover:bg-[#E5E5E8] cursor-pointer"
              >
                Описать подробнее проблему
              </button>
            </>
          ) : (
            <span className="flex h-10 items-center gap-1.5 rounded-xl bg-[#EFEFF1] px-4 text-[14px] text-[#868894]">
              <Check className="size-4" strokeWidth={2} />
              {m.chosen === "create" ? "Завести инцидент" : "Описать подробнее проблему"}
            </span>
          )}
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

function HistoryCard({ t }: { t: TicketRec }) {
  return (
    <div className="rounded-2xl border border-[#ECECEE] bg-white p-3.5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FDECEC]">
          <TriangleAlert className="size-[18px] text-[#D64545]" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-medium leading-[18px] text-[#181A25]">
              Инцидент №{t.no}
            </p>
            <StatusBadge status={t.status} />
          </div>
          <p className="mt-0.5 truncate text-[12.5px] leading-4 text-[#868894]">{t.subject}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <Chip meta={DIRECTION_META[t.direction]} />
        <span className="text-[12px] leading-none text-[#9A9CA3]">{t.date}</span>
      </div>
    </div>
  );
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
  const [tab, setTab] = useState<"dialog" | "history">("dialog");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, kind: "bot", text: GREETING },
  ]);
  const [tickets, setTickets] = useState<TicketRec[]>([]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [typing, setTyping] = useState(false);
  const [chipsOpen, setChipsOpen] = useState(true);
  /* Флоу инцидента: выбор действия → детали → регистрация */
  const [incidentFlow, setIncidentFlow] = useState<IncidentFlow | null>(null);
  /* Флоу продуктового предложения */
  const [suggestionFlow, setSuggestionFlow] = useState<SuggestionFlow | null>(null);

  const nextId = useRef(1);
  const ticketNo = useRef(5721);
  const scrollRef = useRef<HTMLDivElement>(null);
  const newId = () => nextId.current++;

  /* Регистрация инцидента: карточка в диалоге + запись в истории, через 8 с — «Отработан» */
  function registerIncident(direction: Direction, subject: string) {
    const no = ticketNo.current++;
    setMessages((p) => [
      ...p,
      {
        id: newId(),
        kind: "ticket",
        direction,
        ticket: { no, status: "inwork" as TicketStatus },
      },
    ]);
    setTickets((p) => [
      { no, direction, subject, status: "inwork", date: `сегодня, ${nowTime()}` },
      ...p,
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
      setTickets((p) =>
        p.map((t) => (t.no === no ? { ...t, status: "done" as TicketStatus } : t)),
      );
    }, 8000);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* Автоскролл к последнему сообщению (в т.ч. при возврате на таб диалога) */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing, view, tab]);

  /* Клик по кнопке выбора в сценарии инцидента */
  function chooseIncident(id: number, choice: "create" | "details") {
    setMessages((p) =>
      p.map((m) => (m.id === id && m.kind === "choice" ? { ...m, chosen: choice } : m)),
    );
    if (!incidentFlow) return;
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      if (choice === "create") {
        /* «Завести инцидент» — создаём обращение сразу */
        registerIncident(incidentFlow.direction, incidentFlow.subject);
      } else {
        setMessages((p) => [...p, { id: newId(), kind: "bot", text: DETAILS_ASK }]);
        setIncidentFlow({ ...incidentFlow, stage: "details" });
      }
    }, 900);
  }

  function send(raw: string, special?: "setup" | "tariff" | "incident") {
    const text = raw.trim();
    if (!text) return;
    setMessages((p) => [...p, { id: newId(), kind: "user", text }]);
    setMessage("");
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      /* Чипсы «Помочь настроить» и «Вопросы про тариф»: подключаем ИИ-агента */
      if (special === "setup" || special === "tariff") {
        const agent = special === "setup" ? dialogAgents[1] : dialogAgents[0];
        setIncidentFlow(null);
        setSuggestionFlow(null);
        setActiveAgent(agent);
        setMessages((p) => [
          ...p,
          {
            id: newId(),
            kind: "bot",
            text:
              special === "setup"
                ? `Подключаю агента: ${agent.name} — поможет настроить услуги АТС по шагам. Опишите задачу.`
                : `Подключаю агента: ${agent.name} — проконсультирует по тарифам и пакетам. Задайте вопрос.`,
          },
        ]);
        return;
      }
      /* Чип «Что-то не работает»: перед заведением инцидента — выбор действия */
      if (special === "incident") {
        const { direction, intent } = classify(text);
        setActiveAgent(null);
        setSuggestionFlow(null);
        setIncidentFlow({ stage: "choice", direction, subject: truncSubject(text) });
        setMessages((p) => [
          ...p,
          {
            id: newId(),
            kind: "route",
            direction,
            intent,
            text: routingAction(intent, direction),
          },
        ]);
        setMessages((p) => [...p, { id: newId(), kind: "choice", chosen: null }]);
        return;
      }
      if (activeAgent) {
        /* Режим ИИ-агента: помощь по настройке АТС */
        setMessages((p) => [...p, { id: newId(), kind: "bot", text: agentReply(text) }]);
        return;
      }
      /* Флоу инцидента: текст вместо кнопок = описание проблемы → сразу заводим */
      if (incidentFlow) {
        if (incidentFlow.stage === "choice") {
          /* Отмечаем ожидающие кнопки как выбранный путь «Описать подробнее» */
          setMessages((p) =>
            p.map((m) =>
              m.kind === "choice" && m.chosen === null ? { ...m, chosen: "details" as const } : m,
            ),
          );
        }
        setIncidentFlow(null);
        setMessages((p) => [...p, { id: newId(), kind: "bot", text: DETAILS_OK }]);
        registerIncident(incidentFlow.direction, truncSubject(text));
        return;
      }
      /* Флоу предложения: описание → отправка команде → контакты по желанию */
      if (suggestionFlow) {
        if (suggestionFlow.stage === "description") {
          setSuggestionFlow({ stage: "contacts" });
          setMessages((p) => [...p, { id: newId(), kind: "bot", text: SUGGESTION_SENT }]);
          return;
        }
        if (hasPhone(text)) {
          setSuggestionFlow(null);
          setMessages((p) => [...p, { id: newId(), kind: "bot", text: SUGGESTION_CONTACTS_OK }]);
          return;
        }
        setSuggestionFlow(null); /* без контактов — обычная маршрутизация */
      }
      /* Умная маршрутизация по семантическим ядрам */
      const { direction, intent } = classify(text);
      setMessages((p) => [
        ...p,
        {
          id: newId(),
          kind: "route",
          direction,
          intent,
          text:
            intent === "incident" ? DIRECT_INCIDENT_TEXT : routingAction(intent, direction),
        },
      ]);
      if (intent === "support") {
        window.setTimeout(() => {
          setMessages((p) => [...p, { id: newId(), kind: "manager", name: "Александра" }]);
        }, 2500);
      }
      if (intent === "incident") {
        /* Пользователь сам описал проблему — сразу заводим инцидент */
        setTyping(true);
        window.setTimeout(() => {
          setTyping(false);
          registerIncident(direction, truncSubject(text));
        }, 900);
      }
      if (intent === "suggestion") {
        setSuggestionFlow({ stage: "description" });
        setMessages((p) => [...p, { id: newId(), kind: "bot", text: SUGGESTION_ASK }]);
      }
    }, 1100);
  }

  function pickDialogAgent(a: Agent) {
    setView("chat");
    setActiveAgent(a);
    setIncidentFlow(null);
    setSuggestionFlow(null);
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
    setIncidentFlow(null);
    setSuggestionFlow(null);
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

          {/* Табы: текущий диалог / история */}
          {view === "chat" && (
            <div className="flex shrink-0 gap-6 border-b border-[#F1F1F3] px-6">
              <button
                type="button"
                onClick={() => setTab("dialog")}
                className={`relative pb-3 text-[14px] transition-colors cursor-pointer ${
                  tab === "dialog"
                    ? "font-medium text-[#181A25]"
                    : "text-[#868894] hover:text-[#42454C]"
                }`}
              >
                Текущий диалог
                {tab === "dialog" && (
                  <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[#FDD835]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setTab("history")}
                className={`relative pb-3 text-[14px] transition-colors cursor-pointer ${
                  tab === "history"
                    ? "font-medium text-[#181A25]"
                    : "text-[#868894] hover:text-[#42454C]"
                }`}
              >
                История
                {tickets.length > 0 && (
                  <span className="ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#F1F1F3] px-1 text-[11px] font-medium text-[#868894]">
                    {tickets.length}
                  </span>
                )}
                {tab === "history" && (
                  <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[#FDD835]" />
                )}
              </button>
            </div>
          )}

          {view === "agents" ? (
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
              <p className="mt-7 text-[13px] leading-4 text-[#181A25]">
                Или свяжитесь напрямую
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {contacts.map((c) => (
                  <ContactRow key={c.id} icon={c.icon} title={c.title} caption={c.caption} />
                ))}
              </div>
            </div>
          ) : tab === "history" ? (
            tickets.length === 0 ? (
              /* Пустая история: как при первом входе */
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-[#F3F3F5]">
                  <Inbox className="size-6 text-[#868894]" strokeWidth={1.7} />
                </span>
                <p className="max-w-[240px] text-[13.5px] leading-[18px] text-[#868894]">
                  Здесь пока пусто. Обращения и их статусы появятся после вашего первого вопроса.
                </p>
              </div>
            ) : (
              /* История обращений */
              <div className="chat-scroll flex-1 space-y-3 overflow-y-auto px-6 pb-6 pt-4">
                {tickets.map((t) => (
                  <HistoryCard key={t.no} t={t} />
                ))}
              </div>
            )
          ) : (
            <>
              {/* Диалог */}
              <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto px-6 pt-3">
                {messages.map((m) => (
                  <MessageRow key={m.id} m={m} onChoose={chooseIncident} />
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
                  placeholder={
                    incidentFlow?.stage === "details"
                      ? "Опишите, что именно не работает"
                      : incidentFlow?.stage === "choice"
                        ? "Или опишите проблему своими словами"
                        : suggestionFlow?.stage === "description"
                          ? "Опишите функционал и задачу"
                          : suggestionFlow?.stage === "contacts"
                            ? "Номер телефона и имя — по желанию"
                            : "Например, подключить сотрудник"
                  }
                  aria-label="Сообщение в чат"
                  className="h-11 w-full rounded-xl bg-[#EFEFF1] px-4 text-[14px] text-[#181A25] outline-none placeholder:text-[#868894]"
                />
                <div className="mt-2.5">
                  <button
                    type="button"
                    aria-expanded={chipsOpen}
                    onClick={() => setChipsOpen((v) => !v)}
                    className="flex items-center gap-1 text-[13px] text-[#868894] transition-colors hover:text-[#42454C] cursor-pointer"
                  >
                    <ChevronDown
                      className={`size-4 transition-transform ${chipsOpen ? "rotate-180" : ""}`}
                      strokeWidth={1.8}
                    />
                    {chipsOpen ? "Свернуть подсказки" : "Показать подсказки"}
                  </button>
                </div>
                {chipsOpen && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {suggestions.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          setChipsOpen(false);
                          send(s.text, s.special);
                        }}
                        className="flex h-11 items-center rounded-xl bg-[#EFEFF1] px-4 text-[14px] text-[#181A25] transition-colors hover:bg-[#E5E5E8] cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}

function ContactRow({
  icon: Icon,
  title,
  caption,
}: {
  icon: typeof Phone;
  title: string;
  caption: string;
}) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-[#F3F3F5] p-[7px] pr-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white">
        <Icon className="size-[18px] text-[#42454C]" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium leading-[18px] text-[#181A25]">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-[13px] leading-4 text-[#868894]">
          {caption}
        </span>
      </span>
    </div>
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
