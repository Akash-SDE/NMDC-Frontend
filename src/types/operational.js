/**
 * @typedef {Object} Rake
 * @property {string} id
 * @property {number} sno
 * @property {string} rakeNumber
 * @property {string} wagonType
 * @property {number} wagonCount
 * @property {string} wagonSupply
 * @property {string} siding
 * @property {string} route
 * @property {string} oreType
 * @property {string} customer
 * @property {string} oreTypeCustomer
 * @property {string} destination
 * @property {string} fNote
 * @property {string|null} offerTime
 * @property {string|null} placementTime
 * @property {string|null} adjustOfferFor
 * @property {string|null} adjustedOfferTime
 * @property {boolean} isDisabled
 */

/**
 * @typedef {Object} LoadingRecord
 * @property {string} id
 * @property {string} rakeId
 * @property {string} rakeNumber
 * @property {string} wagonSupply
 * @property {string} siding
 * @property {string} route
 * @property {string} customer
 * @property {string} destination
 * @property {string} fNote
 * @property {string|null} placementTime
 * @property {string|null} offerTime
 * @property {string} operatorFtp
 * @property {string} wagonSick
 * @property {string} tonnage
 * @property {string} stockpile
 * @property {string|null} completionTime
 * @property {string|null} clearanceTime
 * @property {number} overloadedWagons
 * @property {number} weightRemoved
 * @property {boolean} isDisabled
 * @property {string} [status]
 * @property {boolean} [isSubmitted]
 * @property {string} [manualLoadingTrack] - R3 or R4 for manual loading track (rake incentive report)
 */

/**
 * @typedef {Object} EDemandRecord
 * @property {number} id
 * @property {string} fNote
 * @property {string} date
 * @property {string} customer
 * @property {string} destination
 * @property {string} oreType
 * @property {string} salesType
 */

/**
 * @typedef {Object} EPermitRecord
 * @property {number} id
 * @property {string} loadingId
 * @property {string} rakeNumber
 * @property {string} customer
 * @property {string} stockpile
 * @property {number} quantity
 * @property {string|null} completedOn
 * @property {string} ePermitNumber
 * @property {string} railwayTransitPass
 * @property {string} updatedBy
 * @property {string|null} [updatedAt]
 */

/**
 * @typedef {Object} DelayRecord
 * @property {string} id
 * @property {string} rakeId
 * @property {string} loadingId
 * @property {string} rakeNumber
 * @property {string} category
 * @property {string|null} startTime
 * @property {string|null} endTime
 * @property {string} reason
 * @property {string} reportedBy
 * @property {boolean} isDisabled
 */

/**
 * @typedef {Object} UpcomingRakeDraft
 * @property {string} id
 * @property {string} oreType
 * @property {string} siding
 * @property {string} destination
 * @property {string} placementTime
 */

export {};
