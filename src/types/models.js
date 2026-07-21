/**
 * @typedef {Object} AuthUser
 * @property {string} name
 * @property {string} username
 * @property {string} role
 */

/**
 * @typedef {Object} AuthTokens
 * @property {string|null} access
 * @property {string|null} refresh
 */

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
 * @property {string} offerTime
 * @property {string} placementTime
 * @property {string} adjustOfferFor
 * @property {string} adjustedOfferTime
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
 * @property {string} placementTime
 * @property {string} offerTime
 * @property {string} operatorFtp
 * @property {string} wagonSick
 * @property {string} tonnage
 * @property {string} stockpile
 * @property {string} completionTime
 * @property {string} clearanceTime
 * @property {number} overloadedWagons
 * @property {number} weightRemoved
 * @property {boolean} isDisabled
 */

/**
 * @typedef {Object} DelayRecord
 * @property {string} id
 * @property {string} rakeId
 * @property {string} loadingId
 * @property {string} rakeNumber
 * @property {string} category
 * @property {string} startTime
 * @property {string} endTime
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
