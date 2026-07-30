const STATUS_STYLES: Record<string, string> = {
  pending: "bg-brass/15 text-brass",
  accepted: "bg-denim/15 text-denim",
  rejected: "bg-thread/15 text-thread",
  measurement: "bg-denim/15 text-denim",
  cutting: "bg-denim/15 text-denim",
  stitching: "bg-denim/15 text-denim",
  ironing: "bg-denim/15 text-denim",
  ready: "bg-brass/15 text-brass",
  delivered: "bg-green-700/15 text-green-700",
  cancelled: "bg-ink/10 text-ink/50",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[status] || "bg-ink/10 text-ink/60"}`}>
      {status}
    </span>
  );
}
