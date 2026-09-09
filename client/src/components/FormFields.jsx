export function Input({
    className = "",
    label,
    required,
    containerClassName = "",
    id,
    ...props
}) {
    return (
        <div className={containerClassName}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"
                >
                    {label}
                    {required && (
                        <span className="text-red-500 ml-0.5">*</span>
                    )}
                </label>
            )}

            <input
                id={id}
                className={`w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition placeholder-gray-300 ${className}`}
                {...props}
            />
        </div>
    );
}

export function Select({
    children,
    className = "",
    label,
    required,
    containerClassName = "",
    id,
    ...props
}) {
    return (
        <div className={containerClassName}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"
                >
                    {label}
                    {required && (
                        <span className="text-red-500 ml-0.5">*</span>
                    )}
                </label>
            )}

            <select
                id={id}
                className={`w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition ${className} `}
                {...props}
            >
                {children}
            </select>
        </div>
    );
}


export function Textarea({
    className = "",
    label,
    required,
    containerClassName = "",
    id,
    rows = 3,
    ...props
}) {
    return (
        <div className={containerClassName}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"
                >
                    {label}
                    {required && (
                        <span className="text-red-500 ml-0.5">*</span>
                    )}
                </label>
            )}

            <textarea
                id={id}
                rows={rows}
                className={`w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition resize-none placeholder-gray-300 ${className}`}
                {...props}
            />
        </div>
    );
}

export function Label({ children, required }) { return (<label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"> {children} {required && <span className="text-red-500 ml-0.5">*</span>} </label>); }