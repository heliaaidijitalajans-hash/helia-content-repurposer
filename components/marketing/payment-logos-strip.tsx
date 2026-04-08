const logoImgClass =
  "h-6 w-auto max-h-[24px] opacity-80 transition-opacity duration-200 hover:opacity-100";

const paymentLogos = [
  { src: "/payments/visa.svg", key: "visa" as const },
  { src: "/payments/mastercard.svg", key: "mastercard" as const },
  { src: "/payments/amex.svg", key: "amex" as const },
  { src: "/payments/discover.svg", key: "discover" as const },
];

type Props = {
  ariaLabel: string;
};

export function PaymentLogosStrip({ ariaLabel }: Props) {
  return (
    <ul
      className="mt-6 flex max-w-md flex-wrap items-center justify-center gap-4 sm:max-w-none"
      role="list"
      aria-label={ariaLabel}
    >
      {paymentLogos.map(({ src, key }) => (
        <li key={key} className="flex shrink-0 items-center">
          <img
            src={src}
            alt=""
            height={24}
            width={72}
            className={logoImgClass}
          />
        </li>
      ))}
    </ul>
  );
}
