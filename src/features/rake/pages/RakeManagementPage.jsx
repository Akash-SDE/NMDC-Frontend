import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "../../../context/RouterContext";
import { loadingPathForRake } from "../../../constants/routes";
import { uniformInputClass } from "../../../components/shared/UniformUi";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import LoadingState from "../../../components/common/LoadingState";
import ApiErrorState from "../../../components/common/ApiErrorState";
import { formatDateTimeForTable } from "../../../utils/dateUtils";
import { useOfferedRakes } from "../hooks/useOfferedRakes";
import { useRakeOfferingForm } from "../hooks/useRakeOfferingForm";
import { useUpcomingRakes } from "../hooks/useUpcomingRakes";
import OfferedRakesTable from "../components/OfferedRakesTable";
import RakeOfferingFormView from "../components/RakeOfferingFormView";
import RakeUpcomingView from "../components/RakeUpcomingView";

export default function RakeManagementPage() {
  const { navigate, currentRoute, routeParams } = useRouter();
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
    upsertUiRow,
    updateUiRows,
    getByRakeNumber,
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
    prefillOfferingForm,
    loadRowForEdit,
    loadRowForAdjustment,
    buildNormalizedRowFromForm,
  } = useRakeOfferingForm();
  const upcoming = useUpcomingRakes({ uiRows, upsertUiRow });

  const [statusConfirmRakeId, setStatusConfirmRakeId] = useState("");

  const handleNavigateToRakeManagement = useCallback(
    () => navigate("rake-management"),
    [navigate],
  );
  const handleNavigateToUpcoming = useCallback(
    () => navigate("rake-upcoming"),
    [navigate],
  );
  const handleCloseStatusConfirm = useCallback(() => setStatusConfirmRakeId(""), []);

  const inputClass = uniformInputClass;
  const isUpcomingPage = currentRoute === "rake-upcoming";
  const isOfferingPage =
    currentRoute === "rake-offering" || currentRoute === "rake-adjustment";
  const isAdjustmentPage = currentRoute === "rake-adjustment";
  const isAdjustmentFlow =
    routeParams?.formType === "adjustment" || currentRoute === "rake-adjustment";

  const statusConfirmRake = useMemo(
    () => uiRows.find((row) => row.rakeId === statusConfirmRakeId),
    [uiRows, statusConfirmRakeId],
  );

  useEffect(() => {
    if (!isOfferingPage) return;

    const prefillRow =
      routeParams?.prefillRow ||
      (routeParams?.rakeNumber ? getByRakeNumber(routeParams.rakeNumber) : null);

    if (!prefillRow) {
      resetOfferingForm();
      return;
    }

    prefillOfferingForm(prefillRow);
  }, [isOfferingPage, routeParams, getByRakeNumber, prefillOfferingForm, resetOfferingForm]);

  const handleSaveInlineAdjustment = useCallback(
    async (rakeId) => {
      if (!adjustOfferFor || !adjustOfferTime) return;

      const adjustedOfferTime = formatDateTimeForTable(adjustOfferTime);

      await updateUiRows((prev) =>
        prev.map((row) =>
          row.rakeId === rakeId
            ? {
                ...row,
                adjustOfferFor,
                adjustedOfferTime,
                offerTime: adjustedOfferTime,
              }
            : row,
        ),
      );

      resetOfferingForm();
    },
    [adjustOfferFor, adjustOfferTime, updateUiRows, resetOfferingForm],
  );

  const handleInlineAddRake = useCallback(async () => {
    const requiredValues = [
      offeringForm.rakeId,
      offeringForm.rakeNumber,
      offeringForm.noOfWagons,
      offeringForm.wagonType,
      offeringForm.siding,
      offeringForm.route,
      offeringForm.oreType,
      offeringForm.customer,
      offeringForm.destination,
      offeringForm.offerTime,
    ];

    if (requiredValues.some((value) => !String(value || "").trim())) {
      return;
    }

    if (inlineActionMode === "adjust") {
      if (!activeInlineRakeId) return;
      await handleSaveInlineAdjustment(activeInlineRakeId);
      return;
    }

    const nextSno =
      uiRows.length > 0
        ? Math.max(...uiRows.map((row) => Number(row.sno) || 0)) + 1
        : 1;

    const normalizedRow = buildNormalizedRowFromForm(nextSno);

    if (inlineActionMode === "add") {
      await upsertUiRow(normalizedRow);
    } else {
      await updateUiRows((prev) =>
        prev.map((row) =>
          row.rakeId === activeInlineRakeId
            ? { ...row, ...normalizedRow, sno: row.sno }
            : row,
        ),
      );
    }

    resetOfferingForm();
  }, [
    offeringForm,
    inlineActionMode,
    activeInlineRakeId,
    uiRows,
    buildNormalizedRowFromForm,
    upsertUiRow,
    updateUiRows,
    handleSaveInlineAdjustment,
    resetOfferingForm,
  ]);

  const handleEditOffered = useCallback(
    (row) => {
      if (row.isDisabled) return;
      loadRowForEdit(row);
    },
    [loadRowForEdit],
  );

  const handleOpenAdjustment = useCallback(
    (row) => {
      if (row.isDisabled) return;
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

  const handleOfferingSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

  const confirmOfferedStatusToggle = useCallback(async () => {
    if (!statusConfirmRakeId) return;

    await updateUiRows((prev) =>
      prev.map((row) =>
        row.rakeId === statusConfirmRakeId
          ? { ...row, isDisabled: !row.isDisabled }
          : row,
      ),
    );
    setStatusConfirmRakeId("");
  }, [statusConfirmRakeId, updateUiRows]);

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
        upcomingMessage={upcoming.message}
        upcomingMessageTone={upcoming.messageTone}
        upcomingStats={upcoming.stats}
        updateUpcomingRow={upcoming.updateUpcomingRow}
        onAddUpcomingRow={upcoming.addUpcomingRow}
        onRemoveUpcomingRow={upcoming.removeUpcomingRow}
        onSaveUpcomingRakes={upcoming.saveUpcomingToOffered}
        onClearUpcomingRakes={upcoming.clearUpcomingRows}
      />
    );
  }

  if (!isOfferingPage && !isAdjustmentPage) {
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
          onClearForm={resetOfferingForm}
          onEditOffered={handleEditOffered}
          onOpenAdjustment={handleOpenAdjustment}
          onLoadRedirect={handleLoadRedirect}
          onRequestStatusToggle={setStatusConfirmRakeId}
          onNavigateUpcoming={handleNavigateToUpcoming}
          upcomingDraftCount={upcoming.stats.total}
          upcomingReadyCount={upcoming.stats.readyCount}
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

  return (
    <RakeOfferingFormView
      inputClass={inputClass}
      isAdjustmentFlow={isAdjustmentFlow}
      offeringForm={offeringForm}
      adjustOfferFor={adjustOfferFor}
      adjustOfferTime={adjustOfferTime}
      onNavigateBack={handleNavigateToRakeManagement}
      onOfferingSubmit={handleOfferingSubmit}
      updateOffering={updateOffering}
      setAdjustOfferFor={setAdjustOfferFor}
      setAdjustOfferTime={setAdjustOfferTime}
      onClear={resetOfferingForm}
    />
  );
}
