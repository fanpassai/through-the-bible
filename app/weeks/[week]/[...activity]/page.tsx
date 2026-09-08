import { notFound, redirect } from "next/navigation";
import { getActivityByHref } from "@/lib/course/manifest";
import ActivityLauncher from "./activity-launcher";

type ActivityPageProps = { params: Promise<{ week: string; activity: string[] }> };

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { week, activity: segments } = await params;
  const weekNumber = Number(week);
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 10) notFound();
  if (weekNumber !== 1) redirect(`/weeks/${weekNumber}`);
  const item = getActivityByHref(`/weeks/${week}/${segments.join("/")}`);
  if (!item) notFound();
  return <ActivityLauncher activity={item} />;
}
