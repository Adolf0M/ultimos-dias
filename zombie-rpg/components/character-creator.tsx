"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import CharacterBasics from "./character-basics"
import CharacterStats from "./character-stats"
import CharacterPersonalSkills from "./character-personal-skills"
import CharacterSkills from "./character-skills"
import CharacterHealth from "./character-health"
import CharacterPreview from "./character-preview"
import CharacterInventory from "./character-inventory"
import CharacterComplete from "./character-complete"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Character, GameItem, GameState } from "@/types/game"
import { createItemCopy } from "@/data/items"
import { generateCharacterId, saveGameState } from "@/lib/storage"
import CharacterImageUpload from "./character-image-upload"

export type PersonalSkill = {
  id: string
  name: string
  points: number
}

export type CharacterType = {
  name: string
  age: number
  background: string
  appearance: string
  imageData?: string | null
  stats: {
    fuerza: number
    agilidad: number
    inteligencia: number
    resistencia: number
    carisma: number
  }
  personalSkills: PersonalSkill[]
  selectedPersonalSkillIds: string[]
  skills: string[]
  inventory: string[]
  pointsLeft: number
  totalStatPoints: number
  personalSkillPointsLeft: number
  health: number
}

const initialCharacter: CharacterType = {
  name: "",
  age: 25,
  background: "",
  appearance: "",
  imageData: null,
  stats: {
    fuerza: 1,
    agilidad: 1,
    inteligencia: 1,
    resistencia: 1,
    carisma: 1,
  },
  personalSkills: [],
  selectedPersonalSkillIds: [],
  skills: [],
  inventory: [],
  pointsLeft: 5,
  totalStatPoints: 5,
  personalSkillPointsLeft: 5,
  health: 10,
}

