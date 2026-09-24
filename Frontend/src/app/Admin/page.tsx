import { Suspense } from "react";
import AdminDashboard from "./dashboard";

export default function Page() {
  return (
    <Suspense>
      <AdminDashboard />
    </Suspense>
  );
}