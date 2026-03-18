import { useState, useEffect } from "react";
import { useRouter } from "../../../context/RouterContext";
import MasterDataTabs from "./MasterDataTabs";
import SidingMaster from "./SidingMaster";
import OreTypeMaster from "./OreTypeMaster";
import DestinationMaster from "./DestinationMaster";
import RouteMaster from "./RouteMaster";
import StockpileMaster from "./StockpileMaster";
import DelayCategoryMaster from "./DelayCategoryMaster";
import WagonTypeMaster from "./WagonTypeMaster";
import CustomerMaster from "./CustomerMaster";

const tabMap = {
  "master-data": "rail-sidings",
  "wagon-types": "wagon-types",
  "rail-sidings": "rail-sidings",
  "ore-categories": "ore-categories",
  "customer-master": "customer-master",
  destinations: "destinations",
  "route-mapping": "route-mapping",
  "stockpile-logs": "stockpile-logs",
  "delay-categories": "delay-categories",
};

export default function MasterDataPage() {
  const { currentRoute, navigate } = useRouter();
  const [activeTab, setActiveTab] = useState(
    tabMap[currentRoute] || "rail-sidings",
  );

  useEffect(() => {
    const mapped = tabMap[currentRoute];
    if (mapped) setActiveTab(mapped);
  }, [currentRoute]);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    navigate(tabId);
  }

  function renderContent() {
    switch (activeTab) {
      case "rail-sidings":
        return <SidingMaster />;
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
      case "wagon-types":
        return <WagonTypeMaster />;
      case "customer-master":
        return <CustomerMaster />;
      default:
        return <SidingMaster />;
    }
  }

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 xl:px-10 3xl:px-14 3xl:py-10 5xl:px-20 5xl:py-14">
      {/* Tabs navigation */}
      <MasterDataTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab content */}
      <div className="mt-6 3xl:mt-8 5xl:mt-12">{renderContent()}</div>
    </div>
  );
}
