import { operationalRepository } from "./operationalRepository";
import {
  fromRakeApiPayload,
  loadingRecordFromRake,
  toRakeApiPayload,
} from "../../types/transforms";

export const rakeService = {
  list: () => operationalRepository.listRakes(),
  getById: (id) => operationalRepository.getRakeById(id),
  getByNumber: (rakeNumber) => operationalRepository.getRakeByNumber(rakeNumber),
  create: (payload) =>
    operationalRepository.upsertRake(fromRakeApiPayload(payload)),
  update: (payload) =>
    operationalRepository.upsertRake(fromRakeApiPayload(payload)),
  remove: (id) => operationalRepository.deleteRake(id),
  toPayload: toRakeApiPayload,
  fromPayload: fromRakeApiPayload,
  ensureLoadingRecord: async (rakeId) => {
    const rake = await operationalRepository.getRakeById(rakeId);
    if (!rake) return null;
    let loading = await operationalRepository.getLoadingByRakeId(rakeId);
    if (!loading) {
      loading = await operationalRepository.upsertLoading(
        loadingRecordFromRake(rake),
      );
    }
    return { rake, loading };
  },
};

export const loadingService = {
  list: () => operationalRepository.listLoading(),
  getById: (id) => operationalRepository.getLoadingById(id),
  getByRakeId: (rakeId) => operationalRepository.getLoadingByRakeId(rakeId),
  upsert: (record) => operationalRepository.upsertLoading(record),
};

export const delayService = {
  list: () => operationalRepository.listDelays(),
  getById: (id) => operationalRepository.getDelayById(id),
  getByRakeId: (rakeId) => operationalRepository.getDelaysByRakeId(rakeId),
  getByLoadingId: (loadingId) =>
    operationalRepository.getDelaysByLoadingId(loadingId),
  upsert: (record) => operationalRepository.upsertDelay(record),
};

export const upcomingService = {
  list: () => operationalRepository.listUpcomingDrafts(),
  save: (drafts) => operationalRepository.saveUpcomingDrafts(drafts),
};

export const approvalService = {
  list: () => operationalRepository.listApprovals(),
  getById: (id) => operationalRepository.getApprovalById(id),
  getByLoadingId: (loadingId) => operationalRepository.getApprovalByLoadingId(loadingId),
  completeLoading: (loadingId) => operationalRepository.completeLoading(loadingId),
  submitDecision: (approvalId, department, decision) =>
    operationalRepository.submitApprovalDecision(approvalId, department, decision),
  updateWagonManifest: (approvalId, manifest) =>
    operationalRepository.updateApprovalWagonManifest(approvalId, manifest),
};

export const edemandService = {
  listDemands: () => operationalRepository.listEDemands(),
  saveDemands: (demands) => operationalRepository.saveEDemands(demands),
  upsertDemand: (demand) => operationalRepository.upsertEDemand(demand),
  deleteDemand: (id) => operationalRepository.deleteEDemand(id),
  listPermits: () => operationalRepository.listEPermits(),
  updatePermit: (id, patch, updatedBy) =>
    operationalRepository.updateEPermit(id, patch, updatedBy),
};
