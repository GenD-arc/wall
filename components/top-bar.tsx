import { profile } from "@/lib/profile";

export function TopBar() {
  return (
    <header className="bg-fb-blue">
      <div className="mx-auto flex h-[40px] max-w-[820px] items-center justify-between px-[10px]">
        <a
          href="/"
          className="text-[22px] font-bold tracking-[-1px] text-white hover:no-underline"
          aria-label="wall home"
        >
          wall
        </a>
        <nav className="flex items-center gap-[14px] text-[11px] font-bold">
          <a href="/" className="text-white">
            {profile.name}
          </a>
        </nav>
      </div>
    </header>
  );
}
