import type { Metadata } from "next";
import { StudyAccountProvider } from "@/app/study-account";
import ProfileExperience from "./profile-experience";

export const metadata: Metadata = {
  title: "Profile — Through the Bible",
  description: "Your study progress, saved work and account connection.",
};

export default function ProfilePage() {
  return <StudyAccountProvider><ProfileExperience /></StudyAccountProvider>;
}
