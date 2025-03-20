/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'admin' | 'student' | 'company'} role
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} JobPosting
 * @property {string} id
 * @property {string} companyName
 * @property {string} role
 * @property {string} salary
 * @property {Object} eligibility
 * @property {number} eligibility.cgpa
 * @property {string[]} eligibility.branches
 * @property {number} eligibility.backlogLimit
 * @property {string} deadline
 * @property {'open' | 'closed'} status
 * @property {string} description
 */

/**
 * @typedef {Object} Student
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} branch
 * @property {number} cgpa
 * @property {string} [resumeUrl]
 * @property {'placed' | 'unplaced'} placementStatus
 * @property {string[]} applications - Job IDs
 */
