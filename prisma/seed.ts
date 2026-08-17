if (process.env.NODE_ENV === "production") {
  throw new Error("O seed de demonstração só pode executar em desenvolvimento.");
}

console.info("Seed de demonstração ainda não possui dados de domínio.");
