import type { GameState } from "@/types/game"

// Clave para almacenar la lista de IDs de personajes
const CHARACTERS_KEY = "zombie_characters"

// Prefijo para las claves de personajes individuales
const CHARACTER_PREFIX = "zombie_character_"

// Interfaz para la información resumida de personajes
export interface CharacterSummary {
  id: string
  name: string
  createdAt: string
  lastUpdated: string
  level: number
  health: {
    current: number
    max: number
  }
  imageData?: string | null
}

// Generar un ID único para un nuevo personaje
export function generateCharacterId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Guardar un nuevo estado de juego
export function saveGameState(gameState: GameState): void {
  const { character } = gameState

  // Asegurarse de que el personaje tiene un ID
  if (!character.id) {
    character.id = generateCharacterId()
    gameState.character = character
  }

  // Guardar el estado del juego completo
  localStorage.setItem(`${CHARACTER_PREFIX}${character.id}`, JSON.stringify(gameState))

  // Actualizar la lista de personajes
  const characterIds = getCharacterIds()
  if (!characterIds.includes(character.id)) {
    characterIds.push(character.id)
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characterIds))
  }
}

// Obtener un estado de juego por ID
export function getGameState(characterId: string): GameState | null {
  const data = localStorage.getItem(`${CHARACTER_PREFIX}${characterId}`)
  return data ? JSON.parse(data) : null
}

// Eliminar un personaje
export function deleteCharacter(characterId: string): void {
  // Eliminar el estado del juego
  localStorage.removeItem(`${CHARACTER_PREFIX}${characterId}`)

  // Actualizar la lista de personajes
  const characterIds = getCharacterIds().filter((id) => id !== characterId)
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characterIds))
}

// Obtener la lista de IDs de personajes
export function getCharacterIds(): string[] {
  const data = localStorage.getItem(CHARACTERS_KEY)
  return data ? JSON.parse(data) : []
}

// Obtener resúmenes de todos los personajes
export function getAllCharacterSummaries(): CharacterSummary[] {
  const characterIds = getCharacterIds()

  return characterIds
    .map((id) => {
      const gameState = getGameState(id)
      if (!gameState) return null

      const { character } = gameState
      return {
        id: character.id,
        name: character.name,
        createdAt: character.createdAt,
        lastUpdated: character.lastUpdated,
        level: 1, // Por ahora todos son nivel 1
        health: character.health,
        imageData: character.imageData,
      }
    })
    .filter((summary): summary is CharacterSummary => summary !== null)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
}

// Migrar datos antiguos al nuevo formato (para compatibilidad)
export function migrateOldData(): void {
  // Verificar si hay un personaje en el formato antiguo
  const oldCharacter = localStorage.getItem("zombieCharacter")
  const oldGameState = localStorage.getItem("zombieGameState")

  if (oldGameState) {
    try {
      const gameState = JSON.parse(oldGameState) as GameState

      // Asegurarse de que el personaje tiene un ID
      if (!gameState.character.id) {
        gameState.character.id = generateCharacterId()
      }

      // Guardar en el nuevo formato
      saveGameState(gameState)

      // Eliminar datos antiguos
      localStorage.removeItem("zombieGameState")
    } catch (error) {
      console.error("Error migrando datos antiguos:", error)
    }
  } else if (oldCharacter) {
    // Si solo existe el personaje pero no el estado del juego, no hacer nada
    // Esto se manejará en la creación del personaje
    console.log("Existe un personaje en creación, no se migra")
  }
}
