import type { Metadata } from "next";
import { StudyAccountProvider } from "@/app/study-account";
import TodayExperience from "./today-experience";

export const metadata: Metadata = {
  title: "Today — Through the Bible",
  description: "Continue the exact next step in your Through the Bible course.",
};

export default function TodayPage() {
  return <StudyAccountProvider><TodayExperience /></StudyAccountProvider>;
}
