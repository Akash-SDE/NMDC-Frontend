import { Outlet } from "react-router-dom";
import Layout from "../components/layout/Layout";

export default function AdminLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
