/**
 * Wagon record as received from Railway API manifest.
 * @typedef {Object} RailwayWagonRecord
 * @property {string} wagonNumber
 * @property {number} position
 * @property {string[]} [flags] - e.g. overloaded, uneven, sick
 */

/**
 * @typedef {Object} RailwayWagonManifest
 * @property {string} rakeNumber
 * @property {string} rakeId
 * @property {number} totalWagons
 * @property {RailwayWagonRecord[]} wagons
 * @property {string} [source] - API source label
 * @property {string} [receivedAt]
 */

/**
 * Wagon number list with derived count (stored on approval step).
 * @typedef {Object} WagonNumberList
 * @property {string[]} numbers
 * @property {number} count
 */

/**
 * Department-specific wagon inspection captured during approval.
 * @typedef {Object} DepartmentInspection
 * @property {string|null} [trackClearanceTime]
 * @property {string} [topViewRemarks]
 * @property {WagonNumberList} overloaded
 * @property {WagonNumberList} unevenRake
 * @property {WagonNumberList} uneven
 * @property {WagonNumberList} sick
 * @property {WagonNumberList} repair
 * @property {WagonNumberList} doorUnlock
 * @property {WagonNumberList} singleBar
 * @property {WagonNumberList} downsideCheck
 * @property {boolean|null} [doorUnlockPassed]
 * @property {boolean|null} [singleBarPassed]
 * @property {boolean|null} [downsideCheckPassed]
 */

export {};
