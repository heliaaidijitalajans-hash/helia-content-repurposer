import { getMessages } from "next-intl/server";
import { SupportCenter } from "@/components/support/support-center";

export default async function MarketingSupportPage() {
  const messages = await getMessages();
  const copy = messages.supportPage;

  return (
    <div className="notranslate min-h-screen bg-transparent text-slate-900">
      <SupportCenter copy={copy} />
    </div>
  );
}
