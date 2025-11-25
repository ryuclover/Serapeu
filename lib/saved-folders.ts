export type SavedFolder = {
  id: string
  name: string
  tutorialIds: string[]
}

const STORAGE_KEY = (userId: string) => `saved-folders-${userId}`

export function getUserFolders(userId: string): SavedFolder[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(userId))
    if (!raw) return []
    return JSON.parse(raw) as SavedFolder[]
  } catch {
    return []
  }
}

export function saveUserFolders(userId: string, folders: SavedFolder[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(folders))
}

export function addTutorialToFolder(
  userId: string,
  folderId: string,
  tutorialId: string,
) {
  const folders = getUserFolders(userId)
  const updated = folders.map((f) =>
    f.id === folderId && !f.tutorialIds.includes(tutorialId)
      ? { ...f, tutorialIds: [...f.tutorialIds, tutorialId] }
      : f,
  )
  saveUserFolders(userId, updated)
}

export function removeTutorialFromFolder(
  userId: string,
  folderId: string,
  tutorialId: string,
) {
  const folders = getUserFolders(userId)
  const updated = folders.map((f) =>
    f.id === folderId
      ? { ...f, tutorialIds: f.tutorialIds.filter((id) => id !== tutorialId) }
      : f,
  )
  saveUserFolders(userId, updated)
}
