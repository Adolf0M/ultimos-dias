"use client"

import { Button } from "@/components/ui/button"
import type { CharacterType } from "./character-creator"
import { Plus, Minus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CharacterStatsProps {
  character: CharacterType
  updateCharacter: (updates: Partial<CharacterType>) => void
}

export default function CharacterStats({ character, updateCharacter }: CharacterStatsProps) {
  const MAX_TOTAL_POINTS = 10
  const MAX_STAT_VALUE = 5

  const handleStatChange = (stat: keyof typeof character.stats, change: number) => {
    // Validaciones
    // 1. No permitir reducir por debajo de 1
    if (change < 0 && character.stats[stat] <= 1) return

    // 2. No permitir aumentar por encima de 5
    if (change > 0 && character.stats[stat] >= MAX_STAT_VALUE) return

    // 3. No permitir usar más de 10 puntos en total
    const newTotalPoints = character.totalStatPoints + change
    if (newTotalPoints > MAX_TOTAL_POINTS) return

    // 4. No permitir tener puntos negativos disponibles
    if (character.pointsLeft - change < 0) return

    // Si pasa todas las validaciones, actualizar
    const newStats = { ...character.stats }
    newStats[stat] = character.stats[stat] + change

    updateCharacter({
      stats: newStats,
      pointsLeft: character.pointsLeft - change,
      totalStatPoints: newTotalPoints,
    })
  }

  const statLabels = {
    fuerza: "Fuerza",
    agilidad: "Agilidad",
    inteligencia: "Inteligencia",
    resistencia: "Resistencia",
    carisma: "Carisma",
  }

  const statDescriptions = {
    fuerza: "Capacidad para levantar objetos pesados, hacer daño en combate cuerpo a cuerpo",
    agilidad: "Velocidad, reflejos y destreza",
    inteligencia: "Conocimiento, resolución de problemas y habilidades técnicas",
    resistencia: "Aguante físico, resistencia a enfermedades y toxinas",
    carisma: "Persuasión, liderazgo e influencia social",
  }

  const allPointsUsed = character.totalStatPoints === MAX_TOTAL_POINTS

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#ff6a39]">Puntos disponibles</h3>
        <span className={`text-xl font-bold ${allPointsUsed ? "text-[#6a9955]" : "text-[#d9a646]"}`}>
          {character.pointsLeft}
        </span>
      </div>

      <Alert className={`${allPointsUsed ? "bg-[#2c3c2e] border-[#6a9955]" : "bg-[#3c3020] border-[#d9a646]"} mb-4`}>
        <AlertCircle className={allPointsUsed ? "h-4 w-4 text-[#6a9955]" : "h-4 w-4 text-[#d9a646]"} />
        <AlertDescription className="text-[#c4a59d]">
          {allPointsUsed
            ? "¡Has distribuido todos los puntos correctamente!"
            : `Debes distribuir un total de ${MAX_TOTAL_POINTS} puntos entre todas las estadísticas, con un máximo de ${MAX_STAT_VALUE} puntos por estadística.`}
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {Object.entries(character.stats).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-white">{statLabels[key as keyof typeof statLabels]}</h4>
                <p className="text-xs text-[#c4a59d]">{statDescriptions[key as keyof typeof statDescriptions]}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30]"
                  onClick={() => handleStatChange(key as keyof typeof character.stats, -1)}
                  disabled={value <= 1}
                >
                  <Minus className="h-3 w-3" />
                  <span className="sr-only">Disminuir</span>
                </Button>
                <span className="w-8 text-center font-bold">{value}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30]"
                  onClick={() => handleStatChange(key as keyof typeof character.stats, 1)}
                  disabled={
                    character.pointsLeft <= 0 ||
                    value >= MAX_STAT_VALUE ||
                    character.totalStatPoints >= MAX_TOTAL_POINTS
                  }
                >
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Aumentar</span>
                </Button>
              </div>
            </div>
            <Progress
              value={(value / MAX_STAT_VALUE) * 100}
              className="h-2 bg-[#3c2a20]"
              indicatorClassName="bg-[#6a9955]"
            />
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#1a1412] rounded-lg border border-[#5c3c2e] mt-6">
        <h4 className="font-semibold text-[#ff6a39] mb-2">Consejos para estadísticas</h4>
        <ul className="text-sm text-[#c4a59d] space-y-1 list-disc pl-5">
          <li>Fuerza alta es ideal para personajes que luchan cuerpo a cuerpo</li>
          <li>Agilidad alta permite escapar más fácilmente de los zombies</li>
          <li>Inteligencia alta ayuda a crear objetos y resolver puzzles</li>
          <li>Resistencia alta te da más salud y resistencia a infecciones</li>
          <li>Carisma alto te ayuda a liderar grupos y negociar con otros supervivientes</li>
        </ul>
      </div>
    </div>
  )
}
