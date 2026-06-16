"use client";

import { useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { submitClient } from "@/actions/client";

export default function ClientForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { success: true; clientId: string } | { success: false; error: string } | null
  >(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await submitClient(formData);
      setResult(res);
      if (res.success) formRef.current?.reset();
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md mx-auto px-4"
    >
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Ajouter un prospect
      </h1>
      <p className="text-sm text-gray-500 mb-6">30 secondes, c'est tout.</p>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jean.dupont@email.com"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>

        <div>
          <label
            htmlFor="nom"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nom{" "}
            <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            autoComplete="name"
            placeholder="Jean Dupont"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>

        <motion.button
          type="submit"
          disabled={isPending}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Envoi…
            </span>
          ) : (
            "Soumettre le prospect"
          )}
        </motion.button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
            result.success
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {result.success
            ? `Prospect ajouté ! ID : ${result.clientId}`
            : result.error}
        </motion.div>
      )}
    </motion.div>
  );
}
