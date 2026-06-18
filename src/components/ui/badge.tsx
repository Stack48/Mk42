// BADGE — composant shadcn/ui adapté aux couleurs OPUS
//
// class-variance-authority (cva) = système de variantes pour Tailwind.
// Au lieu d'écrire des ternaires partout, on déclare les variantes une fois :
//   cva("base", { variants: { color: { blue: "...", red: "..." } } })
// Puis on appelle badge({ color: "blue" }) → retourne les bonnes classes.
// Même principe que les "variants" dans styled-components ou les modificateurs BEM.

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Classes de base communes à toutes les variantes
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-[#4F6EF7] text-white",
        secondary:   "bg-[#F3F4F6] text-[#6B7280]",
        destructive: "bg-[#FEE2E2] text-[#DC2626]",
        outline:     "border border-[#E5E7EB] text-[#6B7280]",
        success:     "bg-[#D1FAE5] text-[#059669]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// VariantProps<typeof badgeVariants> = TypeScript infère automatiquement
// le type { variant?: "default" | "secondary" | ... } depuis la config cva.
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
