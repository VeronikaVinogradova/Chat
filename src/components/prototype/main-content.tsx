"use client";

import { useMemo, useState } from "react";
import {
  CircleCheck,
  CirclePlus,
  Info,
  Pencil,
  Search,
  Filter,
  Download,
  Plus,
  ChevronDown,
  MoreVertical,
  Check,
  Ban,
  Smartphone,
  Headphones,
  Voicemail,
} from "lucide-react";

/* ---------- Кольцевой индикатор 25% ---------- */
function ProgressRing({ percent }: { percent: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex size-[68px] items-center justify-center">
      <svg viewBox="0 0 68 68" className="size-full -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#A771F1" />
          </linearGradient>
        </defs>
        <circle cx="34" cy="34" r={r} fill="none" stroke="#F6EFFF" strokeWidth="7" />
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(percent / 100) * c} ${c}`}
        />
      </svg>
      <span className="absolute text-[13px] font-semibold text-[#181A25]">
        {percent}%
      </span>
    </div>
  );
}

/* ---------- Данные таблицы ---------- */
type ServiceIcons = "ban" | "set";

type Row = {
  id: number;
  number: string;
  name: string;
  short: string;
  sip: "ok" | "warn";
  minutes: string;
  unit: string;
  role: string;
  contract: string;
  services: ServiceIcons;
};

const employeeRows: Row[] = [
  {
    id: 1,
    number: "(968) 181-14-10",
    name: "Иван Иван",
    short: "201",
    sip: "ok",
    minutes: "Не требуется",
    unit: "—",
    role: "Сотрудник",
    contract: "123456789",
    services: "ban",
  },
  {
    id: 2,
    number: "(968) 181-14-10",
    name: "Иван Иван",
    short: "201",
    sip: "ok",
    minutes: "Не требуется",
    unit: "—",
    role: "Сотрудник",
    contract: "123456789",
    services: "set",
  },
  {
    id: 3,
    number: "(968) 181-14-10",
    name: "Иван Иван",
    short: "201",
    sip: "ok",
    minutes: "Не требуется",
    unit: "—",
    role: "Сотрудник",
    contract: "123456789",
    services: "set",
  },
];

const multichannelRows: Row[] = [
  {
    id: 11,
    number: "(495) 725-55-50",
    name: "Отдел продаж",
    short: "100",
    sip: "ok",
    minutes: "Не требуется",
    unit: "—",
    role: "Многоканальный",
    contract: "123456789",
    services: "set",
  },
  {
    id: 12,
    number: "(499) 400-40-40",
    name: "Поддержка",
    short: "102",
    sip: "ok",
    minutes: "Не требуется",
    unit: "—",
    role: "Многоканальный",
    contract: "123456789",
    services: "set",
  },
];

const GRID =
  "grid grid-cols-[28px_1.5fr_0.95fr_0.9fr_1fr_1.5fr_1.15fr_1fr_1fr_2.4fr_28px] items-center gap-x-3";

/* ---------- Строка чекбокса ---------- */
function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex size-[18px] items-center justify-center rounded-[5px] border transition-colors cursor-pointer ${
        checked
          ? "border-[#181A25] bg-[#181A25] text-white"
          : "border-[#C9CBD1] bg-white hover:border-[#868894]"
      }`}
    >
      {checked && <Check className="size-3" strokeWidth={3} />}
    </button>
  );
}

/* ---------- Услуги ---------- */
function Services({ kind }: { kind: ServiceIcons }) {
  if (kind === "ban")
    return <Ban className="size-[18px] text-[#6E7178]" strokeWidth={1.7} />;
  return (
    <span className="flex items-center gap-2.5">
      <Smartphone className="size-[18px] text-[#6E7178]" strokeWidth={1.7} />
      <Headphones className="size-[18px] text-[#6E7178]" strokeWidth={1.7} />
      <Voicemail className="size-[18px] text-[#6E7178]" strokeWidth={1.7} />
      <span className="text-[13px] font-medium text-[#2E7CE8]">+3</span>
    </span>
  );
}

