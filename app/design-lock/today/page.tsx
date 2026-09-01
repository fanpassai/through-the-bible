import type { Metadata } from "next";
import TodayExperience from "./today-experience";

export const metadata: Metadata = {
  title: "Today — Through the Bible",
  description: "Continue the exact next step in your Through the Bible course.",
};

export default function TodayPage() {
  return <TodayExperience />;
}
