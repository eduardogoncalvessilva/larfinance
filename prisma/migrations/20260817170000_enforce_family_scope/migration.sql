-- Enforce tenant scope for all links that belong to a family.
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_accountId_fkey";
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_responsibleMembershipId_fkey";
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_transferId_fkey";

CREATE UNIQUE INDEX "Account_id_familyId_key" ON "Account"("id", "familyId");
CREATE UNIQUE INDEX "Category_id_familyId_key" ON "Category"("id", "familyId");
CREATE UNIQUE INDEX "Membership_id_familyId_key" ON "Membership"("id", "familyId");
CREATE UNIQUE INDEX "Transfer_id_familyId_key" ON "Transfer"("id", "familyId");

ALTER TABLE "Category"
  ADD CONSTRAINT "Category_parentId_familyId_fkey"
  FOREIGN KEY ("parentId", "familyId") REFERENCES "Category"("id", "familyId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_accountId_familyId_fkey"
  FOREIGN KEY ("accountId", "familyId") REFERENCES "Account"("id", "familyId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_categoryId_familyId_fkey"
  FOREIGN KEY ("categoryId", "familyId") REFERENCES "Category"("id", "familyId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_responsibleMembershipId_familyId_fkey"
  FOREIGN KEY ("responsibleMembershipId", "familyId") REFERENCES "Membership"("id", "familyId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_transferId_familyId_fkey"
  FOREIGN KEY ("transferId", "familyId") REFERENCES "Transfer"("id", "familyId")
  ON DELETE RESTRICT ON UPDATE CASCADE;
