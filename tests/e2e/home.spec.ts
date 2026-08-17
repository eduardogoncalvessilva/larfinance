import { expect, test } from "@playwright/test";

test("exibe a página inicial", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Controle financeiro familiar, simples e confiável." })).toBeVisible();
});
