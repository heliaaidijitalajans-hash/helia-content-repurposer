import { SupportCenter } from "@/components/support/support-center";
import { getSupportPageCopy } from "@/lib/support/load-copy";

export default async function SupportPage() {
  const copy = await getSupportPageCopy();

  return (
    <div className="notranslate bg-transparent text-slate-900">
      <SupportCenter copy={copy} />
    </div>
  );
}
