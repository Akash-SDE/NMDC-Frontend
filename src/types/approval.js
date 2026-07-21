/**
 * @typedef {'pending'|'approved'|'rejected'} ApprovalStepStatus
 */

/**
 * @typedef {Object} ApprovalStep
 * @property {ApprovalStepStatus} status
 * @property {string|null} approvedBy
 * @property {string|null} approvedAt
 * @property {string} remarks
 * @property {string|null} [trackClearanceTime]
 * @property {string} [wagonObservations]
 * @property {import('./railwayWagon').DepartmentInspection} [inspection]
 */

/**
 * @typedef {Object} ApprovalHistoryEntry
 * @property {string} step
 * @property {string} action
 * @property {string} actor
 * @property {string} timestamp
 * @property {string} remarks
 */

/**
 * @typedef {Object} RailwayApprovalRequest
 * @property {string} id
 * @property {string} loadingId
 * @property {string} rakeId
 * @property {string} rakeNumber
 * @property {string} customer
 * @property {string} siding
 * @property {import('../constants/approval').APPROVAL_STATUS[keyof import('../constants/approval').APPROVAL_STATUS]} status
 * @property {ApprovalStep} operations
 * @property {ApprovalStep} commercial
 * @property {ApprovalStep} cw
 * @property {ApprovalHistoryEntry[]} history
 * @property {import('./railwayWagon').RailwayWagonManifest|null} [wagonManifest]
 * @property {string} createdAt
 * @property {string|null} updatedAt
 */

export {};
