import { useMemo, useState } from "react";

const tabs = [
  { id: "offering", label: "Rake Offering Details" },
  { id: "offered", label: "Offered Rakes" },
  { id: "adjustment", label: "Adjustment Rakes" },
];

const wagonTypeOptions = ["BOXN", "BOXNHL", "BOBRN", "BCN"];
const sidingOptions = ["Siding-A", "Siding-B", "Siding-C", "Siding-D"];
const routeOptions = ["R-14", "R-22", "R-05", "R-09"];
const oreTypeOptions = ["LUMP", "FINES", "PELLET", "SINTER"];
const customerOptions = ["JSW Steel", "Tata Steel", "SAIL", "NMDC"];
const destinationOptions = ["Visakhapatnam", "Bhilai", "Raipur", "Nagpur"];
const adjustmentReasonOptions = [
  "Customer Priority",
  "Wagon Shortage",
  "Route Congestion",
  "Loading Delay",
];

const offeredRakes = [
  {
    sno: 1,
    rakeId: "RK-7729",
    rakeNumber: "R-2026-001",
    wagonSupply: 58,
    siding: "Siding-A",
    route: "R-14",
    oreTypeCustomer: "LUMP / JSW Steel",
    destination: "Visakhapatnam",
    fNote: "FN-23011",
    offerTime: "19/03/2026 09:59",
  },
  {
    sno: 2,
    rakeId: "RK-8812",
    rakeNumber: "R-2026-002",
    wagonSupply: 45,
    siding: "Siding-C",
    route: "R-09",
    oreTypeCustomer: "FINES / Tata Steel",
    destination: "Bhilai",
    fNote: "FN-23022",
    offerTime: "19/03/2026 10:17",
  },
  {
    sno: 3,
    rakeId: "RK-9003",
    rakeNumber: "R-2026-003",
    wagonSupply: 59,
    siding: "Siding-D",
    route: "R-05",
    oreTypeCustomer: "PELLET / SAIL",
    destination: "Raipur",
    fNote: "FN-23041",
    offerTime: "19/03/2026 10:33",
  },
];

