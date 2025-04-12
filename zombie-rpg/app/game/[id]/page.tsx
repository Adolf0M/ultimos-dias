"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import type { GameState, Character, GameItem } from "@/types/game"
import GameHeader from "@/components/game/game-header"
import CharacterStatus from "@/components/game/character-status"
import CharacterBackpack from "@/components/game/character-backpack"
import GameHealth from "@/components/game/game-health"
import GameEvents from "@/components/game/game-events"
import GameLevel from "@/components/game/game-level"
import GameSkills from "@/components/game/game-skills"
import { Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getGameState, saveGameState } from "@/lib/storage"

export default function GamePage({ params }: { params: { id: string } }) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("status")
  const router = useRouter()
  const { toast } = useToast()
  const characterId = params.id

  useEffect(() => {
    // Cargar el estado del juego desde localStorage usando el ID
    const savedGameState = getGameState(characterId)

    if (savedGameState) {
      // Asegurarse de que el personaje tenga un nivel
      if (!savedGameState.character.level) {
        savedGameState.character.level = 1
        saveGameState(savedGameState)
      }
      setGameState(savedGameState)
    }

    setLoading(false)
  }, [characterId])

  // Si no hay estado de juego guardado, redirigir a la página principal
  useEffect(() => {
    if (!loading && !gameState) {
      toast({
        title: "Error",
        description: "No se encontró el personaje solicitado.",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [loading, gameState, router, toast])

  const handleSaveGame = () => {
    if (!gameState) return

    // Actualizar la fecha de guardado
    const updatedGameState = {
      ...gameState,
      saveDate: new Date().toISOString(),
      character: {
        ...gameState.character,
        lastUpdated: new Date().toISOString(),
      },
    }

    // Guardar en localStorage usando la nueva función
    saveGameState(updatedGameState)
    setGameState(updatedGameState)

    toast({
      title: "Juego guardado",
      description: "Tu progreso ha sido guardado correctamente.",
    })
  }

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    if (!gameState) return

    const updatedGameState = {
      ...gameState,
      character: updatedCharacter,
      saveDate: new Date().toISOString(),
    }

    setGameState(updatedGameState)
    saveGameState(updatedGameState)
  }

  const handleUpdateInventory = (newInventory: GameItem[]) => {
    if (!gameState) return

    // Verificar si el inventario ha cambiado realmente
    const inventoryChanged = JSON.stringify(gameState.character.inventory) !== JSON.stringify(newInventory)

    if (!inventoryChanged) return

    const updatedCharacter = {
      ...gameState.character,
      inventory: newInventory,
      lastUpdated: new Date().toISOString(),
    }

    handleUpdateCharacter(updatedCharacter)
  }

  // Escuchar eventos de cambio de salud desde componentes hijos
  useEffect(() => {
    const handleHealthChangeEvent = (event: CustomEvent) => {
      if (event.detail && event.detail.current !== undefined && event.detail.max !== undefined) {
        handleUpdateHealth(event.detail.current, event.detail.max)
      }
    }

    // Escuchar el nuevo evento character-health-update
    window.addEventListener("character-health-update", handleHealthChangeEvent as EventListener)

    return () => {
      window.removeEventListener("character-health-update", handleHealthChangeEvent as EventListener)
    }
  }, [gameState]) // Añadir gameState como dependencia para que se actualice el listener

  const handleUpdateHealth = (current: number, max: number) => {
    if (!gameState) return

    const updatedCharacter = {
      ...gameState.character,
      health: {
        current,
        max,
      },
      lastUpdated: new Date().toISOString(),
    }

    handleUpdateCharacter(updatedCharacter)
  }

  if (loading || !gameState) {
    return (
      <div className="min-h-screen bg-[#1a1412] text-zinc-100 flex items-center justify-center">
        <p>Cargando juego...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#1a1412] text-zinc-100 py-8 px-4 bg-[url('/bg-texture.png')] bg-repeat">
      <div className="max-w-6xl mx-auto">
        <GameHeader character={gameState.character} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-6 mb-6 bg-[#3c2a20]">
                <TabsTrigger value="status" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
                  Estado
                </TabsTrigger>
                <TabsTrigger value="health" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
                  Salud
                </TabsTrigger>
                <TabsTrigger
                  value="backpack"
                  className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white"
                >
                  Mochila
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
                  Habilidades
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
                  Eventos
                </TabsTrigger>
                <TabsTrigger value="level" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
                  Nivel
                </TabsTrigger>
              </TabsList>

              <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
                <CardContent className="pt-6">
                  <TabsContent value="status">
                    <CharacterStatus character={gameState.character} />
                  </TabsContent>

                  <TabsContent value="health">
                    <GameHealth character={gameState.character} onHealthChange={handleUpdateHealth} />
                  </TabsContent>

                  <TabsContent value="backpack">
                    <CharacterBackpack character={gameState.character} onInventoryChange={handleUpdateInventory} />
                  </TabsContent>

                  <TabsContent value="skills">
                    <GameSkills character={gameState.character} />
                  </TabsContent>

                  <TabsContent value="events">
                    <GameEvents
                      character={gameState.character}
                      onHealthChange={handleUpdateHealth}
                      onInventoryChange={handleUpdateInventory}
                    />
                  </TabsContent>

                  <TabsContent value="level">
                    <GameLevel character={gameState.character} onCharacterUpdate={handleUpdateCharacter} />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-[#5c3c2e] hover:bg-[#3c2a20] bg-[#1a1412] text-[#c4a59d]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Dashboard
              </Button>

              <Button onClick={handleSaveGame} className="bg-[#a13b29] hover:bg-[#c04a33] text-white font-medium">
                <Save className="mr-2 h-4 w-4" />
                Guardar Juego
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <GameSidebar gameState={gameState} />
          </div>
        </div>
      </div>
    </main>
  )
}

function GameSidebar({ gameState }: { gameState: GameState }) {
  return (
    <div className="space-y-4">
      <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold text-[#ff6a39] mb-3">Información del Juego</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[#c4a59d]">Versión:</p>
              <p className="text-white">{gameState.gameVersion}</p>
            </div>

            <div>
              <p className="text-[#c4a59d]">Último guardado:</p>
              <p className="text-white">{new Date(gameState.saveDate).toLocaleString()}</p>
            </div>

            <div className="pt-3 border-t border-[#5c3c2e]">
              <p className="text-[#c4a59d] mb-2">Objetos destacados:</p>
              <div className="space-y-2">
                {gameState.character.inventory.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-xl mr-2">{item.image}</span>
                    <span className="text-white text-xs">{item.name}</span>
                  </div>
                ))}
                {gameState.character.inventory.length === 0 && (
                  <p className="text-[#8a7a72] italic text-xs">Mochila vacía</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold text-[#ff6a39] mb-3">Consejos</h3>

          <div className="space-y-2 text-sm text-[#c4a59d]">
            <p>• Mantén siempre medicinas para emergencias</p>
            <p>• Conserva munición para situaciones críticas</p>
            <p>• Revisa tu salud regularmente</p>
            <p>• Guarda tu progreso con frecuencia</p>
            <p>• Sube de nivel al comenzar un nuevo capítulo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
