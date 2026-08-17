import { describe, expect, it } from "vitest";

import { requireDatabaseUrl } from "@/lib/env";

describe("requireDatabaseUrl", () => {
  it("retorna a URL quando ela está configurada", () => {
    const previous = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "postgresql://example";

    expect(requireDatabaseUrl()).toBe("postgresql://example");

    if (previous === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previous;
    }
  });

  it("falha com mensagem compreensível quando a URL não está configurada", () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    expect(requireDatabaseUrl).toThrow("DATABASE_URL não está configurada.");

    if (previous === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previous;
    }
  });
});
