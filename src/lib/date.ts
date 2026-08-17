export const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

declare const civilDateBrand: unique symbol;

export type CivilDate = string & { readonly [civilDateBrand]: "CivilDate" };

export function civilDate(value: string): CivilDate {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    throw new Error("A data deve usar o formato AAAA-MM-DD.");
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error("A data informada não existe no calendário.");
  }

  return value as CivilDate;
}

export function civilDateToDatabaseDate(value: CivilDate): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function databaseDateToCivilDate(value: Date): CivilDate {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");

  return civilDate(`${year}-${month}-${day}`);
}

export function todayInBusinessTimeZone(now: Date = new Date()): CivilDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return civilDate(`${values.year}-${values.month}-${values.day}`);
}
