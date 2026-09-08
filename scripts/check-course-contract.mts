import { assertCourseContract } from "../lib/course/contract.ts";

const result = assertCourseContract();
console.log(`Course contract passed: ${result.weeks} weeks, ${result.activities} activities, ${result.routes} permanent routes.`);
