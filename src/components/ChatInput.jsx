import { useForm } from "react-hook-form";

export default function ChatInput({ onSend }) {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: { prompt: "" },
    mode: "onChange",
  });

  const onSubmit = ({ prompt }) => {
    onSend(prompt);
    reset({ prompt: "" });
  };

  const promptValue = watch("prompt");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2">
      <div className="flex-1">
        <textarea
          className={`flex-1 min-h-[44px] max-h-40 w-full resize-y rounded-xl border p-3 outline-none focus:ring-2 ${
            errors.prompt ? "border-red-500 focus:ring-red-500" : "border-neutral-300 focus:ring-blue-500"
          }`}
          placeholder="Escribe tu mensaje..."
          {...register("prompt", {
            required: "El mensaje es obligatorio",
            minLength: { value: 2, message: "Mínimo 2 caracteres" },
            maxLength: { value: 1000, message: "Máximo 1000 caracteres" },
            validate: (v) => (v.trim().length ? true : "No escribas solo espacios"),
          })}
        />
        {errors.prompt && <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>}
        <p className="mt-1 text-xs text-neutral-500">{(promptValue || "").length}/1000</p>
      </div>

      <button
        type="submit"
        disabled={!(promptValue || "").trim()}
        className="h-[44px] px-4 rounded-xl border border-neutral-300 hover:bg-neutral-100 disabled:opacity-50"
      >
        Enviar
      </button>
    </form>
  );
}
