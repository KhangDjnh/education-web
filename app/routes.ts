import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Keep the original routes for now - we'll use the protected route approach in a different way
export default [
  index("routes/home.tsx"),
  route("/signin", "routes/signin.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/teacher", "routes/teacher.tsx"),
  route("/student", "routes/student.tsx"),
  route("/profile", "routes/profile.tsx")
] satisfies RouteConfig;
