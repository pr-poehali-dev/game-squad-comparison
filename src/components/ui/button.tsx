import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wider uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary/90 to-amber-600 text-primary-foreground border border-primary/50 hover:from-primary hover:to-amber-500 hover:shadow-[0_0_18px_hsl(42_90%_52%/0.35)] active:scale-[0.97]",
        destructive:
          "bg-destructive/90 text-destructive-foreground border border-destructive/40 hover:bg-destructive hover:shadow-[0_0_14px_hsl(0_70%_48%/0.3)]",
        outline:
          "border border-primary/30 bg-transparent text-foreground hover:border-primary/60 hover:bg-primary/8 hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/70",
        ghost:
          "hover:bg-primary/8 hover:text-primary border border-transparent hover:border-primary/20",
        link: "text-primary underline-offset-4 hover:underline border-0 p-0 h-auto normal-case tracking-normal font-normal",
      },
      size: {
        default: "h-9 px-5 py-2 rounded-sm",
        sm: "h-7 px-3 text-xs rounded-sm",
        lg: "h-11 px-8 rounded-sm text-base",
        icon: "h-9 w-9 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }