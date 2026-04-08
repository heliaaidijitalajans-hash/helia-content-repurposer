import { redirect } from "next/navigation";

export default function LegacyDashboardContentPage() {
  redirect("/generate");
}
