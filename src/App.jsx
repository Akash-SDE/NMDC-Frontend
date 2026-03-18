import React from "react";
import { RouterProvider, useRouter } from "./context/RouterContext";
import Layout from "./components/layout/Layout";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import MasterDataPage from "./pages/admin/masterdata/MasterDataPage";

function AppRoutes() {
  const { currentRoute } = useRouter();

  // Auth pages — no sidebar/header layout
  if (currentRoute === "login") return <LoginPage />;
  if (currentRoute === "signup") return <SignupPage />;

  // Determine which page content to show
  const renderPage = () => {
    switch (currentRoute) {
      case "dashboard":
        return <Dashboard />;
      case "master-data":
      case "wagon-types":
      case "rail-sidings":
      case "ore-categories":
      case "customer-master":
      case "destinations":
      case "route-mapping":
      case "stockpile-logs":
      case "delay-categories":
        return <MasterDataPage />;
      default:
        return <Dashboard />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
}

export default function App() {
  return (
    <RouterProvider>
      <AppRoutes />
    </RouterProvider>
  );
}