const initialOfferingForm = {
  rakeId: "",
  rakeNumber: "",
  wagonType: "",
  noOfWagons: "",
  siding: "",
  route: "",
  oreType: "",
  fNote: "",
  customer: "",
  destination: "",
  placementTime: "",
  offerTime: "",
};

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export default function RakeManagementPage() {
  const [activeTab, setActiveTab] = useState("offering");
  const [offeringForm, setOfferingForm] = useState(initialOfferingForm);
  const [offerSearch, setOfferSearch] = useState("");
  const [adjustRakeNumber, setAdjustRakeNumber] = useState("");
  const [adjustOfferFor, setAdjustOfferFor] = useState("");
  const [adjustOfferTime, setAdjustOfferTime] = useState("");

  const inputClass =
    "h-8 w-full rounded border border-sky-200 bg-white px-2 text-[12px] text-slate-700 outline-none focus:border-blue-400";

  const selectedRake = useMemo(
    () => offeredRakes.find((row) => row.rakeNumber === adjustRakeNumber),
    [adjustRakeNumber],
  );

  const filteredRows = useMemo(() => {
    if (!offerSearch.trim()) return offeredRakes;

    const q = offerSearch.toLowerCase();
    return offeredRakes.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(q),
    );
  }, [offerSearch]);

  function updateOffering(field, value) {
    setOfferingForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleOfferingSubmit(event) {
    event.preventDefault();
  }

  function handleOfferingClear() {
    setOfferingForm(initialOfferingForm);
  }

  function renderOfferingTab() {
    return (
      <form onSubmit={handleOfferingSubmit} className="space-y-4">
        <h3 className="text-center text-[19px] font-extrabold text-[#0f4ea6]">Rake Offering Details</h3>

        <div className="rounded border border-sky-200 p-3">
          <p className="mb-2 text-[13px] font-bold text-slate-700">Rake Details</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Rake ID:">
              <input
                type="text"
                value={offeringForm.rakeId}
                onChange={(event) => updateOffering("rakeId", event.target.value)}
                className={inputClass}
                placeholder="Enter Rake ID"
              />
            </FormField>
            <FormField label="Rake Number:">
              <input
                type="text"
                value={offeringForm.rakeNumber}
                onChange={(event) => updateOffering("rakeNumber", event.target.value)}
                className={inputClass}
                placeholder="Enter Rake Number"
              />
            </FormField>
            <FormField label="Wagon Type:">
              <select
                value={offeringForm.wagonType}
                onChange={(event) => updateOffering("wagonType", event.target.value)}
                className={inputClass}
              >
                <option value="">--Select--</option>
                {wagonTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="No of Wagons:">
              <input
                type="number"
                value={offeringForm.noOfWagons}
                onChange={(event) => updateOffering("noOfWagons", event.target.value)}
                className={inputClass}
                placeholder="--Select--"
              />
            </FormField>
            <FormField label="Siding:">
              <select
                value={offeringForm.siding}
                onChange={(event) => updateOffering("siding", event.target.value)}
                className={inputClass}
              >
                <option value="">--Select--</option>
                {sidingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Route:">
              <select
                value={offeringForm.route}
                onChange={(event) => updateOffering("route", event.target.value)}
                className={inputClass}
              >
                <option value="">--Select--</option>
                {routeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Ore Type:">
              <select
                value={offeringForm.oreType}
                onChange={(event) => updateOffering("oreType", event.target.value)}
                className={inputClass}
              >
                <option value="">--Select--</option>
                {oreTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="F-Note:">
              <input
                type="text"
                value={offeringForm.fNote}
                onChange={(event) => updateOffering("fNote", event.target.value)}
                className={inputClass}
                placeholder="Enter F-Note"
              />
            </FormField>
            <FormField label="Customer:">
              <select
                value={offeringForm.customer}
                onChange={(event) => updateOffering("customer", event.target.value)}
                className={inputClass}
              >
                <option value="">--Select--</option>
                {customerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Destination:">
              <select
                value={offeringForm.destination}
                onChange={(event) => updateOffering("destination", event.target.value)}
                className={inputClass}
              >
                <option value="">--Select--</option>
                {destinationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Placement Time:">
              <input
                type="datetime-local"
                value={offeringForm.placementTime}
                onChange={(event) => updateOffering("placementTime", event.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Offer Time:">
              <input
                type="datetime-local"
                value={offeringForm.offerTime}
                onChange={(event) => updateOffering("offerTime", event.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-blue-700"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleOfferingClear}
            className="rounded bg-red-500 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      </form>
    );
  }

  function renderOfferedTab() {
    return (
      <div className="space-y-3">
        <h3 className="text-center text-[19px] font-extrabold text-[#0f4ea6]">Offered Rakes</h3>

        <div className="mx-auto max-w-sm">
          <input
            type="text"
            value={offerSearch}
            onChange={(event) => setOfferSearch(event.target.value)}
            className={inputClass}
            placeholder="Search rake details"
          />
        </div>

        <div className="overflow-x-auto rounded border border-sky-200 bg-white">
          <table className="w-full min-w-245">
            <thead>
              <tr className="bg-[#5f7f9f] text-white">
                {[
                  "SNo",
                  "Rake ID",
                  "Rack Number",
                  "Wagon Supply",
                  "Siding",
                  "Route",
                  "Ore Type / Customer",
                  "Destination",
                  "FNote",
                  "Offer Time",
                ].map((head) => (
                  <th
                    key={head}
                    className="border-r border-white/20 px-2 py-2 text-[11px] font-bold"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-3 py-6 text-center text-[12px] font-medium text-slate-500"
                  >
                    There isn&apos;t anything to display.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.rakeId} className="border-t border-slate-200 text-[12px] text-slate-700">
                    <td className="px-2 py-2 text-center">{row.sno}</td>
                    <td className="px-2 py-2 text-center">{row.rakeId}</td>
                    <td className="px-2 py-2 text-center">{row.rakeNumber}</td>
                    <td className="px-2 py-2 text-center">{row.wagonSupply}</td>
                    <td className="px-2 py-2 text-center">{row.siding}</td>
                    <td className="px-2 py-2 text-center">{row.route}</td>
                    <td className="px-2 py-2 text-center">{row.oreTypeCustomer}</td>
                    <td className="px-2 py-2 text-center">{row.destination}</td>
                    <td className="px-2 py-2 text-center">{row.fNote}</td>
                    <td className="px-2 py-2 text-center">{row.offerTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderAdjustmentTab() {
    return (
      <div className="space-y-4">
        <h3 className="text-center text-[19px] font-extrabold text-[#0f4ea6]">Adjustment Rakes</h3>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <select
            value={adjustRakeNumber}
            onChange={(event) => setAdjustRakeNumber(event.target.value)}
            className={`${inputClass} max-w-xs`}
          >
            <option value="">--Select--</option>
            {offeredRakes.map((row) => (
              <option key={row.rakeNumber} value={row.rakeNumber}>
                {row.rakeNumber}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        <div className="rounded border border-sky-200 p-3">
          <p className="mb-2 text-[13px] font-bold text-slate-700">Rake Details</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Rake No:">
              <input value={selectedRake?.rakeNumber || ""} readOnly className={inputClass} />
            </FormField>
            <FormField label="Wagon:">
              <input value={selectedRake?.wagonSupply || ""} readOnly className={inputClass} />
            </FormField>
            <FormField label="Customer:">
              <input
                value={selectedRake?.oreTypeCustomer?.split("/")[1]?.trim() || ""}
                readOnly
                className={inputClass}
              />
            </FormField>
            <FormField label="F-Note:">
              <input value={selectedRake?.fNote || ""} readOnly className={inputClass} />
            </FormField>
          </div>
        </div>

        <div className="rounded border border-sky-200 p-3">
          <p className="mb-2 text-[13px] font-bold text-slate-700">Adjustment Details</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
            <FormField label="Offer For:">
              <select
                value={adjustOfferFor}
                onChange={(event) => setAdjustOfferFor(event.target.value)}
                className={inputClass}
              >
                <option value="">--Select--</option>
                {adjustmentReasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Offer Time:">
              <input
                type="datetime-local"
                value={adjustOfferTime}
                onChange={(event) => setAdjustOfferTime(event.target.value)}
                className={inputClass}
              />
            </FormField>
            <div className="self-end">
              <button
                type="button"
                className="rounded bg-blue-600 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[#f9fafb] px-2 sm:px-4">
        <div className="flex flex-wrap gap-1 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded px-3 py-1.5 text-[12px] font-bold transition-colors ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-sky-100 p-4 sm:p-5 lg:p-6">
        {activeTab === "offering" ? renderOfferingTab() : null}
        {activeTab === "offered" ? renderOfferedTab() : null}
        {activeTab === "adjustment" ? renderAdjustmentTab() : null}
      </div>
    </div>
  );
}