export default function CharacterCreator() {
  const [character, setCharacter] = useState<CharacterType>(initialCharacter)

  const [activeTab, setActiveTab] = useState("basics")
  const [isSaving, setIsSaving] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [showHealth, setShowHealth] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Actualizar los puntos disponibles para habilidades personales cuando cambia la inteligencia
  useEffect(() => {
    const totalPersonalSkillPoints = character.stats.inteligencia * 5
    const usedPoints = character.personalSkills.reduce((total, skill) => total + skill.points, 0)

    // Asegurarse de que personalSkillPointsLeft nunca sea negativo
    const newPointsLeft = Math.max(0, totalPersonalSkillPoints - usedPoints)

    updateCharacter({
      personalSkillPointsLeft: newPointsLeft,
    })
  }, [character.stats.inteligencia, character.personalSkills])

  // Calcular la salud basada en la resistencia
  useEffect(() => {
    const baseHealth = 10
    const bonusHealth = Math.max(0, character.stats.resistencia - 2)

    updateCharacter({
      health: baseHealth + bonusHealth,
    })
  }, [character.stats.resistencia])

  // Guardar el personaje en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("zombieCharacter", JSON.stringify(character))
  }, [character])

  const updateCharacter = (updates: Partial<CharacterType>) => {
    setCharacter((prev) => ({ ...prev, ...updates }))
  }

  const handleSave = () => {
    // Validar que tenga exactamente 2 habilidades antes de guardar
    if (character.skills.length !== 2) {
      toast({
        title: "Error",
        description: "Debes seleccionar exactamente 2 habilidades especiales.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    // Simulate saving to server
    setTimeout(() => {
      setIsSaving(false)
      // Mostrar la pantalla de salud después de guardar
      setShowHealth(true)

      toast({
        title: "¡Personaje guardado!",
        description: `${character.name} está listo para revisar su salud inicial.`,
      })
    }, 1500)
  }

  useEffect(() => {
    // Cargar el personaje desde localStorage solo en el cliente
    const savedCharacter = localStorage.getItem("zombieCharacter")
    if (savedCharacter) {
      setCharacter(JSON.parse(savedCharacter))
    }
  }, [])

  const handleHealthContinue = () => {
    setShowHealth(false)
    setShowInventory(true)

    toast({
      title: "¡Salud calculada!",
      description: `${character.name} tiene ${character.health} puntos de vida iniciales.`,
    })
  }

  const handleInventorySave = () => {
    if (character.inventory.length > 2) {
      toast({
        title: "Error",
        description: "Solo puedes seleccionar un máximo de 2 objetos.",
        variant: "destructive",
      })
      return
    }

    // Convertir el personaje al formato final del juego
    const gameItems: GameItem[] = character.inventory
      .map((itemId) => createItemCopy(itemId))
      .filter((item): item is GameItem => item !== undefined)

    const gameCharacter: Character = {
      id: generateCharacterId(),
      name: character.name,
      age: character.age,
      background: character.background,
      appearance: character.appearance,
      imageData: character.imageData,
      stats: { ...character.stats },
      personalSkills: [...character.personalSkills],
      specialSkills: [...character.skills],
      health: {
        current: character.health,
        max: character.health,
      },
      inventory: gameItems,
      inventoryCapacity: 15,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    const newGameState: GameState = {
      character: gameCharacter,
      gameVersion: "1.0.0",
      saveDate: new Date().toISOString(),
    }

    // Guardar el estado del juego usando la nueva función
    saveGameState(newGameState)
    setGameState(newGameState)

    // Limpiar el personaje en creación
    localStorage.removeItem("zombieCharacter")

    // Mostrar la pantalla de finalización
    setShowInventory(false)
    setShowComplete(true)

    toast({
      title: "¡Personaje completado!",
      description: `${character.name} está listo para sobrevivir al apocalipsis zombie.`,
    })
  }

  const handleFinishCreation = () => {
    // Redirigir al dashboard
    router.push("/")
  }

  const canProceedToPersonalSkills = () => {
    return character.totalStatPoints === 10
  }

  const canProceedToSpecialSkills = () => {
    return character.selectedPersonalSkillIds.length === 6 && character.personalSkillPointsLeft === 0
  }

  const canSaveCharacter = () => {
    return character.name && character.skills.length === 2
  }

  // Si estamos mostrando la pantalla de finalización
  if (showComplete && gameState) {
    return <CharacterComplete gameState={gameState} onFinish={handleFinishCreation} />
  }

  // Si estamos mostrando la pantalla de salud
  if (showHealth) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-2 text-[#ff6a39] font-display">Salud Inicial</h1>
        <p className="text-xl text-center mb-8 text-[#c4a59d]">Revisa los puntos de vida con los que comenzarás</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CharacterHealth character={character} />

            <div className="flex justify-end mt-6">
              <Button onClick={handleHealthContinue} className="bg-[#a13b29] hover:bg-[#c04a33] text-white font-medium">
                Continuar al Equipamiento
              </Button>
            </div>
          </div>

          <div>
            <CharacterPreview character={character} />
          </div>
        </div>
      </div>
    )
  }

  // Si estamos mostrando la pantalla de inventario
  if (showInventory) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-2 text-[#ff6a39] font-display">Equipamiento Inicial</h1>
        <p className="text-xl text-center mb-8 text-[#c4a59d]">Selecciona hasta 2 objetos para comenzar tu aventura</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CharacterInventory character={character} updateCharacter={updateCharacter} />

            <div className="flex justify-end mt-6">
              <Button onClick={handleInventorySave} className="bg-[#a13b29] hover:bg-[#c04a33] text-white font-medium">
                Finalizar Creación
              </Button>
            </div>
          </div>

          <div>
            <CharacterPreview character={character} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-[#3c2a20]">
            <TabsTrigger value="basics" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
              Básicos
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
              Estadísticas
            </TabsTrigger>
            <TabsTrigger
              value="personalSkills"
              className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white"
            >
              Hab. Personales
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
              Hab. Especiales
            </TabsTrigger>
          </TabsList>
          <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
            <CardContent className="pt-6">
              <TabsContent value="basics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <CharacterBasics character={character} updateCharacter={updateCharacter} />
                  </div>
                  <div>
                    <CharacterImageUpload
                      initialImage={character.imageData}
                      onImageChange={(imageData) => updateCharacter({ imageData })}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="stats">
                <CharacterStats character={character} updateCharacter={updateCharacter} />
              </TabsContent>
              <TabsContent value="personalSkills">
                <CharacterPersonalSkills character={character} updateCharacter={updateCharacter} />
              </TabsContent>
              <TabsContent value="skills">
                <CharacterSkills character={character} updateCharacter={updateCharacter} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              const prevTab =
                activeTab === "basics"
                  ? "basics"
                  : activeTab === "stats"
                    ? "basics"
                    : activeTab === "personalSkills"
                      ? "stats"
                      : "personalSkills"
              setActiveTab(prevTab)
            }}
            disabled={activeTab === "basics"}
            className="border-[#5c3c2e] hover:bg-[#3c2a20] bg-[#1a1412] text-[#c4a59d]"
          >
            Anterior
          </Button>

          {activeTab === "skills" ? (
            <Button
              onClick={handleSave}
              disabled={isSaving || !canSaveCharacter()}
              className="bg-[#a13b29] hover:bg-[#c04a33] text-white font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Personaje
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                const nextTab = activeTab === "basics" ? "stats" : activeTab === "stats" ? "personalSkills" : "skills"
                setActiveTab(nextTab)
              }}
              disabled={
                (activeTab === "stats" && !canProceedToPersonalSkills()) ||
                (activeTab === "personalSkills" && !canProceedToSpecialSkills())
              }
              className="bg-[#a13b29] hover:bg-[#c04a33] text-white font-medium"
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>

      <div>
        <CharacterPreview character={character} />
      </div>
    </div>
  )
}
