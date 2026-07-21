import {
  UniformFormField,
  UniformSectionCard,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import { adjustmentReasonOptions } from "../constants/rakeConstants";

export default function RakeAdjustmentView({
  inputClass,
  offeredRows,
  selectedRake,
  adjustSearchRakeNumber,
  adjustOfferFor,
  adjustOfferTime,
  onNavigateBack,
  setAdjustSearchRakeNumber,
  setAdjustRakeNumber,
  setAdjustOfferFor,
  setAdjustOfferTime,
  onClearAdjustment,
}) {
  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
            Rake Adjustment
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            Adjust offered rake schedules and reasons in a dedicated page.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateBack}
          className={uniformSecondaryButtonClass}
        >
          Back to Rake Management
        </button>
      </div>

      <UniformSectionCard
        title="Adjustment Rake Control"
        subtitle="Search an offered rake and record operational adjustments with timestamp."
      >
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,320px)_max-content] sm:items-end">
            <UniformFormField label="Rake Number">
              <ThemedSelect
                value={adjustSearchRakeNumber}
                onChange={(event) => setAdjustSearchRakeNumber(event.target.value)}
                className={inputClass}
              >
                <option value="">Select rake number</option>
                {offeredRows.map((row) => (
                  <option key={row.rakeNumber} value={row.rakeNumber}>
                    {row.rakeNumber}
                  </option>
                ))}
              </ThemedSelect>
            </UniformFormField>
            <button
              type="button"
              onClick={() => setAdjustRakeNumber(adjustSearchRakeNumber)}
              className={`${uniformPrimaryButtonClass} h-10 w-full sm:w-auto sm:min-w-32 sm:justify-self-start`}
            >
              Search
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Rake Details</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <UniformFormField label="Rake Number">
                <input value={selectedRake?.rakeNumber || ""} readOnly className={inputClass} />
              </UniformFormField>
              <UniformFormField label="Wagon Supply">
                <input value={selectedRake?.wagonSupply || ""} readOnly className={inputClass} />
              </UniformFormField>
              <UniformFormField label="Customer">
                <input
                  value={selectedRake?.customer || selectedRake?.oreTypeCustomer?.split("/")[1]?.trim() || ""}
                  readOnly
                  className={inputClass}
                />
              </UniformFormField>
              <UniformFormField label="F-Note">
                <input value={selectedRake?.fNote || ""} readOnly className={inputClass} />
              </UniformFormField>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">Adjustment Details</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <UniformFormField label="Offer For">
                <ThemedSelect
                  value={adjustOfferFor}
                  onChange={(event) => setAdjustOfferFor(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select adjustment reason</option>
                  {adjustmentReasonOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>
              <UniformFormField label="Offer Time">
                <input
                  type="datetime-local"
                  value={adjustOfferTime}
                  onChange={(event) => setAdjustOfferTime(event.target.value)}
                  className={inputClass}
                />
              </UniformFormField>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClearAdjustment}
                className={uniformSecondaryButtonClass}
              >
                Clear
              </button>
              <button
                type="button"
                disabled={!selectedRake || !adjustOfferFor || !adjustOfferTime}
                className={uniformPrimaryButtonClass}
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      </UniformSectionCard>
    </div>
  );
}
