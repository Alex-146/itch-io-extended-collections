type Collection = {
  id: string
  name: string
  games: string[]
  timestamp: number
}

declare function getCollectionsAsync(): Promise<Collection[]>

declare function saveCollections(collections: Collection[]): void
