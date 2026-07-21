import {
  rakeService,
  loadingService,
  delayService,
  approvalService,
  edemandService,
} from "../../../services/operational";

const DEMURRAGE_THRESHOLD_HOURS = 5;

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateOnly(value) {
  if (!value) return null;
  const parsed = parseDate(value);
  if (!parsed) return String(value).slice(0, 10) || null;
  return parsed.toISOString().slice(0, 10);
}

function hoursBetween(start, end) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate) return null;
  return Math.max(0, (endDate - startDate) / (1000 * 60 * 60));
}

function extractRouteNo(route) {
  const match = String(route ?? "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function formatStatus(status) {
  if (!status) return "Completed";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function countWagonFlags(approval, flag) {
  const inspection = approval?.operations?.inspection ?? approval?.wagonManifest;
  if (!inspection) return 0;
  const bucket = inspection[flag];
  if (typeof bucket?.count === "number") return bucket.count;
  if (Array.isArray(bucket?.numbers)) return bucket.numbers.length;
  if (Array.isArray(bucket)) return bucket.length;
  return 0;
}

function buildRakeFacts(rakes, loadingRecords, approvals) {
  const rakeById = Object.fromEntries(rakes.map((rake) => [rake.id, rake]));
  const approvalByLoading = Object.fromEntries(
    approvals.map((approval) => [approval.loadingId, approval]),
  );

  return loadingRecords
    .filter((record) => !record.isDisabled)
    .map((loading, index) => {
      const rake = rakeById[loading.rakeId] ?? {};
      const approval = approvalByLoading[loading.id];
      const offerTime = loading.offerTime || rake.offerTime;
      const completionTime = loading.completionTime;
      const glh = hoursBetween(offerTime, completionTime);
      const demurrageHours = hoursBetween(
        loading.placementTime || offerTime,
        loading.clearanceTime || completionTime,
      );

      return {
        id: index + 1,
        loadingId: loading.id,
        rakeId: loading.rakeId,
        rakeNumber: loading.rakeNumber,
        wagonType: rake.wagonType ?? "",
        wagonCount: rake.wagonCount ?? "",
        wagonSupply: loading.wagonSupply,
        siding: loading.siding,
        route: loading.route,
        routeNo: extractRouteNo(loading.route),
        oreType: rake.oreType ?? "",
        fNoteDate: toDateOnly(loading.fNote),
        customer: loading.customer,
        destination: loading.destination,
        stockpile: loading.stockpile,
        tonnage: Number(loading.tonnage) || 0,
        offerDate: toDateOnly(offerTime),
        completionDate: toDateOnly(completionTime),
        completedOn: toDateOnly(completionTime),
        glh: glh != null ? Number(glh.toFixed(2)) : null,
        demurrageHours: demurrageHours != null ? Number(demurrageHours.toFixed(2)) : null,
        thresholdHours: DEMURRAGE_THRESHOLD_HOURS,
        alertLevel:
          demurrageHours != null && demurrageHours >= DEMURRAGE_THRESHOLD_HOURS ? "High" : "Normal",
        wagonSick: loading.wagonSick,
        status: formatStatus(loading.status),
        approvalStatus: formatStatus(approval?.status),
        operatorFtp: loading.operatorFtp,
        overloadedWagons: loading.overloadedWagons ?? 0,
        weightRemoved: loading.weightRemoved ?? 0,
        manualLoadingTrack: loading.manualLoadingTrack ?? "",
        date: toDateOnly(completionTime || offerTime),
        noOfSickWagons:
          loading.wagonSick === "Yes"
            ? Math.max(1, countWagonFlags(approval, "sick"))
            : countWagonFlags(approval, "sick"),
        noOfWagonsRepaired: countWagonFlags(approval, "repair"),
      };
    });
}

function uniqueOptions(values) {
  return [...new Set(values.filter(Boolean))].sort().map((value) => ({
    value,
    label: value,
  }));
}

function enrichFilters(baseFilters, facts) {
  const sidings = uniqueOptions(facts.map((row) => row.siding));
  const customers = uniqueOptions(facts.map((row) => row.customer));
  const oreTypes = uniqueOptions(facts.map((row) => row.oreType));

  return baseFilters.map((filter) => {
    if (filter.id === "siding" && filter.type === "select") {
      return { ...filter, options: sidings.length ? sidings : filter.options };
    }
    if (filter.id === "customer" && filter.type === "select") {
      return { ...filter, options: customers.length ? customers : filter.options };
    }
    if (filter.id === "oreType" && filter.type === "select") {
      return { ...filter, options: oreTypes.length ? oreTypes : filter.options };
    }
    return filter;
  });
}

function bucketGlh(glh) {
  if (glh == null) return null;
  if (glh < 2.5) return "lessThan2_30";
  if (glh < 3) return "from2_30to3_00";
  if (glh < 3.5) return "from3_00to3_30";
  if (glh < 4) return "from3_30to4_00";
  if (glh < 4.5) return "from4_00to4_30";
  if (glh < 5) return "from4_30to5_00";
  return "greaterThan5_00";
}

function buildDailyRows(facts, delays) {
  const delaysByDate = delays.reduce((accumulator, delay) => {
    if (delay.isDisabled) return accumulator;
    const date = toDateOnly(delay.startTime);
    if (!date) return accumulator;
    accumulator[date] = (accumulator[date] ?? 0) + 1;
    return accumulator;
  }, {});

  const grouped = facts.reduce((accumulator, fact) => {
    if (!fact.date) return accumulator;
    if (!accumulator[fact.date]) {
      accumulator[fact.date] = {
        date: fact.date,
        totalRakes: 0,
        totalTonnage: 0,
        demurrageRakes: 0,
        demurrageHours: 0,
        remarks: "",
      };
    }
    const bucket = accumulator[fact.date];
    bucket.totalRakes += 1;
    bucket.totalTonnage += fact.tonnage;
    if ((fact.demurrageHours ?? 0) >= DEMURRAGE_THRESHOLD_HOURS) {
      bucket.demurrageRakes += 1;
      bucket.demurrageHours += fact.demurrageHours;
    }
    return accumulator;
  }, {});

  return Object.values(grouped)
    .map((row, index) => {
      const delayCount = delaysByDate[row.date] ?? 0;
      let remarks = "Normal operations";
      if (row.demurrageRakes > 0 && delayCount > 0) {
        remarks = `${row.demurrageRakes} demurrage rake(s), ${delayCount} delay log(s)`;
      } else if (row.demurrageRakes > 0) {
        remarks = `${row.demurrageRakes} demurrage rake(s) recorded`;
      } else if (delayCount > 0) {
        remarks = `${delayCount} delay log(s) recorded`;
      }

      return {
        id: index + 1,
        ...row,
        totalTonnage: Number(row.totalTonnage.toFixed(2)),
        demurrageHours: Number(row.demurrageHours.toFixed(2)),
        remarks,
      };
    })
    .sort((left, right) => left.date.localeCompare(right.date));
}

function buildSidingPerformanceRows(facts) {
  const grouped = facts.reduce((accumulator, fact) => {
    if (!fact.siding) return accumulator;
    if (!accumulator[fact.siding]) {
      accumulator[fact.siding] = {
        siding: fact.siding,
        noOfRakesLoaded: 0,
        noOfDemurrageRakes: 0,
        demurrageHours: 0,
        glhTotal: 0,
        glhCount: 0,
      };
    }
    const bucket = accumulator[fact.siding];
    bucket.noOfRakesLoaded += 1;
    if ((fact.demurrageHours ?? 0) >= DEMURRAGE_THRESHOLD_HOURS) {
      bucket.noOfDemurrageRakes += 1;
      bucket.demurrageHours += fact.demurrageHours;
    }
    if (fact.glh != null) {
      bucket.glhTotal += fact.glh;
      bucket.glhCount += 1;
    }
    return accumulator;
  }, {});

  return Object.values(grouped).map((row, index) => ({
    id: index + 1,
    siding: row.siding,
    noOfRakesLoaded: row.noOfRakesLoaded,
    noOfDemurrageRakes: row.noOfDemurrageRakes,
    demurrageHours: Number(row.demurrageHours.toFixed(2)),
    demurragePercent: row.noOfRakesLoaded
      ? Number(((row.noOfDemurrageRakes / row.noOfRakesLoaded) * 100).toFixed(1))
      : 0,
    avgGlh: row.glhCount ? Number((row.glhTotal / row.glhCount).toFixed(2)) : 0,
    date: null,
  }));
}

function buildRakeIncentiveRows(facts) {
  const grouped = facts.reduce((accumulator, fact) => {
    if (!fact.date || fact.glh == null) return accumulator;
    if (!accumulator[fact.date]) {
      accumulator[fact.date] = {
        date: fact.date,
        noOfRakesLoaded: 0,
        lessThan2_30: 0,
        from2_30to3_00: 0,
        from3_00to3_30: 0,
        from3_30to4_00: 0,
        from4_00to4_30: 0,
        from4_30to5_00: 0,
        greaterThan5_00: 0,
        manualR3Loading: 0,
        manualR4Loading: 0,
      };
    }
    const bucket = accumulator[fact.date];
    bucket.noOfRakesLoaded += 1;
    const glhBucket = bucketGlh(fact.glh);
    if (glhBucket) bucket[glhBucket] += 1;
    if (fact.manualLoadingTrack === "R3") bucket.manualR3Loading += 1;
    if (fact.manualLoadingTrack === "R4") bucket.manualR4Loading += 1;
    return accumulator;
  }, {});

  return Object.values(grouped).map((row, index) => ({ id: index + 1, ...row }));
}

function buildDelayRows(delays) {
  return delays
    .filter((delay) => !delay.isDisabled)
    .map((delay, index) => {
      const duration = hoursBetween(delay.startTime, delay.endTime);
      return {
        id: index + 1,
        rakeNumber: delay.rakeNumber,
        category: delay.category,
        startTime: delay.startTime,
        endTime: delay.endTime,
        durationHours: duration != null ? Number(duration.toFixed(2)) : null,
        reason: delay.reason,
        reportedBy: delay.reportedBy,
        date: toDateOnly(delay.startTime),
        completionDate: toDateOnly(delay.endTime),
        fNoteDate: toDateOnly(delay.startTime),
        offerDate: toDateOnly(delay.startTime),
        completedOn: toDateOnly(delay.endTime),
      };
    });
}

function buildApprovalAuditRows(approvals, loadingRecords) {
  const loadingById = Object.fromEntries(loadingRecords.map((row) => [row.id, row]));

  return approvals.map((approval, index) => ({
    id: index + 1,
    rakeNumber: approval.rakeNumber,
    customer: approval.customer,
    siding: approval.siding,
    currentStep: formatStatus(approval.status),
    operationsStatus: formatStatus(approval.operations?.status),
    commercialStatus: formatStatus(approval.commercial?.status),
    cwStatus: formatStatus(approval.cw?.status),
    completion: toDateOnly(loadingById[approval.loadingId]?.completionTime),
    updatedAt: toDateOnly(approval.updatedAt),
    date: toDateOnly(approval.updatedAt),
    fNoteDate: toDateOnly(approval.updatedAt),
    completionDate: toDateOnly(loadingById[approval.loadingId]?.completionTime),
  }));
}

function primaryDelayReason(delays, loadingId, rakeId) {
  const related = delays.filter(
    (delay) =>
      !delay.isDisabled &&
      (delay.loadingId === loadingId || delay.rakeId === rakeId),
  );
  if (!related.length) return null;

  const ranked = [...related].sort((left, right) => {
    const leftDuration = hoursBetween(left.startTime, left.endTime) ?? 0;
    const rightDuration = hoursBetween(right.startTime, right.endTime) ?? 0;
    return rightDuration - leftDuration;
  });

  return ranked[0]?.reason || null;
}

function buildEDemandRows(eDemands) {
  return eDemands.map((row, index) => ({
    id: index + 1,
    ...row,
    date: toDateOnly(row.date) ?? row.date,
  }));
}

function buildLoadAdjustmentRows(ePermits) {
  return ePermits.map((permit, index) => ({
    id: index + 1,
    rackNumber: permit.rakeNumber,
    customer: permit.customer,
    stockpile: permit.stockpile,
    quantity: permit.quantity,
    completedOn: toDateOnly(permit.completedOn) ?? permit.completedOn,
    ePermitNumber: permit.ePermitNumber,
    railwayTransitPass: permit.railwayTransitPass,
    updatedBy: permit.updatedBy || "-",
    date: toDateOnly(permit.completedOn),
    fNoteDate: toDateOnly(permit.completedOn),
    offerDate: toDateOnly(permit.completedOn),
    completionDate: toDateOnly(permit.completedOn),
  }));
}

function buildDemurrageRows(facts, delays) {
  return facts
    .filter((fact) => (fact.demurrageHours ?? 0) >= DEMURRAGE_THRESHOLD_HOURS)
    .map((fact, index) => {
      const reason =
        primaryDelayReason(delays, fact.loadingId, fact.rakeId) ??
        (fact.demurrageHours >= 8 ? "Extended clearance delay" : "Loading overrun");

      return {
        id: index + 1,
        rakeNumber: fact.rakeNumber,
        completionDate: fact.completionDate,
        demurrageHours: fact.demurrageHours,
        thresholdHours: fact.thresholdHours,
        alertLevel: fact.alertLevel,
        reason,
        date: fact.date,
        fNoteDate: fact.fNoteDate,
        offerDate: fact.offerDate,
        completedOn: fact.completedOn,
      };
    });
}

function buildSickWagonRows(facts) {
  return facts
    .filter((fact) => fact.noOfSickWagons > 0 || fact.wagonSick === "Yes")
    .map((fact, index) => ({
      id: index + 1,
      rakeNumber: fact.rakeNumber,
      date: fact.date,
      customer: fact.customer,
      destination: fact.destination,
      noOfSickWagons: Math.max(fact.noOfSickWagons, fact.wagonSick === "Yes" ? 1 : 0),
      noOfWagonsRepaired: fact.noOfWagonsRepaired,
      fNoteDate: fact.fNoteDate,
      completionDate: fact.completionDate,
      offerDate: fact.offerDate,
      completedOn: fact.completedOn,
    }));
}

export async function loadReportDataset(reportId, baseConfig) {
  const [rakes, loadingRecords, delays, approvals, eDemands, ePermits] =
    await Promise.all([
      rakeService.list(),
      loadingService.list(),
      delayService.list(),
      approvalService.list(),
      edemandService.listDemands(),
      edemandService.listPermits(),
    ]);

  const facts = buildRakeFacts(rakes, loadingRecords, approvals);
  const enrichedFilters = enrichFilters(baseConfig.filters ?? [], facts);

  const builders = {
    transaction: () => ({
      rows: facts.map(({ id, ...row }) => ({
        ...row,
        status: row.status === "Ready For Dispatch" ? "Completed" : row.status,
      })),
      filters: enrichedFilters,
    }),
    rt: () => ({
      rows: facts.map((fact) => ({
        id: fact.id,
        rakeNumber: fact.rakeNumber,
        wagonType: fact.wagonType,
        siding: fact.siding,
        oreType: fact.oreType,
        fNoteDate: fact.fNoteDate,
        customer: fact.customer,
        destination: fact.destination,
        tonnage: fact.tonnage,
        offerDate: fact.offerDate,
        completionDate: fact.completionDate,
        glh: fact.glh,
        date: fact.date,
        completedOn: fact.completedOn,
      })),
      filters: enrichedFilters,
    }),
    demurrage: () => ({ rows: buildDemurrageRows(facts, delays), filters: enrichedFilters }),
    daily: () => ({ rows: buildDailyRows(facts, delays), filters: baseConfig.filters }),
    "siding-performance": () => ({
      rows: buildSidingPerformanceRows(facts),
      filters: enrichedFilters,
    }),
    "load-adjustment": () => ({
      rows: buildLoadAdjustmentRows(ePermits),
      filters: baseConfig.filters,
    }),
    "sick-wagon": () => ({ rows: buildSickWagonRows(facts), filters: enrichedFilters }),
    "rake-incentive": () => ({
      rows: buildRakeIncentiveRows(facts),
      filters: baseConfig.filters,
    }),
    "delay-analysis": () => ({
      rows: buildDelayRows(delays),
      filters: baseConfig.filters,
    }),
    "railway-approval-audit": () => ({
      rows: buildApprovalAuditRows(approvals, loadingRecords),
      filters: baseConfig.filters,
    }),
    "e-demand-summary": () => ({
      rows: buildEDemandRows(eDemands),
      filters: baseConfig.filters,
    }),
  };

  const builder = builders[reportId];
  if (!builder) {
    return { rows: baseConfig.rows ?? [], filters: baseConfig.filters ?? [] };
  }

  return builder();
}
