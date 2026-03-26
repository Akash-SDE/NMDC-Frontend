import { useRouter } from "../../../context/RouterContext";
import SidingMaster from "./SidingMaster";
import OreTypeMaster from "./OreTypeMaster";
import DestinationMaster from "./DestinationMaster";
import RouteMaster from "./RouteMaster";
import StockpileMaster from "./StockpileMaster";
import DelayCategoryMaster from "./DelayCategoryMaster";
import WagonTypeMaster from "./WagonTypeMaster";
import CustomerMaster from "./CustomerMaster";

export default function MasterDataPage() {
  const { currentRoute } = useRouter();

  const activeTab = currentRoute === "master-data" ? "rail-sidings" : currentRoute;

  function renderContent() {
    switch (activeTab) {
      case "master-data":
      case "rail-sidings":
      case "rail-sidings-add":
        return <SidingMaster />;
      case "wagon-types":
      case "wagon-types-add":
        return <WagonTypeMaster />;
      case "ore-categories":
      case "ore-categories-add":
        return <OreTypeMaster />;
      case "destinations":
      case "destinations-add":
        return <DestinationMaster />;
      case "route-mapping":
      case "route-mapping-add":
        return <RouteMaster />;
      case "stockpile-logs":
      case "stockpile-logs-add":
        return <StockpileMaster />;
      case "delay-categories":
      case "delay-categories-add":
        return <DelayCategoryMaster />;
      case "customer-master":
      case "customer-master-add":
        return <CustomerMaster />;
      default:
        return <SidingMaster />;
    }
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-10 3xl:px-14 3xl:py-10 5xl:px-20 5xl:py-14">
      {renderContent()}
    </div>
  );
}

