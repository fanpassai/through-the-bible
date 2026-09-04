import type { Metadata } from "next";
import { StudyAccountProvider } from "@/app/study-account";
import ReaderExperience from "./reader-experience";

export const metadata: Metadata = {
  title: "Scripture Reader — Through the Bible",
  description: "Read, mark and keep the Scripture connected to your Through the Bible course.",
};

export default async function ReaderPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const params = await searchParams;
  return (
    <StudyAccountProvider>
      <ReaderExperience initialReference={params.reference} />
    </StudyAccountProvider>
  );
}
