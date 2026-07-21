import {
  UniformFormField,
  UniformSectionCard,
  uniformPrimaryButtonClass,
  uniformSecondaryButtonClass,
} from "../../../components/shared/UniformUi";
import ThemedSelect from "../../../components/shared/ThemedSelect";
import {
  wagonTypeOptions,
  sidingOptions,
  routeOptions,
  oreTypeOptions,
  customerOptions,
  destinationOptions,
  adjustmentReasonOptions,
} from "../constants/rakeConstants";

export default function RakeOfferingFormView({
  inputClass,
  isAdjustmentFlow,
  offeringForm,
  adjustOfferFor,
  adjustOfferTime,
  onNavigateBack,
  onOfferingSubmit,
  updateOffering,
  setAdjustOfferFor,
  setAdjustOfferTime,
  onClear,
}) {
  const submitDisabled =
    isAdjustmentFlow && (!adjustOfferFor || !adjustOfferTime);

  return (
    <div className="space-y-6 3xl:space-y-8 5xl:space-y-12 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[24px] sm:text-[28px] 3xl:text-[34px] 5xl:text-[44px] font-bold text-slate-800">
            {isAdjustmentFlow ? "Rake Offering Adjustment" : "Rake Offering"}
          </h2>
          <p className="mt-1 text-[14px] 3xl:text-[17px] 5xl:text-[22px] text-slate-500">
            {isAdjustmentFlow
              ? "Edit and adjust rake offering details in one unified form."
              : "Create or edit offering details in a dedicated form page."}
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
        title="Rake Offering Details"
        subtitle={
          isAdjustmentFlow
            ? "Use the same Add Rake Offering structure with adjustment details below."
            : "Capture complete dispatch attributes with clean validation-friendly fields."
        }
      >
        <form onSubmit={onOfferingSubmit} className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
              Rake and Movement Details
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <UniformFormField label="Rake ID">
                <input
                  type="text"
                  value={offeringForm.rakeId}
                  onChange={(event) => updateOffering("rakeId", event.target.value)}
                  className={inputClass}
                  placeholder="Enter Rake ID"
                />
              </UniformFormField>
              <UniformFormField label="Rake Number">
                <input
                  type="text"
                  value={offeringForm.rakeNumber}
                  onChange={(event) => updateOffering("rakeNumber", event.target.value)}
                  className={inputClass}
                  placeholder="Enter Rake Number"
                />
              </UniformFormField>
              <UniformFormField label="Wagon Type">
                <ThemedSelect
                  value={offeringForm.wagonType}
                  onChange={(event) => updateOffering("wagonType", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select wagon type</option>
                  {wagonTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>
              <UniformFormField label="No of Wagons">
                <input
                  type="number"
                  value={offeringForm.noOfWagons}
                  onChange={(event) => updateOffering("noOfWagons", event.target.value)}
                  className={inputClass}
                  placeholder="Enter wagon count"
                />
              </UniformFormField>
              <UniformFormField label="Siding">
                <ThemedSelect
                  value={offeringForm.siding}
                  onChange={(event) => updateOffering("siding", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select siding</option>
                  {sidingOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>
              <UniformFormField label="Route">
                <ThemedSelect
                  value={offeringForm.route}
                  onChange={(event) => updateOffering("route", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select route</option>
                  {routeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
              Customer and Timing Details
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <UniformFormField label="Ore Type">
                <ThemedSelect
                  value={offeringForm.oreType}
                  onChange={(event) => updateOffering("oreType", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select ore type</option>
                  {oreTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>
              <UniformFormField label="Customer">
                <ThemedSelect
                  value={offeringForm.customer}
                  onChange={(event) => updateOffering("customer", event.target.value)}
                  className={inputClass}
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
                  value={offeringForm.destination}
                  onChange={(event) => updateOffering("destination", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select destination</option>
                  {destinationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </ThemedSelect>
              </UniformFormField>
              <UniformFormField label="F-Note">
                <input
                  type="text"
                  value={offeringForm.fNote}
                  onChange={(event) => updateOffering("fNote", event.target.value)}
                  className={inputClass}
                  placeholder="Enter F-Note"
                />
              </UniformFormField>
              <UniformFormField label="Placement Time">
                <input
                  type="datetime-local"
                  value={offeringForm.placementTime}
                  onChange={(event) => updateOffering("placementTime", event.target.value)}
                  className={inputClass}
                />
              </UniformFormField>
              <UniformFormField label="Offer Time">
                <input
                  type="datetime-local"
                  value={offeringForm.offerTime}
                  onChange={(event) => updateOffering("offerTime", event.target.value)}
                  className={inputClass}
                />
              </UniformFormField>
            </div>
          </div>

          {isAdjustmentFlow ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                Adjustment Details
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                <UniformFormField label="Adjusted Offer Time">
                  <input
                    type="datetime-local"
                    value={adjustOfferTime}
                    onChange={(event) => setAdjustOfferTime(event.target.value)}
                    className={inputClass}
                  />
                </UniformFormField>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClear}
              className={uniformSecondaryButtonClass}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={submitDisabled}
              className={`${uniformPrimaryButtonClass} ${submitDisabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {isAdjustmentFlow ? "Save Adjustment" : "Submit Offering"}
            </button>
          </div>
        </form>
      </UniformSectionCard>
    </div>
  );
}
