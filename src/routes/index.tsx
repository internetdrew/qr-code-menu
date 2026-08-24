import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigate } from "react-router";
import { protectedLoader } from "@/loaders/protectedLoader";
import { NotFound } from "@/pages/NotFoundPage";

const emptyHydrateFallback = <></>;

const notFoundElement = (
  <NotFound
    title="Page Not Found"
    message="The page you're looking for does not exist."
    href="/"
    hrefText="Go back to Home"
  />
);

export const routes = [
  {
    path: "/login",
    hydrateFallbackElement: emptyHydrateFallback,
    element: <ProtectedRoute requireAuth={false} />,
    children: [
      {
        index: true,
        hydrateFallbackElement: emptyHydrateFallback,
        lazy: () =>
          import("@/pages/LoginPage").then((module) => ({
            Component: module.default,
          })),
      },
    ],
  },
  {
    loader: protectedLoader,
    hydrateFallbackElement: emptyHydrateFallback,
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        hydrateFallbackElement: emptyHydrateFallback,
        lazy: () =>
          import("@/pages/HomeRoute").then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: "preview",
        element: <Navigate to="/preview/store" replace />,
      },
      {
        path: "preview/store",
        hydrateFallbackElement: emptyHydrateFallback,
        lazy: () =>
          import("@/pages/StorePage").then((module) => ({
            Component: module.Store,
          })),
      },
      {
        path: "*",
        element: notFoundElement,
      },
    ],
  },
];
