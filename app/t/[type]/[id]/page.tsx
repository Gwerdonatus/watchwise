import { redirect, notFound } from "next/navigation";

export default async function LegacyTitlePage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;

  if (type === "movie") redirect(`/m/${id}`);
  if (type === "tv") redirect(`/tv/${id}`);

  notFound();
}
