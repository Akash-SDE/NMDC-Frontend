import { useCallback, useState } from "react";
import { formatDateTimeForTable } from "../../../utils/dateUtils";
import { initialOfferingForm } from "../constants/rakeConstants";
import { buildOfferingFormFromUiRow, toInputDateTime } from "../utils/rakeMappers";

export function useRakeOfferingForm() {
  const [offeringForm, setOfferingForm] = useState(initialOfferingForm);
  const [inlineActionMode, setInlineActionMode] = useState("add");
  const [activeInlineRakeId, setActiveInlineRakeId] = useState("");
  const [adjustOfferFor, setAdjustOfferFor] = useState("");
  const [adjustOfferTime, setAdjustOfferTime] = useState("");

  const updateOffering = useCallback((field, value) => {
    setOfferingForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetOfferingForm = useCallback(() => {
    setOfferingForm(initialOfferingForm);
    setAdjustOfferFor("");
    setAdjustOfferTime("");
    setInlineActionMode("add");
    setActiveInlineRakeId("");
  }, []);

  const loadRowForEdit = useCallback((row) => {
    const form = buildOfferingFormFromUiRow(row);
    if (!form) return;
    setOfferingForm(form);
    setInlineActionMode("edit");
    setActiveInlineRakeId(row.rakeId);
    setAdjustOfferFor(row.adjustOfferFor && row.adjustOfferFor !== "-" ? row.adjustOfferFor : "");
    setAdjustOfferTime("");
  }, []);

  const loadRowForAdjustment = useCallback((row) => {
    const form = buildOfferingFormFromUiRow(row);
    if (!form) return;
    setOfferingForm(form);
    setInlineActionMode("adjust");
    setActiveInlineRakeId(row.rakeId);
    setAdjustOfferFor(row.adjustOfferFor && row.adjustOfferFor !== "-" ? row.adjustOfferFor : "");
    setAdjustOfferTime(
      row.adjustedOfferTime && row.adjustedOfferTime !== "-"
        ? toInputDateTime(row.adjustedOfferTime)
        : toInputDateTime(row.offerTime),
    );
  }, []);

  const buildNormalizedRowFromForm = useCallback(
    (nextSno) => ({
      rakeId: offeringForm.rakeId.trim(),
      rakeNumber: offeringForm.rakeNumber.trim(),
      wagonSupply: Number(offeringForm.noOfWagons) || 0,
      wagonType: offeringForm.wagonType,
      siding: offeringForm.siding,
      route: offeringForm.route,
      oreType: offeringForm.oreType,
      customer: offeringForm.customer,
      oreTypeCustomer: `${offeringForm.oreType} / ${offeringForm.customer}`,
      destination: offeringForm.destination,
      fNote: offeringForm.fNote.trim() || "-",
      offerTime: formatDateTimeForTable(offeringForm.offerTime),
      sno: nextSno,
      adjustOfferFor: "-",
      adjustedOfferTime: "-",
      isDisabled: false,
    }),
    [offeringForm],
  );

  const prefillOfferingForm = useCallback((row) => {
    const form = buildOfferingFormFromUiRow(row);
    if (!form) return;
    setOfferingForm(form);
    setAdjustOfferFor("");
    setAdjustOfferTime("");
  }, []);

  return {
    offeringForm,
    inlineActionMode,
    activeInlineRakeId,
    adjustOfferFor,
    adjustOfferTime,
    setAdjustOfferFor,
    setAdjustOfferTime,
    setInlineActionMode,
    setActiveInlineRakeId,
    updateOffering,
    resetOfferingForm,
    prefillOfferingForm,
    loadRowForEdit,
    loadRowForAdjustment,
    buildNormalizedRowFromForm,
  };
}
