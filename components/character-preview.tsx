"use client"

import type { CharacterType } from "./character-creator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skull, Brain, Zap, Heart, Users, Package, BookOpen } from "lucide-react"
import Image from "next/image"

interface CharacterPreviewProps {
  character: CharacterType
}

export default function CharacterPreview({ character }: CharacterPreviewProps) {
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

  const getSkillName = (skillId: string) => {
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

  const getItemName = (itemId: string) => {
    const itemMap: Record<string, string> = {
      pistola: "Pistola 9mm",
      botiquin: "Botiquín de primeros auxilios",
      cuchillo: "Cuchillo de caza",
      linterna: "Linterna táctica",
      comida: "Raciones de emergencia",
      agua: "Cantimplora con purificador",
      mochila: "Mochila táctica",
      radio: "Radio de emergencia",
      mapa: "Mapa de la ciudad",
      machete: "Machete",
    }
    return itemMap[itemId] || itemId
  }

  const getItemEmoji = (itemId: string) => {
    const emojiMap: Record<string, string> = {
      pistola: "🔫",
      botiquin: "🧰",
      cuchillo: "🔪",
      linterna: "🔦",
      comida: "🥫",
      agua: "🧴",
      mochila: "🎒",
      radio: "📻",
      mapa: "🗺️",
      machete: "⚔️",
    }
    return emojiMap[itemId] || "📦"
  }

  return (
    <Card className="border-[#5c3c2e] bg-[#2a1f1a] sticky top-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-center text-[#ff6a39]">{character.name || "Nuevo Superviviente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-[#3c2a20] flex items-center justify-center border-4 border-[#a13b29] relative overflow-hidden">
          {character.imageData ? (
            <Image
              src={character.imageData || "/placeholder.svg"}
              alt={character.name || "Personaje"}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-5xl font-bold text-white">
              {character.name ? character.name.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-[#c4a59d]">Edad: {character.age} años</p>
          {character.background && <p className="text-sm text-[#c4a59d] mt-2 line-clamp-2">{character.background}</p>}
        </div>

        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-white">Salud</h3>
          <div className="flex items-center">
            <Heart className="h-4 w-4 text-[#a13b29] mr-1" />
            <span className="text-white font-bold">{character.health} PV</span>
          </div>
        </div>
        <Progress
          value={(character.health / 30) * 100}
          className="h-2 mb-6 bg-[#3c2a20]"
          indicatorClassName="bg-[#a13b29]"
        />

        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-white border-b border-[#5c3c2e] pb-1 mb-2">Estadísticas</h3>
          {Object.entries(character.stats).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-6">{getStatIcon(key)}</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize text-[#c4a59d]">{key}</span>
                  <span className="text-[#c4a59d]">
                    {value}/{MAX_STAT_VALUE}
                  </span>
                </div>
                <Progress
                  value={(value / MAX_STAT_VALUE) * 100}
                  className="h-2 bg-[#3c2a20]"
                  indicatorClassName="bg-[#6a9955]"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-white border-b border-[#5c3c2e] pb-1 mb-3">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Habilidades Personales
            </span>
          </h3>
          {character.personalSkills && character.personalSkills.length > 0 ? (
            <div className="space-y-2">
              {character.personalSkills.map((skill) => (
                <div key={skill.id} className="flex justify-between items-center text-[#c4a59d] text-sm">
                  <span>{skill.name}</span>
                  <div className="flex items-center">
                    <span className="mr-2">{skill.points}</span>
                    <div className="w-16 bg-[#3c2a20] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#6a9955] h-full rounded-full"
                        style={{ width: `${(skill.points / MAX_PERSONAL_SKILL_VALUE) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8a7a72] italic">Sin habilidades personales seleccionadas</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-white border-b border-[#5c3c2e] pb-1 mb-3">Habilidades Especiales</h3>
          {character.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {character.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="bg-[#2c3c2e] border-[#6a9955] text-white">
                  {getSkillName(skill)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8a7a72] italic">Sin habilidades especiales seleccionadas</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-white border-b border-[#5c3c2e] pb-1 mb-3">
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              Inventario
            </span>
          </h3>
          {character.inventory && character.inventory.length > 0 ? (
            <div className="space-y-2">
              {character.inventory.map((item) => (
                <div key={item} className="flex items-center gap-2 text-[#c4a59d]">
                  <span className="text-xl">{getItemEmoji(item)}</span>
                  <span>{getItemName(item)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8a7a72] italic">Sin objetos seleccionados</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
