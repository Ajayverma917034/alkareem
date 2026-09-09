
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ title, value, change, label, icon: Icon, gradient }) => {
    const isPositive = parseFloat(change) > 0;

    return (
        <div className={`rounded-xl p-5 text-white flex items-start justify-between ${gradient}`}>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1.5">{title}</p>
                <p className="text-2xl font-bold tracking-tight mb-2">{value}</p>
                <div className="flex items-center gap-1.5">
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span className="text-xs font-semibold">{change}</span>
                    <span className="text-[11px] opacity-75">{label}</span>
                </div>
            </div>
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon size={20} />
            </div>
        </div>
    );
}

export default StatCard;