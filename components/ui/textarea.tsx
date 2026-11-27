import * as React from "react";
import { cn } from "@/lib/utils";

// shadcn/ui Textarea, restyled as the 2008 Facebook input box.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "block w-full resize-none border border-solid border-[#bdc7d8] bg-white px-[3px] py-[3px] text-[16px] sm:text-[11px] text-[#333] leading-[1.35] placeholder:text-[#777] outline-none focus:border-fb-blue disabled:bg-[#f7f7f7]",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
