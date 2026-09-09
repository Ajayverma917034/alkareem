import { useState } from "react";
import WidgetCard from "./WidgetCard";
import { Send } from "lucide-react";
const CHATS = [
    { name: "Geneva", time: "10:00", text: "Hello!", self: false, initials: "G", color: "bg-violet-500" },
    { name: "Thomson", time: "10:01", text: "Hi, How are you? What about our next meeting?", self: true, initials: "T", color: "bg-emerald-400" },
];

const ChatWidget = () => {
    const [msg, setMsg] = useState("");
    return (
        <WidgetCard title="Chat">
            <div className="flex flex-col gap-3 min-h-[130px]">
                {CHATS.map((c, i) => (
                    <div key={i} className={`flex items-end gap-2 ${c.self ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${c.color}`}>
                            {c.initials}
                        </div>
                        <div className="max-w-[72%]">
                            <div className={`flex items-baseline gap-1.5 mb-1 ${c.self ? "flex-row-reverse" : "flex-row"}`}>
                                <span className="text-xs font-semibold text-slate-700">{c.name}</span>
                                <span className="text-[10px] text-slate-400">{c.time}</span>
                            </div>
                            <div className={`px-3 py-2 rounded-xl text-[12.5px] ${c.self ? "bg-emerald-400 text-white" : "bg-slate-100 text-slate-700"}`}>
                                {c.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mt-3">
                <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />
                <button className="w-9 h-9 bg-emerald-400 rounded-lg flex items-center justify-center hover:bg-emerald-500 transition-colors flex-shrink-0">
                    <Send size={14} className="text-white" />
                </button>
            </div>
        </WidgetCard>
    );
}

export default ChatWidget;