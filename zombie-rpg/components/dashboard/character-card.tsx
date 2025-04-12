"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { CharacterSummary } from "@/lib/storage"
import { Heart, Trash2, Play, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface CharacterCardProps {
  character: CharacterSummary
  onDelete: (id: string) => void
}

export default function CharacterCard({ character, onDelete }: CharacterCardProps) {
  // Calcular el porcentaje de salud
  const healthPercentage = (character.health.current / character.health.max) * 100

  // Determinar el color de la barra de salud según el porcentaje
  const getHealthColor = () => {
    if (healthPercentage <= 25) return "bg-[#a13b29]"
    if (healthPercentage <= 50) return "bg-[#d9a646]"
    return "bg-[#6a9955]"
  }

  // Formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="border-[#5c3c2e] bg-[#2a1f1a] hover:bg-[#352a24] transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#3c2a20] flex items-center justify-center border-2 border-[#a13b29] mr-4 relative overflow-hidden">
            {character.imageData ? (
              <Image
                src={character.imageData || "/placeholder.svg"}
                alt={character.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">{character.name.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#ff6a39]">{character.name}</h3>
            <div className="flex items-center text-[#c4a59d] text-sm">
              <Badge className="mr-2 bg-[#3c2a20] text-[#ff6a39] border-[#5c3c2e]">Nivel {character.level}</Badge>
              <Calendar className="h-3 w-3 mr-1" />
              <span>Última partida: {formatDate(character.lastUpdated)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Heart className="h-4 w-4 text-[#a13b29] mr-1" />
              <span className="text-sm text-[#c4a59d]">Salud</span>
            </div>
            <span className="text-sm font-medium text-white">
              {character.health.current}/{character.health.max}
            </span>
          </div>
          <Progress value={healthPercentage} className="h-2 bg-[#3c2a20]" indicatorClassName={getHealthColor()} />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <Button variant="destructive" size="sm" onClick={() => onDelete(character.id)}>
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar
        </Button>

        <Button className="bg-[#a13b29] hover:bg-[#c04a33]" size="sm" asChild>
          <Link href={`/game/${character.id}`}>
            <Play className="h-4 w-4 mr-1" />
            Jugar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
