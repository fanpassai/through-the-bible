import ProductExperience from "./product-experience";
import { StudyAccountProvider } from "./study-account";

export default function Home() {
  return <StudyAccountProvider><ProductExperience /></StudyAccountProvider>;
}
