import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

export function AfterUpcoming({
  currency,
  remaining,
  stillAhead,
  expectedIn,
  projectedRemaining,
  moneyInLabel,
  billsHref,
}: {
  currency: string;
  remaining: number;
  /** Pending bills due now + future-dated outflows */
  stillAhead: number;
  /** Same-month funds dated after today */
  expectedIn: number;
  projectedRemaining: number;
  moneyInLabel: string;
  billsHref: string;
}) {
  const rows = [
    { label: "Remaining now", value: remaining, emphasize: false },
    ...(expectedIn > 0
      ? [
          {
            label: `Expected ${moneyInLabel.toLowerCase()}`,
            value: expectedIn,
            emphasize: false,
          },
        ]
      : []),
    { label: "Still ahead", value: stillAhead, emphasize: false },
    {
      label: "Left when it clears",
      value: projectedRemaining,
      emphasize: true,
    },
  ];

  return (
    <div>
      <h2 className="font-heading text-xl tracking-tight text-hearth-ink">
        After upcoming
      </h2>
      <p className="mt-1 text-xs text-hearth-ink/50">
        Remaining after expected {moneyInLabel.toLowerCase()} lands and
        scheduled spend clears.
      </p>

      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="text-hearth-ink/65">{row.label}</span>
            <span
              className={cn(
                "shrink-0 font-heading tabular-money",
                row.emphasize ? "text-hearth-moss" : "text-hearth-ink",
              )}
            >
              {formatCurrency(row.value, currency)}
            </span>
          </li>
        ))}
      </ul>

      {stillAhead <= 0 && expectedIn <= 0 ? (
        <p className="mt-4 text-sm text-hearth-ink/55">
          Nothing scheduled ahead — remaining stays as is.
        </p>
      ) : null}

      <Link
        href={billsHref}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "mt-5",
        )}
      >
        Manage bills
      </Link>
    </div>
  );
}
