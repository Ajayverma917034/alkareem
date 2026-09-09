import { CheckCircle2 } from 'lucide-react';

export default function PlanCard({ plan, onSubscribe, isCurrentPlan, isLoading }) {
    const {
        name, price, billingLabel, annualEquivalent,
        accentColor, buttonColor, badge, badgeColor,
        isMostPopular, features
    } = plan;

    return (
        <div
            className={`plan-card relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${isMostPopular
                    ? 'scale-105 shadow-2xl'
                    : 'hover:shadow-xl'
                }`}
            style={{
                background: 'rgba(255,255,255,0.97)',
                border: isMostPopular ? `2px solid ${accentColor}` : '2px solid transparent',
                boxShadow: isMostPopular ? `0 20px 60px ${accentColor}30` : '0 4px 24px rgba(0,0,0,0.08)'
            }}
        >
            {/* Badge */}
            {badge && (
                <div
                    className="absolute top-0 left-0 px-3 py-1 text-xs font-bold text-white rounded-br-xl z-10"
                    style={{ background: badgeColor || accentColor }}
                >
                    {badge}
                </div>
            )}

            {/* Header */}
            <div className="p-6 pb-4 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-4xl font-black text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                        ₹{price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">{billingLabel}</span>
                </div>
                {annualEquivalent && (
                    <p className="text-xs text-gray-400 mb-3">📅 {annualEquivalent}</p>
                )}
                <div className="h-0.5 rounded-full mt-3" style={{ background: accentColor }} />
            </div>

            {/* Features */}
            <div className="flex-1 px-6 pb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    What's included:
                </p>
                <ul className="space-y-2.5">
                    {features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <CheckCircle2
                                className="w-4 h-4 mt-0.5 flex-shrink-0 check-icon"
                                style={{ color: accentColor, animationDelay: `${i * 0.05}s` }}
                            />
                            <span className="text-sm text-gray-600 leading-tight">{feat}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
                <button
                    onClick={() => onSubscribe(plan._id)}
                    disabled={isCurrentPlan || isLoading}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                    style={{
                        background: isCurrentPlan
                            ? '#9ca3af'
                            : `linear-gradient(135deg, ${buttonColor}, ${buttonColor}cc)`,
                        boxShadow: isCurrentPlan ? 'none' : `0 4px 20px ${buttonColor}50`
                    }}
                >
                    {isCurrentPlan ? '✓ Current Plan' : isLoading ? 'Processing...' : 'Subscribe Now'}
                </button>
            </div>
        </div>
    );
}