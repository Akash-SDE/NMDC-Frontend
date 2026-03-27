import { useMemo, useState } from "react";
import { PlusIcon } from "../../../components/icons";
import SearchBar from "../../../components/shared/SearchBar";
import { SortHeaderButton } from "../../../components/shared/TableSortHeader";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import {
  UniformFormField,
  UniformSectionCard,
  uniformInputClass,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import { useRouter } from "../../../context/RouterContext";

const customerOptions = [
  "Vaswani Industries",
  "Rashtriya Ispat Nigam Ltd",
  "ArcelorMittal Nippon Steel India Ltd",
  "JSW Steel Ltd",
  "Gauri Ganesh Ispat Pvt Ltd",
];

const destinationOptions = ["JCB", "VSPS", "VPTG", "BDXK", "RPR"];
const oreTypeOptions = ["CLO", "F", "L"];
const salesTypeOptions = ["LTA", "AUCTION"];

const initialDemands = [
  {
    id: 1,
    fNote: "10",
    date: "2025-04-01",
    customer: "Vaswani Industries",
    destination: "JCB",
    oreType: "CLO",
    salesType: "LTA",
  },
  {
    id: 2,
    fNote: "1002",
    date: "2026-01-12",
    customer: "Rashtriya Ispat Nigam Ltd",
    destination: "VSPS",
    oreType: "F",
    salesType: "LTA",
  },
  {
    id: 3,
    fNote: "1003",
    date: "2026-01-12",
    customer: "Rashtriya Ispat Nigam Ltd",
    destination: "VSPS",
    oreType: "F",
    salesType: "LTA",
  },
  {
    id: 4,
    fNote: "1004",
    date: "2026-01-12",
    customer: "Rashtriya Ispat Nigam Ltd",
    destination: "VSPS",
    oreType: "F",
    salesType: "LTA",
  },
  {
    id: 5,
    fNote: "1006",
    date: "2026-01-12",
    customer: "Rashtriya Ispat Nigam Ltd",
    destination: "VSPS",
    oreType: "L",
    salesType: "LTA",
  },
];

const initialPermitRows = [
  {
    id: 1,
    rackNumber: "NK 04",
    customer: "NMDC Steel Limited",
    stockpile: "DSFINE",
    quantity: 3363.71,
    completedOn: "2026-03-03 23:15",
    ePermitNumber: "EPM-240301",
    railwayTransitPass: "RTP-90301",
  },
  {
    id: 2,
    rackNumber: "CK 04",
    customer: "NMDC Steel Limited",
    stockpile: "DSFINE",
    quantity: 3717.09,
    completedOn: "2026-03-04 20:10",
    ePermitNumber: "EPM-240302",
    railwayTransitPass: "RTP-90302",
  },
  {
    id: 3,
    rackNumber: "NK 09",
    customer: "Adani Steel and Power Raigarh",
    stockpile: "DSCLO",
    quantity: 4020.5,
    completedOn: "2026-03-04 23:50",
    ePermitNumber: "EPM-240303",
    railwayTransitPass: "RTP-90303",
  },
  {
    id: 4,
    rackNumber: "GPWS 04",
    customer: "JSPL Angle GPWS",
    stockpile: "DSFINE",
    quantity: 3985.5,
    completedOn: "2026-03-04 23:00",
    ePermitNumber: "EPM-240304",
    railwayTransitPass: "RTP-90304",
  },
  {
    id: 5,
    rackNumber: "GPWS 03",
    customer: "JSW Steel Ltd (ODJV Works) GPWS",
    stockpile: "D10FINE",
    quantity: 4504.9,
    completedOn: "2026-03-05 00:00",
    ePermitNumber: "EPM-240305",
    railwayTransitPass: "RTP-90305",
  },
];

const initialDemandForm = {
  fNote: "",
  date: "",
  customer: "",
  destination: "",
  oreType: "",
  salesType: "",
};

function formatDate(value) {
  if (!value) return "-";
  if (value.includes(" ")) return value;
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function compareValues(a, b, order) {
  const left = typeof a === "string" ? a.toLowerCase() : a;
  const right = typeof b === "string" ? b.toLowerCase() : b;

  if (left === right) return 0;
  if (left > right) return order === "asc" ? 1 : -1;
  return order === "asc" ? -1 : 1;
}

export default function EDemandManagementPage() {
  const { currentRoute } = useRouter();
  const isPermitRoute = currentRoute === "manage-e-permit";

  const [demands, setDemands] = useState(initialDemands);
  const [demandSearch, setDemandSearch] = useState("");
  const [demandSortBy, setDemandSortBy] = useState("id");
  const [demandSortOrder, setDemandSortOrder] = useState("asc");
  const [isAddDemandOpen, setIsAddDemandOpen] = useState(false);
  const [demandForm, setDemandForm] = useState(initialDemandForm);

  const [permitSearch, setPermitSearch] = useState("");
  const [permitSortBy, setPermitSortBy] = useState("id");
  const [permitSortOrder, setPermitSortOrder] = useState("asc");

  const demandRows = useMemo(() => {
    const query = demandSearch.trim().toLowerCase();

    return demands
      .filter((row) => {
        if (!query) return true;
        return [
          row.id,
          row.fNote,
          row.date,
          row.customer,
          row.destination,
          row.oreType,
          row.salesType,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => compareValues(a[demandSortBy], b[demandSortBy], demandSortOrder));
  }, [demands, demandSearch, demandSortBy, demandSortOrder]);

  const permitRows = useMemo(() => {
    const query = permitSearch.trim().toLowerCase();

    return initialPermitRows
      .filter((row) => {
        if (!query) return true;
        return [
          row.id,
          row.rackNumber,
          row.customer,
          row.stockpile,
          row.quantity,
          row.completedOn,
          row.ePermitNumber,
          row.railwayTransitPass,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => compareValues(a[permitSortBy], b[permitSortBy], permitSortOrder));
  }, [permitSearch, permitSortBy, permitSortOrder]);

  function handleDemandSort(field) {
    if (demandSortBy === field) {
      setDemandSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setDemandSortBy(field);
    setDemandSortOrder("asc");
  }

  function handlePermitSort(field) {
    if (permitSortBy === field) {
      setPermitSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setPermitSortBy(field);
    setPermitSortOrder("asc");
  }

  function handleDemandFormChange(event) {
    const { name, value } = event.target;
    setDemandForm((prev) => ({ ...prev, [name]: value }));
  }

  function closeDemandForm() {
    setIsAddDemandOpen(false);
    setDemandForm(initialDemandForm);
  }

  function handleAddDemandSubmit(event) {
    event.preventDefault();

    if (
      !demandForm.date ||
      !demandForm.customer ||
      !demandForm.destination ||
      !demandForm.oreType ||
      !demandForm.salesType
    ) {
      return;
    }

    const nextId = demands.length > 0 ? Math.max(...demands.map((row) => row.id)) + 1 : 1;

    setDemands((prev) => [
      {
        id: nextId,
        fNote: demandForm.fNote.trim() || String(1000 + nextId),
        date: demandForm.date,
        customer: demandForm.customer,
        destination: demandForm.destination,
        oreType: demandForm.oreType,
        salesType: demandForm.salesType,
      },
      ...prev,
    ]);

    closeDemandForm();
  }

  if (isPermitRoute) {
    return (
      <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
            Manage E-Permit
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            Uniform, searchable permit register aligned with the admin Master UI.
          </p>
        </div>

        <SearchBar
          placeholder="Search rack, customer, stockpile or permit number"
          value={permitSearch}
          onChange={setPermitSearch}
          showFilter={false}
        />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-print-table>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                    {" "}
                    <SortHeaderButton
                      label="Sl No"
                      field="id"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                    <SortHeaderButton
                      label="Rack Number"
                      field="rackNumber"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                    <SortHeaderButton
                      label="Customer"
                      field="customer"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden xl:table-cell">
                    <SortHeaderButton
                      label="Stockpile"
                      field="stockpile"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden lg:table-cell">
                    <SortHeaderButton
                      label="Quantity"
                      field="quantity"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden 2xl:table-cell">
                    <SortHeaderButton
                      label="Completed On"
                      field="completedOn"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                    <SortHeaderButton
                      label="E-Permit Number"
                      field="ePermitNumber"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden 2xl:table-cell">
                    <SortHeaderButton
                      label="Railway Transit Pass"
                      field="railwayTransitPass"
                      sortBy={permitSortBy}
                      sortOrder={permitSortOrder}
                      onSort={handlePermitSort}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {permitRows.length > 0 ? (
                  permitRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                        {row.id}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-800 font-semibold">
                        {row.rackNumber}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                        {row.customer}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden xl:table-cell">
                        {row.stockpile}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden lg:table-cell">
                        {row.quantity.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden 2xl:table-cell">
                        {formatDate(row.completedOn)}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                        {row.ePermitNumber}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden 2xl:table-cell">
                        {row.railwayTransitPass}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500"
                    >
                      There is no E-Permit data to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
            Manage E-Demand
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            View and create E-Demand records with Master-page style alignment.
          </p>
        </div>

        <button
          onClick={() => setIsAddDemandOpen(true)}
          className="flex items-center gap-2 3xl:gap-3 rounded-lg bg-blue-600 px-5 py-2.5 3xl:px-6 3xl:py-3 5xl:px-8 5xl:py-4 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-all self-start active:scale-[0.98]"
        >
          <PlusIcon className="3xl:w-5 3xl:h-5" />
          <span>Add New E-Demand</span>
        </button>
      </div>

      <SearchBar
        placeholder="Search by f-note, customer, destination, ore type or sales type"
        value={demandSearch}
        onChange={setDemandSearch}
        showFilter={false}
      />

      {isAddDemandOpen ? (
        <UniformSectionCard
          title="Add E-Demand"
          subtitle="Use the same uniform admin style to register a new demand."
        >
          <form onSubmit={handleAddDemandSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <UniformFormField label="F-Note">
                <input
                  type="text"
                  name="fNote"
                  value={demandForm.fNote}
                  onChange={handleDemandFormChange}
                  className={uniformInputClass}
                  placeholder="Enter F-Note"
                />
              </UniformFormField>

              <UniformFormField label="Date">
                <input
                  type="date"
                  name="date"
                  value={demandForm.date}
                  onChange={handleDemandFormChange}
                  className={uniformInputClass}
                  required
                />
              </UniformFormField>

              <UniformFormField label="Customer">
                <ThemedSelect
                  name="customer"
                  value={demandForm.customer}
                  onChange={handleDemandFormChange}
                  className={uniformInputClass}
                  placeholder="Select customer"
                >
                  <option value="">Select customer</option>
                  {customerOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>

              <UniformFormField label="Destination">
                <ThemedSelect
                  name="destination"
                  value={demandForm.destination}
                  onChange={handleDemandFormChange}
                  className={uniformInputClass}
                  placeholder="Select destination"
                >
                  <option value="">Select destination</option>
                  {destinationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>

              <UniformFormField label="Ore Type">
                <ThemedSelect
                  name="oreType"
                  value={demandForm.oreType}
                  onChange={handleDemandFormChange}
                  className={uniformInputClass}
                  placeholder="Select ore type"
                >
                  <option value="">Select ore type</option>
                  {oreTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>

              <UniformFormField label="Sales Type">
                <ThemedSelect
                  name="salesType"
                  value={demandForm.salesType}
                  onChange={handleDemandFormChange}
                  className={uniformInputClass}
                  placeholder="Select sales type"
                >
                  <option value="">Select sales type</option>
                  {salesTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <button type="button" onClick={closeDemandForm} className={uniformSecondaryButtonClass}>
                Cancel
              </button>
              <button type="submit" className={uniformPrimaryButtonClass}>
                Save E-Demand
              </button>
            </div>
          </form>
        </UniformSectionCard>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-print-table>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="Sl No"
                    field="id"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="F-Note"
                    field="fNote"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="Date"
                    field="date"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="Customer"
                    field="customer"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase">
                  <SortHeaderButton
                    label="Destination"
                    field="destination"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden lg:table-cell">
                  <SortHeaderButton
                    label="Ore Type"
                    field="oreType"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] 3xl:text-[13px] 5xl:text-[17px] font-bold tracking-[0.06em] text-slate-500 uppercase hidden xl:table-cell">
                  <SortHeaderButton
                    label="Sales Type"
                    field="salesType"
                    sortBy={demandSortBy}
                    sortOrder={demandSortOrder}
                    onSort={handleDemandSort}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {demandRows.length > 0 ? (
                demandRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                      {row.id}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] font-semibold text-slate-800">
                      {row.fNote}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                      {row.customer}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700">
                      {row.destination}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden lg:table-cell">
                      {row.oreType}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] 3xl:text-[16px] 5xl:text-[20px] text-slate-700 hidden xl:table-cell">
                      {row.salesType}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500"
                  >
                    There is no E-Demand data to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

