import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";

const prisma = new PrismaClient();

describe("PostgreSQL", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("aceita uma conexão da aplicação", async () => {
    const result = await prisma.$queryRaw<Array<{ healthy: number }>>`SELECT 1 AS healthy`;

    expect(result[0]?.healthy).toBe(1);
  });
});
