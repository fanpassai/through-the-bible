import type { Metadata } from "next";
import EntryExperience from "./entry-experience";

export const metadata: Metadata = {
  title: "Enter — Through the Bible",
  description: "Begin your personal Through the Bible study journey.",
};

export default function EntryPage() {
  return <EntryExperience />;
}
