"use client"

import type { Character } from "@/types/game"
import { Progress } from "@/components/ui/progress"
import { Heart, Star } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

interface GameHeaderProps {
  character: Character
}

export default function GameHeader({ character }: GameHeaderProps) {
  const [health, setHealth] = useState({
    current: character.health.current,
    max: character.health.max,
  })

  // Actualizar el estado local cuando cambie la salud del personaje
  useEffect(() => {
    setHealth({
      current: character.health.current,
      max: character.health.max,
    })
  }, [character.health])

  // Escuchar eventos de actualización de salud
  useEffect(() => {
    const handleHealthUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.current !== undefined) {
        setHealth((prev) => ({
          current: event.detail.current,
          max: event.detail.max !== undefined ? event.detail.max : prev.max,
        }))
      }
    }

    window.addEventListener("character-health-update", handleHealthUpdate as EventListener)

    return () => {
      window.removeEventListener("character-health-update", handleHealthUpdate as EventListener)
    }
  }, [])

  // Calcular el porcentaje de salud
  const healthPercentage = (health.current / health.max) * 100

  // Determinar el color de la barra de salud según el porcentaje
  const getHealthColor = () => {
    if (healthPercentage <= 25) return "bg-[#a13b29]"
    if (healthPercentage <= 50) return "bg-[#d9a646]"
    return "bg-[#6a9955]"
  }

  return (
    <div className="bg-[#2a1f1a] border border-[#5c3c2e] rounded-lg p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#ff6a39] mr-2">{character.name}</h1>
              <div className="flex items-center bg-[#3c2a20] px-2 py-0.5 rounded-full">
                <Star className="h-3.5 w-3.5 text-[#d9a646] mr-1" />
                <span className="text-xs text-[#d9a646] font-medium">Nivel {character.level || 1}</span>
              </div>
            </div>
            <p className="text-[#c4a59d]">Superviviente</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial sm:w-48">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-[#a13b29] mr-1" />
                <span className="text-sm text-[#c4a59d]">Salud</span>
              </div>
              <span className="text-sm font-medium text-white">
                {health.current}/{health.max}
              </span>
            </div>
            <Progress value={healthPercentage} className="h-2 bg-[#3c2a20]" indicatorClassName={getHealthColor()} />
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <div className="bg-[#1a1412] px-3 py-1 rounded-md">
              <p className="text-xs text-[#c4a59d]">Fuerza</p>
              <p className="text-center font-bold text-white">{character.stats.fuerza}</p>
            </div>
            <div className="bg-[#1a1412] px-3 py-1 rounded-md">
              <p className="text-xs text-[#c4a59d]">Agilidad</p>
              <p className="text-center font-bold text-white">{character.stats.agilidad}</p>
            </div>
            <div className="bg-[#1a1412] px-3 py-1 rounded-md">
              <p className="text-xs text-[#c4a59d]">Resistencia</p>
              <p className="text-center font-bold text-white">{character.stats.resistencia}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
