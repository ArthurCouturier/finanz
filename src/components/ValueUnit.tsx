import NumberFlow from "@number-flow/react";
import type { ComponentProps } from "react";

/**
 * Animated number kept centered in place, with its unit (€, %, ...) pinned
 * absolutely just to its right so it never shifts the digits off-center.
 */
export default function ValueUnit({
  value,
  unit,
  className,
  format,
}: {
  value: number;
  unit: string;
  className?: string;
  format?: ComponentProps<typeof NumberFlow>["format"];
}) {
  return (
    <span className="relative inline-flex justify-center">
      <NumberFlow value={value} format={format} className={className} />
      <span className="absolute left-full top-1/2 ml-1 -translate-y-1/2 whitespace-nowrap text-sm font-normal opacity-70">
        {unit}
      </span>
    </span>
  );
}
