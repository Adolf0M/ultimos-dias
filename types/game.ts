// Tipos para el sistema de juego

export type ItemType = "weapon" | "ammo" | "food" | "water" | "medicine" | "tool" | "resource" | "clothing" | "misc"

export type AmmoType = "9mm" | "12gauge" | "556" | "762" | "arrow" | "bolt"

export interface GameItem {
  id: string
  name: string
  description: string
  type: ItemType
  stackable: boolean
  quantity: number
  maxStack: number
  weight: number
  image: string
  usable: boolean
  consumable: boolean
  ammoType?: AmmoType
  healthRestore?: number
  damage?: number
}

export interface CustomSkill {
  id: string
  name: string
  description: string
  improved?: boolean
  improvedEffect?: string
}

export interface ImprovedSkill {
  skillId: string
  effect: string
}

export interface Character {
  id: string // Añadido ID único para cada personaje
  name: string
  age: number
  background: string
  appearance: string
  imageData?: string | null // Añadir campo para la imagen en base64
  level?: number // Añadido campo para el nivel del personaje
  stats: {
    fuerza: number
    agilidad: number
    inteligencia: number
    resistencia: number
    carisma: number
  }
  personalSkills: {
    id: string
    name: string
    points: number
  }[]
  specialSkills: string[]
  customSkills?: CustomSkill[] // Habilidades personalizadas creadas por el jugador
  improvedSkills?: ImprovedSkill[] // Registro de habilidades mejoradas
  health: {
    current: number
    max: number
  }
  inventory: GameItem[]
  inventoryCapacity: number
  createdAt: string
  lastUpdated: string
}

export interface GameState {
  character: Character
  gameVersion: string
  saveDate: string
}
