// FAQ.jsx  →  src/components/home/FAQ.jsx

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        id: 1,
        question: 'Is my donation tax-deductible?',
        answer: 'Yes, all donations made to Al Kareem are eligible for tax deduction under Section 80G of the Income Tax Act. You will receive an official receipt via email after your donation is processed.',
    },
    {
        id: 2,
        question: 'Can I donate anonymously?',
        answer: 'Absolutely. During the donation process, you can choose to remain anonymous. Your name will not be displayed publicly, though we will still send you a private confirmation and tax receipt.',
    },
    {
        id: 3,
        question: 'How is my donation used?',
        answer: 'Every rupee you donate goes directly toward our programs — education support, food distribution, healthcare camps, women empowerment, and disaster relief. We maintain full transparency with quarterly impact reports available on our website.',
    },
    {
        id: 4,
        question: 'Can I cancel my recurring donation?',
        answer: 'Yes, you can cancel your recurring donation at any time by logging into your account or contacting our support team at support@alkareem.org. There are no cancellation fees or penalties.',
    },
];

// ─── Single FAQ item ──────────────────────────────────────────────────────────
function FAQItem({ faq, isOpen, onToggle }) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-6 py-5 text-left group cursor-pointer"
            >
                <span className="text-[15px] xl:text-lg font-semibold text-slate-800 pr-4 leading-snug">
                    {faq.question}
                </span>
                <span className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-rose-50' : 'bg-rose-50'}`}>
                    {isOpen
                        ? <Minus size={15} strokeWidth={2.5} className="text-rose-500" />
                        : <Plus size={15} strokeWidth={2.5} className="text-rose-500" />
                    }
                </span>
            </button>

            {/* Answer — smooth height transition */}
            <div
                className="overflow-hidden transition-all duration-400 ease-in-out"
                style={{ maxHeight: isOpen ? '300px' : '0px' }}
            >
                <p className="px-6 pb-5 text-sm xl:text-base text-slate-500 leading-relaxed">
                    {faq.answer}
                </p>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FAQ() {
    const [openId, setOpenId] = useState(null);

    const toggle = (id) => setOpenId(prev => prev === id ? null : id);

    return (
        <section className="bg-[ffffff] py-16 lg:py-28">
            <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <h5 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-900 leading-tight mb-2">
                        Frequently Asked Questions
                    </h5>
                    <p className="text-sm sm:text-base text-slate-400 font-medium">
                        Everything you need to know about donations and our mission.
                    </p>
                </div>

                {/* FAQ list */}
                <div className="flex flex-col gap-3">
                    {faqs.map(faq => (
                        <FAQItem
                            key={faq.id}
                            faq={faq}
                            isOpen={openId === faq.id}
                            onToggle={() => toggle(faq.id)}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}