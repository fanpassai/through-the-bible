import EntryExperience from "./design-lock/entry/entry-experience";
import WeekOneEntry from "./week-one-entry";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const resume = Array.isArray(params.resume) ? params.resume[0] : params.resume;
  const study = Array.isArray(params.study) ? params.study[0] : params.study;

  if (resume === "week1") {
    return <WeekOneEntry initialOpenStudy={study === "open"} />;
  }

  return <EntryExperience />;
}
