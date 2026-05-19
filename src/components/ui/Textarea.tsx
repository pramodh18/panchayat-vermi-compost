import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-base font-semibold text-earth-800">
          {label}
          {props.required && <span className="text-red-600"> *</span>}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={[
            "w-full min-h-28 rounded-xl border-2 bg-white px-4 py-3 text-lg resize-y",
            "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500",
            error ? "border-red-500" : "border-gray-200",
            className,
          ].join(" ")}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
