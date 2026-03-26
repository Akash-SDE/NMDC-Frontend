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
        return <SidingMaster />;
      case "wagon-types":
        return <WagonTypeMaster />;
      case "ore-categories":
        return <OreTypeMaster />;
      case "destinations":
        return <DestinationMaster />;
      case "route-mapping":
        return <RouteMaster />;
      case "stockpile-logs":
        return <StockpileMaster />;
      case "delay-categories":
        return <DelayCategoryMaster />;
      case "customer-master":
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

