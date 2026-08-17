import { describe, expect, it } from "vitest";

import { BUSINESS_TIME_ZONE, civilDate, civilDateToDatabaseDate, databaseDateToCivilDate, todayInBusinessTimeZone } from "@/lib/date";

describe("date", () => {
  it("aceita somente datas civis existentes", () => {
    expect(civilDate("2026-02-28")).toBe("2026-02-28");
    expect(() => civilDate("2026-02-29")).toThrow("não existe");
    expect(() => civilDate("28/02/2026")).toThrow("AAAA-MM-DD");
  });

  it("preserva data civil ao converter para persistência", () => {
    const value = civilDate("2026-08-17");

    expect(databaseDateToCivilDate(civilDateToDatabaseDate(value))).toBe(value);
  });

  it("usa America/Sao_Paulo para encontrar a data atual", () => {
    const instant = new Date("2026-08-17T02:30:00.000Z");

    expect(BUSINESS_TIME_ZONE).toBe("America/Sao_Paulo");
    expect(todayInBusinessTimeZone(instant)).toBe("2026-08-16");
  });
});
