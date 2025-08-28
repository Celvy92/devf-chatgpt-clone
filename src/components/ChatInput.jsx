import { useForm } from "react-hook-form";

export default function ChatInput({ onSend }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { message: "" },
  });

  const onSubmit = async ({ message }) => {
    const text = (message ?? "").trim();
    if (!text) return;
    await onSend?.(text);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <textarea
        rows={3}
        placeholder="Escribe tu mensaje..."
        className="w-full border rounded px-3 py-2 resize-none
                   border-neutral-300 text-neutral-900 bg-white
                   dark:border-neutral-700 dark:text-neutral-50 dark:bg-neutral-800"
        {...register("message")}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded 
                     bg-neutral-900 text-white hover:bg-neutral-800 
                     disabled:opacity-50
                     dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
