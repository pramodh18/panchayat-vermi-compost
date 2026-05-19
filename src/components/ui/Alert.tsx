type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
}

const styles: Record<AlertVariant, string> = {
  error: "bg-red-50 border-red-200 text-red-800",
  success: "bg-primary-50 border-primary-200 text-primary-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export function Alert({ variant = "info", title, children }: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-xl border-2 p-4 text-base ${styles[variant]}`}
    >
      {title && <p className="mb-1 font-bold">{title}</p>}
      <div>{children}</div>
    </div>
  );
}
