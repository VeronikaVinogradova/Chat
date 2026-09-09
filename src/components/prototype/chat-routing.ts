/*
 Семантические ядра и классификатор обращений из чата.
 Пользователь пишет в один чат — система определяет направление
 и тип запроса, затем маршрутизирует:
   инцидент    → тикет в поддержку (со статусом «В работе / Отработан»)
   отзыв       → сервис сбора отзывов, офлайн-ответ сотрудника
   предложение → продуктовая команда
   вопрос      → менеджер поддержки в этом же чате
*/

export type Direction =
  | "numbers"
  | "services"
  | "files"
  | "settings"
  | "billing"
  | "newlk"
  | "other";

export type Intent = "incident" | "review" | "suggestion" | "support";

export type ChipMeta = { label: string; bg: string; fg: string };

export const DIRECTION_META: Record<Direction, ChipMeta> = {
  numbers: { label: "Номера", bg: "#E8EBFF", fg: "#4F46E5" },
  services: { label: "Услуги", bg: "#E9F1FC", fg: "#2E7CE8" },
  files: { label: "Файлы", bg: "#E5F5EB", fg: "#2CA853" },
  settings: { label: "Настройки АТС", bg: "#F3EBFF", fg: "#7C3AED" },
  billing: { label: "Тарифы и оплата", bg: "#FFF6D6", fg: "#9A7B0A" },
  newlk: { label: "Переход в новый ЛК", bg: "#E0F5F4", fg: "#0F9488" },
  other: { label: "Другое", bg: "#F1F1F3", fg: "#6E7178" },
};

export const INTENT_META: Record<Intent, ChipMeta> = {
  incident: { label: "Инцидент", bg: "#FDECEC", fg: "#D64545" },
  review: { label: "Отзыв", bg: "#E5F5EB", fg: "#2CA853" },
  suggestion: { label: "Предложение", bg: "#E9F1FC", fg: "#2E7CE8" },
  support: { label: "Вопрос", bg: "#F1F1F3", fg: "#42454C" },
};

/*
 Ядра направлений: списки основ слов.
 Основы длиной <= 3 символов сравниваются с токеном целиком
 (короткие, чтобы не ловить ложные вхождения),
 длинные — по началу слова, покрывая словоизменение.
*/
const DIRECTION_KERNELS: Record<Exclude<Direction, "other">, string[]> = {
  numbers: [
    "номер", "перенос", "перенес", "портир", "8-800", "8800",
    "многоканальн", "городской", "виртуальн", "прямой",
  ],
  services: [
    "услуг", "маршрутиз", "переадрес", "голосов", "звонк", "запис",
    "аон", "определител", "обзвон", "рассылк", "смс", "api",
    "интеграц", "amocrm", "битрикс", "telegram", "whatsapp",
    "речев", "аналитик", "распознав", "помощник", "ivr",
  ],
  files: [
    "файл", "хранилищ", "скача", "прослуш", "выгруз", "архив",
    "аудио", "запис", "гигабайт", "мегабайт", "бэкап", "backup", "гб",
  ],
  settings: [
    "настро", "атс", "сотрудн", "внутренн", "схем", "расписан",
    "график", "доступ", "права", "роль", "уведомлен", "коротк", "конференц",
  ],
  billing: [
    "тариф", "пакет", "оплат", "заплат", "счет", "деньг", "списа",
    "возврат", "продл", "баланс", "задолж", "реквизит", "чек",
    "квитанц", "безнал", "стоимост", "цен", "стоит", "абонплат", "платеж",
  ],
  newlk: [
    "кабинет", "переход", "перейд", "миграц", "войти", "авторизац",
    "регистрац", "интерфейс", "аккаунт", "логин", "пароль", "лк",
  ],
};

/* Ядра типов запроса (интентов) */
const INCIDENT_KERNEL = [
  "не работает", "не приходит", "не могу", "не отображается",
  "не загружа", "не открыва", "не отправля", "не сохраня",
  "не проходит", "нет звука", "не звонит", "не слышн",
  "ошибк", "слома", "недоступ", "пропа", "зависа", "завис", "баг",
  "сбой", "отвалил", "перестал", "лаг", "проблем", "некорректн",
  "вылета", "белый экран", "обрыв", "глюч", "глюк", "дубл", "теря",
];

