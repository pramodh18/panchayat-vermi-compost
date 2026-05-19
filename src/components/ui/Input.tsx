import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-base font-semibold text-earth-800">
          {label}
          {props.required && <span className="text-red-600"> *</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full min-h-12 rounded-xl border-2 bg-white px-4 py-3 text-lg",
            "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500",
            error ? "border-red-500" : "border-gray-200",
            className,
          ].join(" ")}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-gray-600">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
