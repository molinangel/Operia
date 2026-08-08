import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Botones del sistema «parte de trabajo»: rectangulares, de un solo plano,
 * sin sombras difusas ni esquinas redondeadas. Se comportan como los sellos y
 * casillas de un formulario, no como burbujas de una app.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg hover:bg-accent-hover",
        secondary:
          "bg-fg text-bg hover:opacity-88",
        outline:
          "border border-fg bg-transparent text-fg hover:bg-fg hover:text-bg",
        ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
        danger: "bg-danger text-white hover:opacity-90",
        link: "text-accent underline underline-offset-4 decoration-1 hover:decoration-2",
      },
      size: {
        sm: "h-8 px-3 text-sm [&_svg]:size-4",
        md: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-[0.9375rem] [&_svg]:size-4",
        icon: "size-9 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
