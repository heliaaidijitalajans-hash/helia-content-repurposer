import { AccountView } from "@/components/account/account-view";
import {
  getAccountPageCopy,
  getStandaloneLocale,
} from "@/lib/account/load-copy";

export default async function AccountPage() {
  const [copy, locale] = await Promise.all([
    getAccountPageCopy(),
    getStandaloneLocale(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <AccountView
        copy={copy}
        upgradeHref={`/${locale}/pricing`}
        authHref={`/${locale}/auth`}
      />
    </div>
  );
}
