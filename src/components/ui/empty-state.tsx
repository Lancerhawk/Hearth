import { EmptyHint } from "@/components/design/empty-hint";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return <EmptyHint title={title} description={description} />;
}
