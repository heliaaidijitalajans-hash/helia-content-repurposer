import { MarketingNavbar } from "@/components/marketing-navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MarketingNavbar />
      {children}
    </>
  );
}
