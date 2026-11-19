/** First tab stop on every logged-in page: jumps past the header to `<main id="main-content">`. */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only rounded-xsm bg-primary-800 px-4 py-3 font-heading text-typo-md font-medium text-white outline-none focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:outline-2 focus:outline-offset-2 focus:outline-secondary-700"
    >
      Skip to main content
    </a>
  );
}
