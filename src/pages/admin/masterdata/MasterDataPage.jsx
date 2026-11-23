import { useRouter } from "../../../context/RouterContext";
import SidingMaster from "./SidingMaster";
import OreTypeMaster from "./OreTypeMaster";
import DestinationMaster from "./DestinationMaster";
import RouteMaster from "./RouteMaster";
import StockpileMaster from "./StockpileMaster";
import DelayCategoryMaster from "./DelayCategoryMaster";
import WagonTypeMaster from "./WagonTypeMaster";
import CustomerMaster from "./CustomerMaster";
import PageFrame from "../../../components/layout/PageFrame";

export default function MasterDataPage() {
  const { currentRoute } = useRouter();

  const activeTab = currentRoute === "master-data" ? "rail-sidings" : currentRoute;

  function renderContent() {
    switch (activeTab) {
      case "master-data":
      case "rail-sidings":
      case "rail-sidings-add":
      case "rail-sidings-edit":
        return <SidingMaster />;
      case "wagon-types":
      case "wagon-types-add":
      case "wagon-types-edit":
        return <WagonTypeMaster />;
      case "ore-categories":
      case "ore-categories-add":
      case "ore-categories-edit":
        return <OreTypeMaster />;
      case "destinations":
      case "destinations-add":
      case "destinations-edit":
        return <DestinationMaster />;
      case "route-mapping":
      case "route-mapping-add":
      case "route-mapping-edit":
        return <RouteMaster />;
      case "stockpile-logs":
      case "stockpile-logs-add":
      case "stockpile-logs-edit":
        return <StockpileMaster />;
      case "delay-categories":
      case "delay-categories-add":
      case "delay-categories-edit":
        return <DelayCategoryMaster />;
      case "customer-master":
      case "customer-master-add":
      case "customer-master-edit":
        return <CustomerMaster />;
      default:
        return <SidingMaster />;
    }
  }

  return (
    <PageFrame className="animate-fadeIn">
      <div className="flex min-h-0 flex-1 flex-col">{renderContent()}</div>
    </PageFrame>
  );
}

