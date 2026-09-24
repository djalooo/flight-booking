import { Suspense } from "react";
import { ThankYouClient } from "./thanks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking confirmed · Skyfare",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-faint">
      <main className="page-gutter mx-auto max-w-[840px] py-10">
        <Suspense
          fallback={
            <div className="rounded-card-lg bg-white p-12 text-center text-body text-foggy">
              Loading your booking…
            </div>
          }
        >
          <ThankYouClient />
        </Suspense>
      </main>
    </div>
  );
}
