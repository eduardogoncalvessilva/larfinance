declare const centsBrand: unique symbol;

export type Cents = number & { readonly [centsBrand]: "Cents" };

export function cents(value: number): Cents {
  if (!Number.isSafeInteger(value)) {
    throw new Error("O valor monetário deve ser um inteiro seguro de centavos.");
  }

  return value as Cents;
}

export function positiveCents(value: number): Cents {
  const amount = cents(value);

  if (amount <= 0) {
    throw new Error("O valor monetário deve ser maior que zero.");
  }

  return amount;
}

export function addCents(...values: Cents[]): Cents {
  return cents(values.reduce((total, value) => total + value, 0));
}

export function subtractCents(left: Cents, right: Cents): Cents {
  return cents(left - right);
}

export function parseBrlToCents(input: string): Cents {
  const normalized = input.trim().replace(/^R\$\s?/, "");
  const match = normalized.match(/^(-)?(?:(\d{1,3}(?:\.\d{3})+)|(\d+))(?:,(\d{1,2}))?$/);

  if (!match) {
    throw new Error("Informe um valor em BRL válido, como 1.234,56.");
  }

  const [, sign = "", groupedInteger, plainInteger, decimal = ""] = match;
  const integer = (groupedInteger ?? plainInteger).replaceAll(".", "");
  const decimalInCents = decimal.padEnd(2, "0");
  const absolute = Number(`${integer}${decimalInCents}`);

  return cents(sign === "-" ? -absolute : absolute);
}

export function formatBrl(value: Cents): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}
