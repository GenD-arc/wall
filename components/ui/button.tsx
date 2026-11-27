import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// shadcn/ui Button, restyled with 2008 Facebook button chrome.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap font-bold cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-fb-blue/50 focus-visible:ring-offset-1 disabled:cursor-default",
  {
    variants: {
      variant: {
        default:
          "bg-fb-blue text-white border border-solid [border-color:#d9dfea_#0e1f5b_#0e1f5b_#d9dfea] active:bg-[#4f6aa3] disabled:bg-[#9aa9c8] disabled:[border-color:#c5cee0_#7d8db0_#7d8db0_#c5cee0]",
        secondary:
          "bg-[#f0f0f0] text-[#333] border border-solid [border-color:#e7e7e7_#666_#666_#e7e7e7] active:bg-[#e2e2e2]",
        link: "bg-transparent border-0 p-0 font-normal text-fb-blue hover:underline",
      },
      size: {
        default: "px-[6px] py-[2px] text-[11px] leading-[16px]",
        lg: "px-[10px] py-[4px] text-[13px]",
        none: "",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
