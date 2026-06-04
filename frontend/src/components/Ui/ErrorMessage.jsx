import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl">
      <AlertCircle size={20} className="shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}