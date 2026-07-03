interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "orange" | "outline";
}

const variantClasses = {
  default: "bg-te-gray text-te-dark",
  orange: "bg-te-orange text-white",
  outline: "border border-te-dark text-te-dark",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium rounded-full
        ${variantClasses[variant]}
      `}
    >
      {children}
    </span>
  );
}
