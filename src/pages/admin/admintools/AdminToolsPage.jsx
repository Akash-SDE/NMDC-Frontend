import { useRouter } from "../../../context/RouterContext";
import DeleteOfferedRakesPage from "./DeleteOfferedRakesPage";
import EditRakeTimingPage from "./EditRakeTimingPage";

export default function AdminToolsPage() {
  const { currentRoute } = useRouter();

  if (currentRoute === "admin-edit-rake-timing") {
    return <EditRakeTimingPage />;
  }

  return <DeleteOfferedRakesPage />;
}
