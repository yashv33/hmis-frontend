"use client";

import { DetailRows } from "@/components/flow/detail-rows";
import { FlowActions } from "@/components/flow/flow-actions";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { resetFlow, useDisplayMobile } from "@/lib/forgot-password/flow-store";

/**
 * Screen D — "R-01.01D Password Reset Successfully": the account summary and the
 * way back to /login (which also clears the flow state).
 */
export function ResetSuccess() {
  const displayMobile = useDisplayMobile();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-h6 font-semibold text-pneutral-900">Account</h2>
        <DetailRows
          rows={[
            { label: "Mobile Number", value: displayMobile },
            { label: "Password", value: "Updated just now" },
          ]}
        />
      </section>

      <p className="font-paragraph text-typo-md text-pneutral-700">
        For your security, you&apos;ve been logged out of other devices.
      </p>

      <FlowActions single>
        <Button
          href="/login"
          size="lg"
          shape="responsive"
          className="w-full lg:w-auto"
          onClick={resetFlow}
          iconRight={
            <>
              {/* Figma: 24px arrow on mobile, 20px on desktop. */}
              <Icon name="arrow-right-outline-lg" className="lg:hidden" />
              <Icon name="arrow-right-outline" className="hidden lg:block" />
            </>
          }
        >
          Back to Login
        </Button>
      </FlowActions>
    </div>
  );
}
