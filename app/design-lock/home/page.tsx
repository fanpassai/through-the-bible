import type { Metadata } from "next";
import HomeExperience from "./home-experience";

export const metadata: Metadata = {
  title: "Home — Through the Bible",
  description: "Continue your personal Through the Bible study journey.",
};

export default function HomePage() {
  return <HomeExperience />;
}
