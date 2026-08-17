import { describe, expect, it } from "vitest";

import { addCents, cents, formatBrl, parseBrlToCents, positiveCents, subtractCents } from "@/lib/money";

describe("money", () => {
  it.each([
    ["0", 0],
    ["12", 1200],
    ["12,3", 1230],
    ["1.234,56", 123456],
    ["R$ 9,99", 999],
    ["-5,01", -501],
  ])("converte %s para centavos", (input, expected) => {
    expect(parseBrlToCents(input)).toBe(expected);
  });

  it("rejeita formatos monetários ambíguos ou inválidos", () => {
    expect(() => parseBrlToCents("12.34")).toThrow("valor em BRL válido");
    expect(() => parseBrlToCents("12,345")).toThrow("valor em BRL válido");
    expect(() => cents(1.5)).toThrow("inteiro seguro");
  });

  it("opera apenas em centavos inteiros", () => {
    expect(addCents(cents(125), cents(75))).toBe(200);
    expect(subtractCents(cents(125), cents(75))).toBe(50);
    expect(() => positiveCents(0)).toThrow("maior que zero");
    expect(formatBrl(cents(123456))).toBe("R$ 1.234,56");
  });
});
