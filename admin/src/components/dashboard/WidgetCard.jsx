import { MoreHorizontal, Minus, X } from "lucide-react";

const WidgetCard = ({ title, children, className = "" }) => {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                {/* <div className="flex items-center gap-1.5">
                    <button className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"><MoreHorizontal size={14} /></button>
                    <button className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"><Minus size={14} /></button>
                    <button className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"><X size={14} /></button>
                </div> */}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}


export default WidgetCard;