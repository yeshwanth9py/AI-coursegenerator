import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-500 rounded-full blur-xl opacity-20 animate-pulse" />
        <Loader2 className="w-12 h-12 text-brand-400 animate-spin relative z-10" />
      </div>
      <p className="text-slate-400 font-medium tracking-wide">{text}</p>
    </div>
  );
}