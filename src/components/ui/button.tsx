import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        primary:
          "bg-primary text-background font-semibold rounded-md hover:bg-primary-hover hover:shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_35%,transparent)] active:scale-[0.98]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted hover:border-accent/40",
        outlineOrange:
          "border border-primary bg-transparent text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(255,153,0,0.25)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-[52px] rounded-md px-7 text-base",
        icon: "h-10 w-10",
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
  withArrow?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withArrow = false, children, ...props }, ref) => {
    const arrowIcon = withArrow ? (
      <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
    ) : null

    if (asChild) {
      if (React.isValidElement(children)) {
        const childElement = children as React.ReactElement<{ children?: React.ReactNode; className?: string }>
        const combinedChildren = (
          <>
            {childElement.props.children}
            {arrowIcon}
          </>
        )
        return (
          <Slot
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
          >
            {React.cloneElement(childElement, {}, combinedChildren)}
          </Slot>
        )
      }
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
        {arrowIcon}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
