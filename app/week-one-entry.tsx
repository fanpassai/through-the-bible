"use client";

import { useRouter } from "next/navigation";
import WeekOne from "./week-one";

export default function WeekOneEntry({ initialOpenStudy = false }: { initialOpenStudy?: boolean }) {
  const router = useRouter();

  return <WeekOne onCourseHome={() => router.push("/design-lock/lesson")} initialOpenStudy={initialOpenStudy} />;
}
