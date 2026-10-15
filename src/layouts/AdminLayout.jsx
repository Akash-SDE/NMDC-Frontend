import { Outlet } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { isReadOnlyRole } from "../constants/roles";

export default function AdminLayout() {
  const { userRole } = useAuth();
  return (
    <Layout>
      <div data-readonly={isReadOnlyRole(userRole) || undefined} className="contents">
        <Outlet />
      </div>
    </Layout>
  );
}
