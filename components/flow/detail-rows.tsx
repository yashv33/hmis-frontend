/**
 * "Rows" — label/value pairs separated by hairlines (Figma "Row - Mobile Number",
 * "Row - Password"). Label column is 130px on mobile and 220px on desktop.
 */
export function DetailRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="flex flex-col font-heading text-typo-md font-medium">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex items-center gap-4 border-t border-pneutral-200 py-3 last:border-b"
        >
          <dt className="w-[130px] shrink-0 text-pneutral-700 lg:w-[220px]">{label}</dt>
          <dd className="min-w-0 flex-1 text-right text-pneutral-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
