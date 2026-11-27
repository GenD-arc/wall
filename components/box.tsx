import { cn } from "@/lib/utils";

// The 2008 profile box: pale-blue title bar with a dark-blue top rule.
export function Box({
  title,
  aside,
  children,
  className,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-[14px]", className)}>
      <h2 className="flex items-baseline justify-between border-t border-fb-blue bg-fb-light px-[8px] py-[3px] font-bold text-fb-blue">
        <span>{title}</span>
        {aside ? <span className="font-normal text-[#666]">{aside}</span> : null}
      </h2>
      {children}
    </section>
  );
}

export function ErrorBox({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div role="alert" className="my-[8px] border border-[#dd3c10] bg-[#ffebe8] px-[10px] py-[7px]">
      <p className="font-bold">{title}</p>
      {children ? <div className="mt-[2px]">{children}</div> : null}
    </div>
  );
}
