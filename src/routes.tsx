import { Navigate, Outlet } from "react-router";
import Login from "./routes/Login";
import { Menu } from "./routes/Menu";
import ProtectedRoute from "./components/ProtectedRoute";
import { MenuProvider } from "./contexts/ActiveMenuContext";
import App from "./App";
import { HomePage } from "./routes/HomePage";
import { CategoriesPage } from "./routes/CategoriesPage";
import { CategoryItemsPage } from "./routes/CategoryItemsPage";
import { SettingsPage } from "./routes/SettingsPage";
import { NotFound } from "./routes/NotFound";

export const routes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/preview/menu",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/preview/menu/:menuId",
    element: <Menu isPreview={true} />,
  },
  {
    path: "/menu/:menuId",
    element: <Menu />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MenuProvider>
          <App />
        </MenuProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "categories",
            element: <Outlet />,
            children: [
              {
                index: true,
                element: <CategoriesPage />,
              },
              {
                path: ":categoryId",
                element: <CategoryItemsPage />,
              },
            ],
          },
          {
            path: "settings",
            element: <Outlet />,
            children: [
              {
                index: true,
                element: <Navigate to="general" replace />,
              },
              {
                path: "general",
                element: <SettingsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <NotFound
        title="Page Not Found"
        message="The page you're looking for does not exist."
        href="/"
        hrefText="Go back to Home"
      />
    ),
  },
];
