/// <reference path="./types.d.ts" />

let getCollectionsAsync, saveCollections

async function preimport() {
  const module = await import(chrome.runtime.getURL("js/storage.js"))
  getCollectionsAsync = module.getCollectionsAsync
  saveCollections = module.saveCollections
}

console.log("custom extension is running on my-collections page")

const ATTRIBUTE_COLLECTION_ID = "x-collection-id"
const ATTRIBUTE_COLLECTION_NAME = "x-collection-name"

function createCollectionFetchUrl(id, page) {
  return `https://itch.io/my-collections/more-games/${id}?page=${page}`
}

/**
 *
 * @param {MouseEvent} event
 */
async function onClickFetchCollection(event) {
  const btn = event.currentTarget
  const collectionId = btn.getAttribute(ATTRIBUTE_COLLECTION_ID)
  const collectionName = btn.getAttribute(ATTRIBUTE_COLLECTION_NAME)

  const savedCollections = await getCollectionsAsync()

  let page = 0
  const games = []

  while (true) {
    const url = createCollectionFetchUrl(collectionId, page++)
    const response = await fetch(url)
    const data = await response.json()
    const doc = new DOMParser().parseFromString(data["games"], "text/html")
    const gameCells = Array.from(doc.body.querySelectorAll("div.game_cell"))
    const ids = gameCells.map((cell) => cell.getAttribute("data-game_id"))
    games.push(...ids)
    if (data["has_more"] === false) {
      break
    }
  }

  const uniqueGames = Array.from(new Set(games).values())

  const collection = {
    id: collectionId,
    name: collectionName,
    timestamp: Date.now(),
    games: uniqueGames,
  }

  const index = savedCollections.findIndex((c) => c.id == collection.id)
  if (index === -1) {
    saveCollections([...savedCollections, collection])
  } else {
    savedCollections[index] = collection
    saveCollections(savedCollections)
  }

  console.log(uniqueGames.length)
}

/**
 *
 * @param {Element} section
 */
function getCollectionId(section) {
  const sectionHref = section.querySelector("div.list_header > h2 > a.collection_title").href
  const id = /(\d+)/.exec(sectionHref)[0]
  return id
}

/**
 *
 * @param {Element} section
 */
function getCollectionName(section) {
  const sectionHref = section.querySelector("div.list_header > h2 > a.collection_title").href
  const name = sectionHref.split("/")[5]
  return name
}

/**
 *
 * @param {Element} section
 * @param {Collection} collection
 */
function adjustSectionElement(section, collection) {
  const container = section.querySelector("div.list_header > div.list_tools")

  const btn = document.createElement("button")
  btn.textContent = "Fetch"
  btn.setAttribute(ATTRIBUTE_COLLECTION_ID, collection.id)
  btn.setAttribute(ATTRIBUTE_COLLECTION_NAME, collection.name)
  btn.addEventListener("click", onClickFetchCollection)
  container.appendChild(btn)

  const span = document.createElement("span")
  span.textContent = `(${collection.games.length})`
  container.appendChild(span)
}

async function main() {
  await preimport()
  const savedCollections = await getCollectionsAsync()
  console.log(savedCollections)

  const sections = Array.from(document.querySelectorAll("section.game_collection"))
  sections.forEach((element) => {
    const collectionId = getCollectionId(element)
    const collectionName = getCollectionName(element)
    const index = savedCollections.findIndex((c) => c.id === collectionId)
    if (index === -1) {
      const newCollection = {
        id: collectionId,
        name: collectionName,
        games: [],
        timestamp: Date.now(),
      }
      adjustSectionElement(element, newCollection)
    } else {
      const collection = savedCollections[index]
      collection.name = collectionName
      adjustSectionElement(element, collection)
    }
  })
}

main()
