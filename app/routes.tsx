import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Keep the original routes format for @react-router/dev
export default [
  index("routes/home.tsx"),
  route("/signin", "routes/signin.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/teacher", "routes/teacher.tsx"),
  route("/student", "routes/student.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/class/:classId", "routes/class.tsx"),
  route("student/class/:classId", "routes/student-class.tsx"),
  route("/exam/:examId", "routes/exam-taking.tsx"),
  route("/exam-result/:submissionId", "routes/exam-result.tsx"),
  route("/assignments/:assignmentId/grade", "routes/AssignmentGradingPage.tsx"),
] satisfies RouteConfig; 