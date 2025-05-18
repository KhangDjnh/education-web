import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Keep the original routes format for @react-router/dev
export default [
  index("routes/home.tsx"),
  route("/signin", "routes/signin.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/teacher", "routes/teacher.tsx"),
  route("/student", "routes/student.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/class/:id", "routes/class.tsx"),
  route("student/class/:id", "routes/student-class.tsx")
] satisfies RouteConfig; 