const SAVE_KEY = "collections"

/**
 * @typedef {Object} Collection
 * @property {string} id
 * @property {name} name
 * @property {number} timestamp
 * @property {string[]} games
 */

/**
 *
 * @returns {Promise<Collection[]>}
 */
export function getCollectionsAsync() {
  return new Promise((resolve) =>
    chrome.storage.local.get(SAVE_KEY, (data) => resolve(data[SAVE_KEY] || []))
  )
}

/**
 *
 * @param {Collection[]} collections
 */
export function saveCollections(collections) {
  chrome.storage.local.set({ [SAVE_KEY]: collections })
}
