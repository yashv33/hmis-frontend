import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/flow/page-header";
import { NAV_ITEMS } from "@/lib/navigation/menu";

/** Title for a menu item's page, read from the menu config. */
export const placeholderTitle = (id: string) =>
  NAV_ITEMS.find((item) => item.id === id)?.label ?? id;

/**
 * Stand-in for a menu destination that has no design yet. It reuses the lavender page
 * header from the forgot-password screens so the layout, header and menus can be exercised.
 */
export function PlaceholderPage({ id }: { id: string }) {
  const title = placeholderTitle(id);
  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
      <PageHeader title={title} description="This page isn't designed yet." />
      <div className="flex-1" />
    </>
  );
}
