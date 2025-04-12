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
import { Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("status")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Cargar el estado del juego desde localStorage
    const savedGameState = localStorage.getItem("zombieGameState")

    if (savedGameState) {
      setGameState(JSON.parse(savedGameState))
    }

    setLoading(false)
  }, [])

  // Si no hay estado de juego guardado, redirigir a la página principal
  useEffect(() => {
    if (!loading && !gameState) {
      router.push("/")
    }
  }, [loading, gameState, router])

  const handleSaveGame = () => {
    if (!gameState) return

    // Actualizar la fecha de guardado
    const updatedGameState = {
      ...gameState,
      saveDate: new Date().toISOString(),
    }

    // Guardar en localStorage
    localStorage.setItem("zombieGameState", JSON.stringify(updatedGameState))
    setGameState(updatedGameState)

    toast({
      title: "Juego guardado",
      description: "Tu progreso ha sido guardado correctamente.",
    })
  }

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    if (!gameState) return

    setGameState({
      ...gameState,
      character: updatedCharacter,
      saveDate: new Date().toISOString(),
    })
  }

  // Modificar la función handleUpdateInventory para evitar actualizaciones innecesarias
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

    // Actualizar el estado del juego completo
    const updatedGameState = {
      ...gameState,
      character: updatedCharacter,
      saveDate: new Date().toISOString(),
    }

    setGameState(updatedGameState)

    // También guardar en localStorage para persistencia inmediata
    localStorage.setItem("zombieGameState", JSON.stringify(updatedGameState))
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
      <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center">
        <p>Cargando juego...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <GameHeader character={gameState.character} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="status">Estado</TabsTrigger>
                <TabsTrigger value="health">Salud</TabsTrigger>
                <TabsTrigger value="backpack">Mochila</TabsTrigger>
                <TabsTrigger value="events">Eventos</TabsTrigger>
              </TabsList>

              <Card className="border-zinc-700 bg-zinc-800">
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

                  <TabsContent value="events">
                    <GameEvents
                      character={gameState.character}
                      onHealthChange={handleUpdateHealth}
                      onInventoryChange={handleUpdateInventory}
                    />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => router.push("/")} className="border-zinc-700 text-zinc-300">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Menú
              </Button>

              <Button onClick={handleSaveGame} className="bg-green-600 hover:bg-green-700 text-white font-medium">
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
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold text-white mb-3">Información del Juego</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-400">Versión:</p>
              <p className="text-white">{gameState.gameVersion}</p>
            </div>

            <div>
              <p className="text-gray-400">Último guardado:</p>
              <p className="text-white">{new Date(gameState.saveDate).toLocaleString()}</p>
            </div>

            <div className="pt-3 border-t border-gray-700">
              <p className="text-gray-400 mb-2">Objetos destacados:</p>
              <div className="space-y-2">
                {gameState.character.inventory.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-xl mr-2">{item.image}</span>
                    <span className="text-white text-xs">{item.name}</span>
                  </div>
                ))}
                {gameState.character.inventory.length === 0 && (
                  <p className="text-gray-500 italic text-xs">Mochila vacía</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold text-white mb-3">Consejos</h3>

          <div className="space-y-2 text-sm text-gray-300">
            <p>• Mantén siempre medicinas para emergencias</p>
            <p>• Conserva munición para situaciones críticas</p>
            <p>• Revisa tu salud regularmente</p>
            <p>• Guarda tu progreso con frecuencia</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
