import { AccountAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { MOCK_USER } from "@/lib/session/mock-user";

/**
 * Figma "Account Summary" — 40px avatar, name (Work Sans 20/28 semibold) and phone number
 * (Work Sans 14/20 medium). Used at the top of the account dropdown (246:1431, 12px padding)
 * and of the mobile menu (246:1512, lavender card).
 */
export function AccountSummary({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <AccountAvatar size="md" />
      <div className="flex flex-col gap-1 whitespace-nowrap">
        <p className="font-heading text-h6 font-semibold text-pneutral-900">{MOCK_USER.name}</p>
        <p className="font-heading text-typo-md font-medium text-pneutral-700">{MOCK_USER.phone}</p>
      </div>
    </div>
  );
}
