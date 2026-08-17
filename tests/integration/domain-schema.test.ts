import { randomUUID } from "node:crypto";

import { PrismaClient, TransactionType, TransferDirection } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";

import { civilDate, civilDateToDatabaseDate } from "@/lib/date";

const prisma = new PrismaClient();

describe("schema do domínio", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("preserva vínculos familiares, unicidade de membership e duas pernas de transferência", async () => {
    const suffix = randomUUID();
    const owner = await prisma.user.create({
      data: {
        email: `owner-${suffix}@larfinance.test`,
        emailNormalized: `owner-${suffix}@larfinance.test`,
        passwordHash: "not-a-real-password-hash",
      },
    });
    const family = await prisma.family.create({
      data: {
        name: "Família de teste",
        createdById: owner.id,
      },
    });

    try {
      const membership = await prisma.membership.create({
        data: {
          familyId: family.id,
          userId: owner.id,
          role: "ADMIN",
        },
      });
      const [origin, destination] = await Promise.all([
        prisma.account.create({
          data: {
            familyId: family.id,
            name: "Origem",
            type: "CHECKING",
            initialBalanceCents: 100_000,
            initialBalanceDate: civilDateToDatabaseDate(civilDate("2026-08-17")),
            createdById: owner.id,
            updatedById: owner.id,
          },
        }),
        prisma.account.create({
          data: {
            familyId: family.id,
            name: "Destino",
            type: "CASH",
            initialBalanceCents: 0,
            initialBalanceDate: civilDateToDatabaseDate(civilDate("2026-08-17")),
            createdById: owner.id,
            updatedById: owner.id,
          },
        }),
      ]);
      const transfer = await prisma.transfer.create({
        data: {
          familyId: family.id,
          createdById: owner.id,
        },
      });

      await prisma.transaction.createMany({
        data: [
          {
            familyId: family.id,
            type: TransactionType.TRANSFER,
            amountCents: 25_000,
            accountId: origin.id,
            competenceDate: civilDateToDatabaseDate(civilDate("2026-08-17")),
            postedAt: civilDateToDatabaseDate(civilDate("2026-08-17")),
            responsibleMembershipId: membership.id,
            transferId: transfer.id,
            transferDirection: TransferDirection.DEBIT,
            createdById: owner.id,
            updatedById: owner.id,
          },
          {
            familyId: family.id,
            type: TransactionType.TRANSFER,
            amountCents: 25_000,
            accountId: destination.id,
            competenceDate: civilDateToDatabaseDate(civilDate("2026-08-17")),
            postedAt: civilDateToDatabaseDate(civilDate("2026-08-17")),
            responsibleMembershipId: membership.id,
            transferId: transfer.id,
            transferDirection: TransferDirection.CREDIT,
            createdById: owner.id,
            updatedById: owner.id,
          },
        ],
      });

      await expect(
        prisma.membership.create({
          data: {
            familyId: family.id,
            userId: owner.id,
          },
        }),
      ).rejects.toMatchObject({ code: "P2002" });

      const persistedTransfer = await prisma.transfer.findUniqueOrThrow({
        where: { id: transfer.id },
        include: { transactions: { orderBy: { transferDirection: "asc" } } },
      });

      expect(persistedTransfer.transactions).toHaveLength(2);
      expect(persistedTransfer.transactions.map((transaction) => transaction.transferDirection)).toEqual([
        TransferDirection.DEBIT,
        TransferDirection.CREDIT,
      ]);
      expect(persistedTransfer.transactions.map((transaction) => transaction.amountCents)).toEqual([25_000, 25_000]);
    } finally {
      await prisma.transaction.deleteMany({ where: { familyId: family.id } });
      await prisma.transfer.deleteMany({ where: { familyId: family.id } });
      await prisma.account.deleteMany({ where: { familyId: family.id } });
      await prisma.category.deleteMany({ where: { familyId: family.id } });
      await prisma.membership.deleteMany({ where: { familyId: family.id } });
      await prisma.family.delete({ where: { id: family.id } });
      await prisma.user.delete({ where: { id: owner.id } });
    }
  });

  it("rejeita vínculo de lançamento a uma conta de outra família", async () => {
    const suffix = randomUUID();
    const owner = await prisma.user.create({
      data: {
        email: `isolamento-${suffix}@larfinance.test`,
        emailNormalized: `isolamento-${suffix}@larfinance.test`,
        passwordHash: "not-a-real-password-hash",
      },
    });
    const [familyA, familyB] = await Promise.all([
      prisma.family.create({ data: { name: "Família A", createdById: owner.id } }),
      prisma.family.create({ data: { name: "Família B", createdById: owner.id } }),
    ]);

    try {
      const membership = await prisma.membership.create({
        data: { familyId: familyA.id, userId: owner.id, role: "ADMIN" },
      });
      const foreignAccount = await prisma.account.create({
        data: {
          familyId: familyB.id,
          name: "Conta da família B",
          type: "CHECKING",
          initialBalanceCents: 0,
          initialBalanceDate: civilDateToDatabaseDate(civilDate("2026-08-17")),
          createdById: owner.id,
          updatedById: owner.id,
        },
      });

      await expect(
        prisma.transaction.create({
          data: {
            familyId: familyA.id,
            type: TransactionType.EXPENSE,
            amountCents: 1_000,
            accountId: foreignAccount.id,
            competenceDate: civilDateToDatabaseDate(civilDate("2026-08-17")),
            postedAt: civilDateToDatabaseDate(civilDate("2026-08-17")),
            responsibleMembershipId: membership.id,
            createdById: owner.id,
            updatedById: owner.id,
          },
        }),
      ).rejects.toMatchObject({ code: "P2003" });
    } finally {
      await prisma.transaction.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
      await prisma.account.deleteMany({ where: { familyId: familyB.id } });
      await prisma.membership.deleteMany({ where: { familyId: { in: [familyA.id, familyB.id] } } });
      await prisma.family.deleteMany({ where: { id: { in: [familyA.id, familyB.id] } } });
      await prisma.user.delete({ where: { id: owner.id } });
    }
  });
});
