import { type RouteConfig, index, route } from "@react-router/dev/routes";

export const Endpoints = {
  REPOS: 'repos'
}

export default [
  index("routes/login.tsx"),
  route(Endpoints.REPOS, "routes/repos.tsx")
] satisfies RouteConfig;
