/// <reference path="./types.d.ts" />

let getCollectionsAsync

async function preimport() {
  const module = await import(chrome.runtime.getURL("js/storage.js"))
  getCollectionsAsync = module.getCollectionsAsync
}

console.log("custom extension is running on games page")

const ATTRIBUTE_COLLECTION = "x-collection"

/**
 * @type {Collection[]}
 */
let savedCollections

/**
 *
 * @param {string} id
 */
function gameIdToSavedCollection(id) {
  for (let i = 0; i < savedCollections.length; i++) {
    if (savedCollections[i].games.includes(id)) {
      return savedCollections[i]
    }
  }
  return null
}

/**
 *
 * @param {string} href
 * @returns
 */
function createCheckmark(href) {
  const a = document.createElement("a")
  a.className = "icon icon-checkmark"
  a.style.color = "green"
  a.style.fontSize = "25px"
  a.href = href
  a.target = "_blank"
  return a
}

/**
 *
 * @param {string} href
 * @param {string} title
 */
function createLabel(href, title) {
  const htmlText = `<div style="position: absolute; top: 10px; left: 10px; opacity: 1; width: fit-content;" class="game_cell_tools">
  <a class="action_btn add_to_collection_btn" href="${href}" target="_blank" style="border-color: #28a745;">${title}</a>
  </div>`
  const doc = new DOMParser().parseFromString(htmlText, "text/html")
  return doc.body.firstElementChild.cloneNode(true)
}

/**
 *
 * @param {HTMLElement} element
 * @param {Collection} collection
 */
function modifyElement(element, collection) {
  if (element.hasAttribute(ATTRIBUTE_COLLECTION)) {
    return
  }

  element.setAttribute(ATTRIBUTE_COLLECTION, true)

  const href = `https://itch.io/c/${collection.id}`

  const container = element.querySelector("div.game_author")
  container.prepend(createCheckmark(href))

  const container2 = element.querySelector("div.game_thumb")
  container2.appendChild(createLabel(href, collection.name))
}

function tick() {
  const gameCells = Array.from(document.querySelectorAll("div.game_cell"))
  gameCells.forEach((cell) => {
    const id = cell.getAttribute("data-game_id")
    const collection = gameIdToSavedCollection(id)
    if (collection !== null) {
      modifyElement(cell, collection)
    }
  })
}

async function main() {
  await preimport()
  savedCollections = await getCollectionsAsync()
  console.log(savedCollections)

  setInterval(() => {
    tick()
  }, 100)
}

main()
