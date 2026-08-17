"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    console.error("Falha inesperada na aplicação", { digest: error.digest });
  }, [error.digest]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-50">
      <section className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-xl font-semibold">Não foi possível carregar esta página.</h1>
        <p className="mt-2 text-zinc-300">Tente novamente. Se o problema continuar, reinicie a aplicação local.</p>
        <button className="mt-5 rounded-lg bg-sky-400 px-4 py-2 font-medium text-zinc-950" onClick={reset} type="button">
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