/* ================= Главный контент ================= */
export default function MainContent() {
  const [tab, setTab] = useState<"employees" | "multichannel">("employees");
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const rows = tab === "employees" ? employeeRows : multichannelRows;
  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        Object.values(r).some((v) =>
          String(v).toLowerCase().includes(query.trim().toLowerCase())
        )
      ),
    [rows, query]
  );

  const allChecked = filtered.length > 0 && filtered.every((r) => checked.has(r.id));
  const toggleAll = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (allChecked) filtered.forEach((r) => next.delete(r.id));
      else filtered.forEach((r) => next.add(r.id));
      return next;
    });
  const toggleOne = (id: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <main className="min-w-[1180px] flex-1 px-8 pb-16 pt-9">
      <h1 className="text-[28px] font-semibold leading-8 text-[#181A25]">Ваша АТС</h1>

      {/* ===== Основные настройки АТС ===== */}
      <section
        aria-label="Основные настройки АТС"
        className="mt-6 rounded-2xl border border-[#ECECEE] bg-white px-6 py-5"
      >
        <div className="flex items-center gap-6">
          <div className="flex w-[88px] shrink-0 flex-col items-center gap-1">
            <ProgressRing percent={25} />
            <span className="text-[12px] leading-none text-[#868894]">настроено</span>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold leading-6 text-[#181A25]">
              Основные настройки АТС
            </h2>
            <p className="mt-1 text-[13px] leading-4 text-[#868894]">
              Осталось 3 шага
            </p>

            <div className="mt-4 flex items-center justify-between gap-4 pr-1">
              <button
                type="button"
                className="flex items-center gap-2 text-[14px] font-medium text-[#2E7CE8] transition-colors hover:text-[#1F5FBE] cursor-pointer"
              >
                <CircleCheck className="size-[18px]" strokeWidth={1.7} />
                Подключить номера сотрудников
              </button>
              <button
                type="button"
                className="flex items-center gap-2 text-[14px] text-[#181A25] transition-colors hover:text-black cursor-pointer"
              >
                <CirclePlus className="size-[18px] text-[#42454C]" strokeWidth={1.7} />
                Подключить многоканальные номера
              </button>
              <button
                type="button"
                className="flex items-center gap-2 text-[14px] text-[#181A25] transition-colors hover:text-black cursor-pointer"
              >
                <CirclePlus className="size-[18px] text-[#42454C]" strokeWidth={1.7} />
                Создать маршрут
              </button>
              <button
                type="button"
                className="flex items-center gap-2 text-[14px] text-[#181A25] transition-colors hover:text-black cursor-pointer"
              >
                <CirclePlus className="size-[18px] text-[#42454C]" strokeWidth={1.7} />
                Подключить запись звонков
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Ряд из трёх карточек ===== */}
      <div className="mt-6 grid grid-cols-[535fr_312fr_424fr] gap-6">
        {/* Пакет */}
        <section
          aria-label="Тариф"
          className="flex min-h-[164px] flex-col rounded-2xl border border-[#ECECEE] bg-white p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div>
                <div className="text-[16px] font-semibold leading-5 text-[#181A25]">
                  Стандартный
                </div>
                <div className="mt-0.5 text-[13px] leading-4 text-[#868894]">
                  Пакет
                </div>
              </div>
              <button
                type="button"
                aria-label="Переименовать пакет"
                className="flex size-10 items-center justify-center rounded-xl border border-[#ECECEE] text-[#42454C] transition-colors hover:bg-[#F6F6F7] cursor-pointer"
              >
                <Pencil className="size-[18px]" strokeWidth={1.7} />
              </button>
            </div>
            <button
              type="button"
              className="flex h-11 items-center rounded-xl border border-[#ECECEE] px-4 text-[14px] font-medium text-[#181A25] transition-colors hover:bg-[#F6F6F7] cursor-pointer"
            >
              Открыть счета
            </button>
          </div>

          <div className="mt-auto flex items-end pt-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-semibold leading-5 text-[#181A25]">
                  3 490 ₽
                </span>
                <Info className="size-4 text-[#C9CBD1]" strokeWidth={1.7} />
              </div>
              <div className="mt-1 text-[13px] leading-4 text-[#868894]">Пакет</div>
            </div>
            <div className="ml-[100px]">
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-semibold leading-5 text-[#181A25]">
                  0 ₽
                </span>
                <Info className="size-4 text-[#C9CBD1]" strokeWidth={1.7} />
              </div>
              <div className="mt-1 text-[13px] leading-4 text-[#868894]">
                Сверх пакета
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[17px] font-semibold leading-5 text-[#181A25]">
                3 490 ₽
              </div>
              <div className="mt-1 text-[13px] leading-4 text-[#868894]">Итого</div>
            </div>
          </div>
        </section>

        {/* 20 номеров */}
        <section
          aria-label="Номера"
          className="flex min-h-[164px] flex-col rounded-2xl border border-[#ECECEE] bg-white p-6"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-[17px] font-semibold leading-5 text-[#181A25]">
              20 номеров
            </span>
            <span className="text-[14px] leading-5 text-[#868894]">из 20</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E8E8EA]">
            <div className="h-full w-[20%] rounded-full bg-[#A771F1]" />
          </div>

          <div className="mt-auto grid grid-cols-[82px_1fr] gap-x-2.5 gap-y-2 pt-4">
            <span className="text-[13px] leading-[18px] text-[#868894]">
              Подключено
            </span>
            <span className="flex items-center gap-2 text-[12.5px] leading-[18px] text-[#181A25]">
              <span className="size-2 shrink-0 rounded-full bg-[#A771F1]" />
              <span className="whitespace-nowrap">1 номер сотрудников</span>
            </span>
            <span className="text-[13px] leading-[18px] text-[#868894]">
              Осталось
            </span>
            <span className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-[12.5px] leading-[18px] text-[#181A25]">
                <span className="size-2 shrink-0 rounded-full bg-[#D4D4D9]" />
                <span className="whitespace-nowrap">2 многоканальных номеров</span>
              </span>
              <span className="flex items-center gap-2 text-[12.5px] leading-[18px] text-[#181A25]">
                <span className="size-2 shrink-0 rounded-full bg-[#D4D4D9]" />
                <span className="whitespace-nowrap">0 номеров сотрудников</span>
              </span>
            </span>
          </div>
        </section>

        {/* Внешние SIP-номера */}
        <section
          aria-label="Внешние SIP-номера"
          className="relative flex min-h-[164px] overflow-hidden rounded-2xl bg-black p-6"
        >
          <div className="relative z-10 flex flex-col items-start">
            <h2 className="whitespace-nowrap text-[17px] font-semibold leading-6 text-white">
              Внешние SIP-номера
            </h2>
            <p className="mt-1.5 max-w-[185px] text-[13px] leading-[18px] text-[#9A9CA3]">
              Используйте свои номера других операторов связи
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="mt-auto flex items-center gap-1 whitespace-nowrap text-[13px] font-medium text-[#FDD835] transition-colors hover:text-[#FFE866]"
            >
              Смотрите, как это работает
              <span aria-hidden className="tracking-tighter">&gt;&gt;</span>
            </a>
          </div>
          <img
            src="/sip-illustration.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute right-0 top-1/2 h-[calc(100%-6px)] w-auto -translate-y-1/2"
          />
        </section>
      </div>

      {/* ===== Управление номерами ===== */}
      <h2 className="mt-12 text-[20px] font-semibold leading-6 text-[#181A25]">
        Управление номерами
      </h2>

      {/* Табы */}
      <div className="mt-5 flex items-center gap-8 border-b border-[#ECECEE]">
        <button
          type="button"
          onClick={() => {
            setTab("employees");
            setChecked(new Set());
          }}
          aria-selected={tab === "employees"}
          role="tab"
          className={`relative pb-3 text-[14px] transition-colors cursor-pointer ${
            tab === "employees"
              ? "font-medium text-[#181A25]"
              : "text-[#868894] hover:text-[#42454C]"
          }`}
        >
          Номера сотрудников
          {tab === "employees" && (
            <span className="absolute -bottom-px left-0 right-0 h-[3px] rounded-full bg-[#FDD835]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("multichannel");
            setChecked(new Set());
          }}
          aria-selected={tab === "multichannel"}
          role="tab"
          className={`relative pb-3 text-[14px] transition-colors cursor-pointer ${
            tab === "multichannel"
              ? "font-medium text-[#181A25]"
              : "text-[#868894] hover:text-[#42454C]"
          }`}
        >
          Многоканальные номера
          {tab === "multichannel" && (
            <span className="absolute -bottom-px left-0 right-0 h-[3px] rounded-full bg-[#FDD835]" />
          )}
        </button>
      </div>

      {/* Тулбар */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-11 w-[420px] items-center gap-2.5 rounded-xl bg-[#EFEFF1] px-4">
          <Search className="size-[18px] shrink-0 text-[#868894]" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск"
            aria-label="Поиск по номерам"
            className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-[#181A25] outline-none placeholder:text-[#868894]"
          />
          <span className="h-6 w-px shrink-0 bg-[#D4D4D9]" aria-hidden />
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-[14px] text-[#181A25] transition-colors hover:text-[#42454C] cursor-pointer"
          >
            Везде
            <ChevronDown className="size-4 text-[#868894]" strokeWidth={1.8} />
          </button>
        </div>

        <button
          type="button"
          aria-label="Фильтры"
          className="flex size-11 items-center justify-center rounded-xl border border-[#ECECEE] text-[#42454C] transition-colors hover:bg-[#F6F6F7] cursor-pointer"
        >
          <Filter className="size-[18px]" strokeWidth={1.7} />
        </button>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-xl border border-[#ECECEE] px-5 text-[14px] font-medium text-[#181A25] transition-colors hover:bg-[#F6F6F7] cursor-pointer"
          >
            <Download className="size-4" strokeWidth={1.8} />
            Импорт
          </button>
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-xl bg-[#FDD835] px-5 text-[14px] font-medium text-[#181A25] transition-colors hover:bg-[#F5CE0A] cursor-pointer"
          >
            <Plus className="size-4" strokeWidth={2} />
            Добавить номер
          </button>
        </div>
      </div>

      {/* Таблица */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-[#ECECEE] bg-white">
        <div className="min-w-[1150px]">
          {/* Заголовок */}
          <div className={`${GRID} h-14 px-6`}>
            <Checkbox
              checked={allChecked}
              onChange={toggleAll}
              label="Выбрать все"
            />
            {[
              "Номер",
              "Имя",
              "Короткий",
              "Статус SIP",
              "Доступно, мин",
              "Подразделение",
              "Роль",
              "Договор",
              "Услуги",
            ].map((h) => (
              <span
                key={h}
                className="text-[13px] leading-4 text-[#868894]"
              >
                {h}
              </span>
            ))}
            <span />
          </div>

          {/* Строки */}
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`${GRID} h-12 border-t border-[#F1F1F3] px-6 transition-colors hover:bg-[#FAFAFB]`}
            >
              <Checkbox
                checked={checked.has(r.id)}
                onChange={() => toggleOne(r.id)}
                label={`Выбрать номер ${r.number}`}
              />
              <span className="flex items-center gap-2 text-[14px] text-[#181A25]">
                {r.number}
                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#2CA853]">
                  <Check className="size-3 text-white" strokeWidth={3.5} />
                </span>
              </span>
              <span className="truncate text-[14px] text-[#181A25]">{r.name}</span>
              <span className="text-[14px] text-[#181A25]">{r.short}</span>
              <span>
                {r.sip === "ok" ? (
                  <CircleCheck
                    className="size-[18px] fill-[#2CA853] text-white"
                    strokeWidth={1.7}
                  />
                ) : (
                  <Ban className="size-[18px] text-[#C9CBD1]" strokeWidth={1.7} />
                )}
              </span>
              <span className="text-[14px] text-[#2E7CE8]">{r.minutes}</span>
              <span className="text-[14px] text-[#181A25]">{r.unit}</span>
              <span className="truncate text-[14px] text-[#181A25]">{r.role}</span>
              <span className="text-[14px] text-[#181A25]">{r.contract}</span>
              <span>
                <Services kind={r.services} />
              </span>
              <button
                type="button"
                aria-label="Действия с номером"
                className="flex size-8 items-center justify-center rounded-lg text-[#868894] transition-colors hover:bg-[#F1F1F3] hover:text-[#42454C] cursor-pointer"
              >
                <MoreVertical className="size-[18px]" strokeWidth={1.8} />
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex h-24 items-center justify-center border-t border-[#F1F1F3] text-[14px] text-[#868894]">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
