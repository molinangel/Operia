import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Botones: un primario sólido, un secundario de contorno y poco más. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[0.875rem] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /**
         * Blanco sobre oscuro (y al revés en modo claro). El botón principal
         * de color es lo que hace que una landing se vea armada con plantilla;
         * el contraste puro se ve más caro y deja el acento libre para los
         * estados, que es donde de verdad sirve.
         */
        primary: "bg-fg text-bg hover:opacity-90",
        accent: "bg-accent text-accent-fg hover:bg-accent-hover",
        secondary:
          "bg-fg text-bg hover:opacity-90",
        outline:
          "border border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-2",
        ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
        danger: "bg-danger text-white hover:opacity-90",
        link: "text-accent underline underline-offset-4 decoration-1 hover:decoration-2",
      },
      size: {
        sm: "h-8 px-3 text-[0.8125rem] [&_svg]:size-3.5",
        md: "h-9 px-3.5 [&_svg]:size-4",
        lg: "h-11 px-5 [&_svg]:size-4",
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
