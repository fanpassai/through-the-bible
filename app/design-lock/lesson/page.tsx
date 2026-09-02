import type { Metadata } from "next";
import { StudyAccountProvider } from "@/app/study-account";
import LessonExperience from "./lesson-experience";

export const metadata: Metadata = {
  title: "Week 1 — Through the Bible",
  description: "See every subject and requirement in your Week 1 course journey.",
};

export default function LessonPage() {
  return <StudyAccountProvider><LessonExperience /></StudyAccountProvider>;
}
