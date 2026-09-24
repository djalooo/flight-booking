import { Suspense } from "react";
import { BookPageClient } from "./book";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Confirm and book · Skyfare",
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-faint">
      <main>
        <Suspense
          fallback={
            <div className="page-gutter mx-auto max-w-[1440px] py-20 text-body text-foggy">
              Loading booking details…
            </div>
          }
        >
          <BookPageClient />
        </Suspense>
      </main>
    </div>
  );
}
