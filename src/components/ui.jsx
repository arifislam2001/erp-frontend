export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-[#d6a15d]/70 focus:bg-white/10";

export function Alert({ tone = "error", children }) {
  const tones = {
    error: "border-rose-400/30 bg-rose-400/10 text-rose-100",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    info: "border-[#d6a15d]/30 bg-[#d6a15d]/10 text-[#f3ddb8]",
  };
  return (
    <div className={`rounded-xl border px-3.5 py-3 text-sm leading-6 ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[#d6a15d] text-[#1b140b] hover:bg-[#e2b57a]",
    ghost: "border border-white/10 bg-white/5 text-stone-100 hover:bg-white/10",
    danger: "bg-rose-500/90 text-white hover:bg-rose-400",
    quiet: "text-stone-300 hover:bg-white/10 hover:text-white",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-white/10 bg-[#141c19] p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-stone-50">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-stone-400 hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Avatar({ name, src, size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-lg",
  };
  if (src) {
    return <img src={src} alt="" className={`${sizes[size]} rounded-full object-cover`} />;
  }
  const letters = (name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={`${sizes[size]} grid place-items-center rounded-full bg-[#243028] font-semibold text-[#e7c48a]`}
    >
      {letters || "U"}
    </span>
  );
}
