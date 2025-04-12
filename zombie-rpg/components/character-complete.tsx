"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import type { GameState } from "@/types/game"
import CharacterStatus from "./game/character-status"
import CharacterBackpack from "./game/character-backpack"
import { Download, Play, Home } from "lucide-react"
import Link from "next/link"

interface CharacterCompleteProps {
  gameState: GameState
  onFinish?: () => void
}

export default function CharacterComplete({ gameState, onFinish }: CharacterCompleteProps) {
  const [activeTab, setActiveTab] = useState("status")

  const downloadCharacterJSON = () => {
    // Crear un blob con el JSON del personaje
    const blob = new Blob([JSON.stringify(gameState, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Crear un enlace temporal y hacer clic en él
    const a = document.createElement("a")
    a.href = url
    a.download = `${gameState.character.name.replace(/\s+/g, "_")}_character.json`
    document.body.appendChild(a)
    a.click()

    // Limpiar
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-[#ff6a39] mb-2 font-display">¡Personaje Completado!</h1>
        <p className="text-xl text-[#c4a59d]">
          {gameState.character.name} está listo para enfrentar el apocalipsis zombie
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-[#3c2a20]">
              <TabsTrigger value="status" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
                Estado del Personaje
              </TabsTrigger>
              <TabsTrigger value="backpack" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
                Mochila
              </TabsTrigger>
            </TabsList>

            <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
              <CardContent className="pt-6">
                <TabsContent value="status">
                  <CharacterStatus character={gameState.character} />
                </TabsContent>
                <TabsContent value="backpack">
                  <CharacterBackpack character={gameState.character} readOnly={true} />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={downloadCharacterJSON}
              className="border-[#5c3c2e] hover:bg-[#3c2a20] bg-[#1a1412] text-[#c4a59d]"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar JSON
            </Button>

            <div className="space-x-3">
              <Button
                variant="outline"
                onClick={onFinish}
                className="border-[#5c3c2e] hover:bg-[#3c2a20] bg-[#1a1412] text-[#c4a59d]"
              >
                <Home className="mr-2 h-4 w-4" />
                Ir al Dashboard
              </Button>

              <Button asChild className="bg-[#a13b29] hover:bg-[#c04a33] text-white font-medium">
                <Link href={`/game/${gameState.character.id}`}>
                  <Play className="mr-2 h-4 w-4" />
                  Comenzar Aventura
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
            <CardHeader>
              <CardTitle className="text-xl text-[#ff6a39]">Información del Juego</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-[#c4a59d]">
                <div>
                  <p className="font-semibold text-white">Versión del juego:</p>
                  <p>{gameState.gameVersion}</p>
                </div>

                <div>
                  <p className="font-semibold text-white">Fecha de creación:</p>
                  <p>{new Date(gameState.character.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <p className="font-semibold text-white">Última actualización:</p>
                  <p>{new Date(gameState.saveDate).toLocaleString()}</p>
                </div>

                <div className="pt-4 border-t border-[#5c3c2e]">
                  <p className="font-semibold text-white mb-2">Próximos pasos:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Explora el mundo apocalíptico</li>
                    <li>Busca recursos y supervivientes</li>
                    <li>Construye tu refugio</li>
                    <li>Sobrevive a las hordas de zombies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
