"use client";

import { useState } from "react";
import Image from "next/image";
import { profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/top-bar";
import { Box } from "@/components/box";
import { InfoList } from "@/components/info-list";
import { Wall } from "@/components/wall";

type Tab = "wall" | "info";

export function ProfilePage() {
  const [tab, setTab] = useState<Tab>("wall");

  return (
    <>
      <TopBar />
      <div className="mx-auto flex max-w-[820px] gap-[20px] px-[10px] pt-[14px] pb-[24px]">
        {/* Left column (desktop) */}
        <aside className="hidden w-[200px] shrink-0 sm:block">
          <Image
            src={profile.photo}
            alt={profile.name}
            width={200}
            height={200}
            priority
            className="mb-[14px] block h-[200px] w-[200px] object-cover"
          />
          <Box title="Information">
            <InfoList />
          </Box>
        </aside>

        {/* Main column */}
        <main className="min-w-0 flex-1">
          <div className="mb-[12px] flex items-center gap-[10px]">
            <Image
              src={profile.photo}
              alt=""
              width={64}
              height={64}
              priority
              className="h-[64px] w-[64px] object-cover sm:hidden"
            />
            <div>
              <h1 className="text-[18px] font-bold leading-tight text-[#333] sm:text-[16px]">
                {profile.name}
              </h1>
              <p className="text-fb-gray">{profile.network}</p>
            </div>
          </div>

          <div role="tablist" className="mb-[12px] flex gap-[2px] border-b border-[#898989] pl-[8px]">
            {(["wall", "info"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "-mb-px cursor-pointer border border-b-0 px-[10px] py-[4px] font-bold outline-none focus-visible:underline",
                  tab === t
                    ? "border-[#898989] bg-white text-[#333]"
                    : "border-transparent bg-fb-light text-fb-blue hover:bg-fb-mid hover:text-white"
                )}
              >
                {t === "wall" ? "Wall" : "Info"}
              </button>
            ))}
          </div>

          {/* Keep the wall mounted so the live feed keeps listening. */}
          <div hidden={tab !== "wall"}>
            <Wall />
          </div>
          <div hidden={tab !== "info"}>
            <Box title="Basic Information">
              <dl className="px-[8px] pt-[8px]">
                <dt className="font-bold text-fb-gray">Name:</dt>
                <dd className="mb-[8px]">{profile.name}</dd>
              </dl>
              <InfoList />
            </Box>
          </div>
        </main>
      </div>

      <footer className="mx-auto max-w-[820px] px-[10px] pb-[20px]">
        <p className="border-t border-fb-line pt-[8px] text-fb-gray">
          wall &copy; {new Date().getFullYear()}. Built with Next.js, Supabase and Tailwind CSS.
        </p>
      </footer>
    </>
  );
}