const REVIEW_KERNEL = [
  "спасиб", "благодар", "молодц", "супер", "класс", "нравит",
  "понравил", "отличн", "ужасн", "отвратительн", "отзыв", "оцен",
  "похвал", "хам", "грубост", "вежлив", "порадовал", "жалоб",
];

const SUGGESTION_KERNEL = [
  "предлага", "предлож", "пожелан", "идея", "идеи", "идей",
  "добавьте", "доработ", "внедр", "сделайте", "было бы",
  "хотелось бы", "хочу чтобы",
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, "е");
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^\p{L}\p{N}+-]+/u)
    .filter(Boolean);
}

function matchIn(stems: string[], tokens: string[], bigrams: string[]): boolean {
  return stems.some((stem) => {
    if (stem.includes(" ")) {
      return bigrams.some((bg) => bg.startsWith(stem));
    }
    if (stem.length <= 3) {
      return tokens.includes(stem);
    }
    return tokens.some((t) => t.startsWith(stem));
  });
}

/** Определяет направление и тип запроса по семантическим ядрам */
export function classify(text: string): { direction: Direction; intent: Intent } {
  const tokens = tokenize(text);
  const bigrams = tokens.slice(1).map((t, i) => `${tokens[i]} ${t}`);

  const scores = (Object.keys(DIRECTION_KERNELS) as Exclude<Direction, "other">[]).map(
    (dir) => ({
      dir,
      score: DIRECTION_KERNELS[dir].filter((stem) => matchIn([stem], tokens, bigrams)).length,
    }),
  );
  scores.sort((a, b) => b.score - a.score);
  const direction: Direction = scores[0].score > 0 ? scores[0].dir : "other";

  // Приоритет: инцидент → предложение → отзыв → вопрос
  let intent: Intent = "support";
  if (matchIn(INCIDENT_KERNEL, tokens, bigrams)) intent = "incident";
  else if (matchIn(SUGGESTION_KERNEL, tokens, bigrams)) intent = "suggestion";
  else if (matchIn(REVIEW_KERNEL, tokens, bigrams)) intent = "review";

  return { direction, intent };
}

/** Текст маршрутизации в карточке «Запрос распознан» */
export function routingAction(intent: Intent, direction: Direction): string {
  switch (intent) {
    case "incident":
      return "Зарегистрировал инцидент и передал команде эксплуатации. Статус покажу в этом чате.";
    case "review":
      return "Передал отзыв в сервис сбора отзывов. Ответственный сотрудник ответит офлайн — здесь или на почту.";
    case "suggestion":
      return "Передал предложение продуктовой команде — они собирают пожелания к личному кабинету.";
    default:
      return direction === "other"
        ? "Подключаю менеджера поддержки — уточните детали в диалоге."
        : "Подключаю менеджера поддержки по этому направлению — ответит в чате.";
  }
}

/** Ответ ИИ-агента на вопрос по настройке АТС */
export function agentReply(text: string): string {
  const tokens = tokenize(text);
  const has = (...stems: string[]) => matchIn(stems, tokens, []);

  if (has("маршрутиз", "переадрес", "схем"))
    return "Маршрутизация: Настройки АТС → Схема вызова → «Добавить правило» → выберите условие (время, день недели) и адресат: сотрудник, группа или голосовое меню.";
  if (has("сотрудн"))
    return "Добавить сотрудника: Настройки АТС → Сотрудники → «Добавить номер» → укажите имя и внутренний номер → сохраните. Сотрудник появится в разделе «Управление номерами».";
  if (has("запис"))
    return "Запись звонков: Услуги → Запись разговоров → включите переключатель для нужного направления. Записи появятся в разделе «Файлы» через 1–2 минуты.";
  if (has("файл", "хранилищ"))
    return "Файловое хранилище: раздел «Файлы» — прослушивание, скачивание и выгрузка записей. Объём расширяется в Настройках → Хранилище → «Увеличить».";
  if (has("тариф", "оплат", "счет"))
    return "Тариф «Стандартный» включает 20 номеров. Смена пакета: Тарифы → «Сменить». Оплата — раздел «Счета»: картой или по счёту для юрлиц.";
  if (has("номер", "перенос"))
    return "Новый номер: Номера → «Добавить номер» → выберите город и тип (прямой, 8-800, многоканальный). Перенос существующего оформляется там же — понадобится справка от оператора.";
  return "Помогу настроить по шагам. Уточните, какой раздел настраиваем — схема вызова, сотрудники, услуги или номера?";
}
