import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "../../../context/RouterContext";
import { loadingPathForRake } from "../../../constants/routes";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import LoadingState from "../../../components/common/LoadingState";
import ApiErrorState from "../../../components/common/ApiErrorState";
import { getErrorMessage } from "../../../api/apiError";
import { useOfferedRakes } from "../hooks/useOfferedRakes";
import { useRakeOfferingForm } from "../hooks/useRakeOfferingForm";
import { useUpcomingRakes } from "../hooks/useUpcomingRakes";
import OfferedRakesTable from "../components/OfferedRakesTable";
import RakeUpcomingView from "../components/RakeUpcomingView";

export default function RakeManagementPage() {
  const { navigate, currentRoute } = useRouter();
  const {
    uiRows,
    sortedRows,
    search,
    setSearch,
    sortBy,
    sortOrder,
    handleSort,
    status,
    error,
    reload,
    createOfferedRake,
    updateOfferedRake,
    setRakeDisabled,
    lookupOptions,
    saving,
  } = useOfferedRakes();

  const {
    offeringForm,
    inlineActionMode,
    activeInlineRakeId,
    adjustOfferFor,
    adjustOfferTime,
    setAdjustOfferFor,
    setAdjustOfferTime,
    updateOffering,
    resetOfferingForm,
    loadRowForEdit,
    loadRowForAdjustment,
  } = useRakeOfferingForm();
  const upcoming = useUpcomingRakes({
    uiRows,
    createOfferedRake,
    reloadOfferedRakes: reload,
  });

  const upcomingOfferedRows = useMemo(() => {
    const now = new Date();

    return uiRows
      .filter((row) => {
        if (row.isDisabled || !row.offerTime) return false;

        const offerTime = new Date(row.offerTime);

        return !Number.isNaN(offerTime.getTime()) && offerTime > now;
      })
      .map((row) => ({
        ...row,
        id: `offered-${row.rakeId}`,
        wagonCount: row.noOfWagons,
        placementTime: row.offerTime,
        isOfferedUpcoming: true,
      }));
  }, [uiRows]);

  const [statusConfirmRakeId, setStatusConfirmRakeId] = useState("");
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");

  const handleNavigateToRakeManagement = useCallback(
    () => navigate("rake-management"),
    [navigate],
  );
  const handleNavigateToUpcoming = useCallback(
    () => navigate("rake-upcoming"),
    [navigate],
  );
  const handleCloseStatusConfirm = useCallback(() => setStatusConfirmRakeId(""), []);

  const isUpcomingPage = currentRoute === "rake-upcoming";
  const isOfferingPage =
    currentRoute === "rake-offering" || currentRoute === "rake-adjustment";

  useEffect(() => {
    if (isOfferingPage) {
      navigate("rake-management");
    }
  }, [isOfferingPage, navigate]);

  const statusConfirmRake = useMemo(
    () => uiRows.find((row) => row.rakeId === statusConfirmRakeId),
    [uiRows, statusConfirmRakeId],
  );
  const handleSaveInlineAdjustment = useCallback(
    async (rakeId) => {
      if (!adjustOfferFor || !adjustOfferTime) return;

      await updateOfferedRake(rakeId, {
        offeredfor: adjustOfferFor,
        offertime: new Date(adjustOfferTime).toISOString(),
      });
      resetOfferingForm();
      setFormNotice("Offer adjustment saved.");
    },
    [adjustOfferFor, adjustOfferTime, updateOfferedRake, resetOfferingForm],
  );

  const handleInlineAddRake = useCallback(async () => {
    if (inlineActionMode === "adjust") {
      if (!activeInlineRakeId || !adjustOfferFor || !adjustOfferTime) {
        setFormNotice("");
        setFormError("Choose an offer reason and offer time before saving the adjustment.");
        return;
      }
      setFormError("");
      try {
        await handleSaveInlineAdjustment(activeInlineRakeId);
      } catch (error) {
        setFormNotice("");
        setFormError(getErrorMessage(error, "Failed to save the offer adjustment."));
      }
      return;
    }

    const missingFields = [
      ["rake number", offeringForm.rakeNumber],
      ["siding", offeringForm.siding],
      ["route", offeringForm.route],
      ["ore type", offeringForm.oreType],
      ["customer", offeringForm.customer],
      ["destination", offeringForm.destination],
      ["wagon type", offeringForm.wagonType],
      ["wagon count", offeringForm.noOfWagons],
      ...(inlineActionMode === "edit" ? [] : [["offer time", offeringForm.offerTime]]),
    ]
      .filter(([, value]) => !String(value ?? "").trim())
      .map(([label]) => label);

    if (missingFields.length > 0) {
      setFormNotice("");
      setFormError(
        `Fill ${missingFields.join(", ")} before ${inlineActionMode === "edit" ? "saving" : "adding"} the rake.`,
      );
      return;
    }

    setFormError("");

    if (inlineActionMode === "add") {
      try {
        await createOfferedRake(offeringForm);
        resetOfferingForm();
        setFormNotice("Rake added.");
      } catch (error) {
        setFormNotice("");
        setFormError(getErrorMessage(error, "Failed to create rake."));
      }
      return;
    }

    try {
      await updateOfferedRake(activeInlineRakeId, {
        rake_number: offeringForm.rakeNumber.trim(),
        siding: Number(offeringForm.siding),
        route: Number(offeringForm.route),
        oretype: Number(offeringForm.oreType),
        customer: Number(offeringForm.customer),
        destination: Number(offeringForm.destination),
        wagontype: Number(offeringForm.wagonType),
        wagoncount: Number(offeringForm.noOfWagons),
        fnote: offeringForm.fNote.trim() || null,
      });
      resetOfferingForm();
      setFormNotice("Rake updated.");
    } catch (error) {
      setFormNotice("");
      setFormError(getErrorMessage(error, "Failed to update rake."));
    }
  }, [
    offeringForm,
    inlineActionMode,
    activeInlineRakeId,
    handleSaveInlineAdjustment,
    resetOfferingForm,
    createOfferedRake,
    updateOfferedRake,
    adjustOfferFor,
    adjustOfferTime,
  ]);


  const handleEditOffered = useCallback(
    (row) => {
      if (row.isDisabled) return;
      setFormError("");
      setFormNotice("");
      loadRowForEdit(row);
    },
    [loadRowForEdit],
  );

  const handleOpenAdjustment = useCallback(
    (row) => {
      if (row.isDisabled) return;
      setFormError("");
      setFormNotice("");
      loadRowForAdjustment(row);
    },
    [loadRowForAdjustment],
  );

  const handleLoadRedirect = useCallback(
    (row) => {
      if (!row?.rakeId) return;
      navigate(loadingPathForRake(row.rakeId));
    },
    [navigate],
  );

  const confirmOfferedStatusToggle = useCallback(async () => {
    if (!statusConfirmRake) return;

    try {
      await setRakeDisabled(statusConfirmRake.rakeId, !statusConfirmRake.isDisabled);
      setFormError("");
      setFormNotice(statusConfirmRake.isDisabled ? "Rake enabled." : "Rake disabled.");
      setStatusConfirmRakeId("");
    } catch (error) {
      setFormNotice("");
      setFormError(getErrorMessage(error, "Failed to update rake status."));
      setStatusConfirmRakeId("");
    }
  }, [statusConfirmRake, setRakeDisabled]);

  if (status === "loading" && uiRows.length === 0) {
    return <LoadingState message="Loading rakes…" />;
  }

  if (status === "failed" && uiRows.length === 0) {
    return <ApiErrorState error={error} onRetry={reload} title="Failed to load rakes" />;
  }

  if (isUpcomingPage) {
    return (
      <RakeUpcomingView
        onNavigateBack={handleNavigateToRakeManagement}
        upcomingRows={upcoming.upcomingRows}
        upcomingOfferedRows={upcomingOfferedRows}
        upcomingMessage={upcoming.message}
        upcomingMessageTone={upcoming.messageTone}
        upcomingStats={upcoming.stats}
        moving={upcoming.moving}
        updateUpcomingRow={upcoming.updateUpcomingRow}
        onAddUpcomingRow={upcoming.addUpcomingRow}
        onRemoveUpcomingRow={upcoming.removeUpcomingRow}
        onSaveUpcomingRakes={upcoming.saveUpcomingToOffered}
        onClearUpcomingRakes={upcoming.clearUpcomingRows}
        lookupOptions={lookupOptions}
      />
    );
  }

  if (isOfferingPage) {
    return <LoadingState message="Opening rake management…" />;
  }

  return (
    <>
      <OfferedRakesTable
        sortedRows={sortedRows}
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
        offeringForm={offeringForm}
        updateOffering={updateOffering}
        adjustOfferFor={adjustOfferFor}
        setAdjustOfferFor={setAdjustOfferFor}
        adjustOfferTime={adjustOfferTime}
        setAdjustOfferTime={setAdjustOfferTime}
        inlineActionMode={inlineActionMode}
        activeInlineRakeId={activeInlineRakeId}
        onInlineAddRake={handleInlineAddRake}
        onClearForm={() => {
          setFormError("");
          setFormNotice("");
          resetOfferingForm();
        }}
        onEditOffered={handleEditOffered}
        onOpenAdjustment={handleOpenAdjustment}
        onLoadRedirect={handleLoadRedirect}
        onRequestStatusToggle={setStatusConfirmRakeId}
        onNavigateUpcoming={handleNavigateToUpcoming}
        upcomingDraftCount={upcoming.stats.total}
        upcomingReadyCount={upcoming.stats.readyCount}
        lookupOptions={lookupOptions}
        formError={formError}
        formNotice={formNotice}
        saving={saving}
      />
      <ConfirmDialog
        isOpen={Boolean(statusConfirmRake)}
        onClose={handleCloseStatusConfirm}
        onConfirm={confirmOfferedStatusToggle}
        title={statusConfirmRake?.isDisabled ? "Enable Rake" : "Disable Rake"}
        message={
          statusConfirmRake?.isDisabled
            ? "Are you sure you want to enable this rake?"
            : "Are you sure you want to disable this rake?"
        }
        itemName={statusConfirmRake?.rakeNumber || ""}
        confirmLabel={statusConfirmRake?.isDisabled ? "Enable" : "Disable"}
        variant={statusConfirmRake?.isDisabled ? "warning" : "danger"}
      />
    </>
  );
}
