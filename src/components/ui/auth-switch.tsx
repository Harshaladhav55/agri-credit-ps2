import { cn } from "@/lib/utils";
import { useState } from "react";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800 text-white")}>
      <h1 className="text-2xl font-bold mb-2">Component Example</h1>
      <h2 className="text-xl font-semibold text-emerald-400">{count}</h2>
      <div className="flex gap-2">
        <button 
          onClick={() => setCount((prev) => prev - 1)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold transition-all border border-slate-700"
        >
          -
        </button>
        <button 
          onClick={() => setCount((prev) => prev + 1)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold transition-all shadow-md shadow-emerald-950"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Component;
