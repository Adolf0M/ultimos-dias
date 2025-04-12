"use client"

import type { Character } from "@/types/game"
import { Progress } from "@/components/ui/progress"
import { Skull, Brain, Zap, Heart, Users, BookOpen } from "lucide-react"
import Image from "next/image"

interface CharacterStatusProps {
  character: Character
}

export default function CharacterStatus({ character }: CharacterStatusProps) {
  const MAX_STAT_VALUE = 5
  const MAX_PERSONAL_SKILL_VALUE = 10

  const getStatIcon = (stat: string) => {
    switch (stat) {
      case "fuerza":
        return <Skull className="h-4 w-4" />
      case "inteligencia":
        return <Brain className="h-4 w-4" />
      case "agilidad":
        return <Zap className="h-4 w-4" />
      case "resistencia":
        return <Heart className="h-4 w-4" />
      case "carisma":
        return <Users className="h-4 w-4" />
      default:
        return null
    }
  }

  const getSpecialSkillName = (skillId: string) => {
    const skillMap: Record<string, string> = {
      combate_cuerpo: "Combate cuerpo a cuerpo",
      armas_fuego: "Armas de fuego",
      sigilo: "Sigilo",
      primeros_auxilios: "Primeros auxilios",
      supervivencia: "Supervivencia",
      mecanica: "Mecánica",
      liderazgo: "Liderazgo",
      negociacion: "Negociación",
      atletismo: "Atletismo",
      rastreo: "Rastreo",
      electronica: "Electrónica",
      cocina: "Cocina",
    }
    return skillMap[skillId] || skillId
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
        <div className="w-32 h-32 rounded-full bg-[#3c2a20] flex items-center justify-center border-4 border-[#a13b29] flex-shrink-0 relative overflow-hidden">
          {character.imageData ? (
            <Image src={character.imageData || "/placeholder.svg"} alt={character.name} fill className="object-cover" />
          ) : (
            <span className="text-5xl font-bold text-white">{character.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-[#ff6a39]">{character.name}</h2>
          <p className="text-[#c4a59d]">Edad: {character.age} años</p>
          {character.background && <p className="text-[#c4a59d] mt-2 max-w-xl">{character.background}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#ff6a39] border-b border-[#5c3c2e] pb-2">Salud</h3>

          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-[#a13b29] mr-2" />
              <span className="text-white font-semibold">Puntos de Vida</span>
            </div>
            <span className="text-white font-bold">
              {character.health.current}/{character.health.max}
            </span>
          </div>

          <Progress
            value={(character.health.current / character.health.max) * 100}
            className="h-3 bg-[#3c2a20]"
            indicatorClassName="bg-[#a13b29]"
          />

          <h3 className="text-xl font-semibold text-[#ff6a39] border-b border-[#5c3c2e] pb-2 mt-6">Estadísticas</h3>

          <div className="space-y-4">
            {Object.entries(character.stats).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 mr-2">{getStatIcon(key)}</div>
                    <span className="capitalize text-white">{key}</span>
                  </div>
                  <span className="text-white font-bold">
                    {value}/{MAX_STAT_VALUE}
                  </span>
                </div>
                <Progress
                  value={(value / MAX_STAT_VALUE) * 100}
                  className="h-2 bg-[#3c2a20]"
                  indicatorClassName="bg-[#6a9955]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#ff6a39] border-b border-[#5c3c2e] pb-2">
            <span className="flex items-center gap-1">
              <BookOpen className="h-5 w-5" />
              Habilidades Personales
            </span>
          </h3>

          <div className="space-y-4">
            {character.personalSkills.map((skill) => (
              <div key={skill.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-white">{skill.name}</span>
                  <span className="text-white font-bold">
                    {skill.points}/{MAX_PERSONAL_SKILL_VALUE}
                  </span>
                </div>
                <Progress
                  value={(skill.points / MAX_PERSONAL_SKILL_VALUE) * 100}
                  className="h-2 bg-[#3c2a20]"
                  indicatorClassName="bg-[#6a9955]"
                />
              </div>
            ))}
          </div>

          <h3 className="text-xl font-semibold text-[#ff6a39] border-b border-[#5c3c2e] pb-2 mt-6">
            Habilidades Especiales
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {character.specialSkills.map((skillId) => (
              <div key={skillId} className="bg-[#2c3c2e] border border-[#6a9955] rounded-md p-2 text-white">
                {getSpecialSkillName(skillId)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-[#1a1412] p-4 rounded-lg border border-[#5c3c2e]">
        <h3 className="text-xl font-semibold text-[#ff6a39] mb-3">Apariencia</h3>
        <p className="text-[#c4a59d]">{character.appearance || "Sin descripción de apariencia."}</p>
      </div>
    </div>
  )
}
