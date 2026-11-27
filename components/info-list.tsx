import { profile } from "@/lib/profile";

export function InfoList() {
  return (
    <dl className="px-[8px] py-[8px]">
      <dt className="font-bold text-fb-gray">Networks:</dt>
      <dd className="mb-[8px]">
        <span className="text-fb-blue">{profile.network}</span>
      </dd>
      <dt className="font-bold text-fb-gray">Current City:</dt>
      <dd>
        <span className="text-fb-blue">{profile.currentCity}</span>
      </dd>
    </dl>
  );
}
