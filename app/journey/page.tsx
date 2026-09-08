import type { Metadata } from "next";
import HomeExperience from "@/app/design-lock/home/home-experience";

export const metadata: Metadata = {
  title: "Your Journey — Through the Bible",
  description: "See your place in the complete ten-week journey and continue the exact next activity.",
};

export default function JourneyPage() {
  return <HomeExperience />;
}
