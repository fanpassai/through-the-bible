import CourseExperience from "./course-experience";
import { StudyAccountProvider } from "./study-account";

export default function Home() {
  return <StudyAccountProvider><CourseExperience /></StudyAccountProvider>;
}
