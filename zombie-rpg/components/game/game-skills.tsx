"use client"

import { useState } from "react"
import type { Character } from "@/types/game"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ArrowUpCircle, Star, Sparkles } from "lucide-react"

interface GameSkillsProps {
  character: Character
}

// Lista de habilidades especiales disponibles
const availableSpecialSkills = [
  {
    id: "combate_cuerpo",
    name: "Combate cuerpo a cuerpo",
    description: "Habilidad para luchar con armas cuerpo a cuerpo o a mano limpia",
  },
  { id: "armas_fuego", name: "Armas de fuego", description: "Precisión y manejo de pistolas, rifles y escopetas" },
  { id: "sigilo", name: "Sigilo", description: "Capacidad para moverse sin ser detectado" },
  { id: "primeros_auxilios", name: "Primeros auxilios", description: "Tratamiento de heridas y enfermedades" },
  { id: "supervivencia", name: "Supervivencia", description: "Encontrar comida, agua y refugio en entornos hostiles" },
  { id: "mecanica", name: "Mecánica", description: "Reparación de vehículos y creación de trampas" },
  { id: "liderazgo", name: "Liderazgo", description: "Capacidad para dirigir grupos y mantener la moral alta" },
  { id: "negociacion", name: "Negociación", description: "Persuasión y capacidad para conseguir mejores tratos" },
  { id: "atletismo", name: "Atletismo", description: "Correr, saltar y escalar con eficacia" },
  { id: "rastreo", name: "Rastreo", description: "Seguir huellas y encontrar recursos ocultos" },
  { id: "electronica", name: "Electrónica", description: "Reparar y hackear dispositivos electrónicos" },
  { id: "cocina", name: "Cocina", description: "Preparar comidas nutritivas con recursos limitados" },
  { id: "medico_campo", name: "Médico de Campo", description: "Curar 1 PV diario a un personaje" },
  { id: "cazador", name: "Cazador", description: "Encontrar comida en entornos naturales" },
  { id: "artesano", name: "Artesano", description: "Crear y reparar objetos con materiales básicos" },
  { id: "explorador", name: "Explorador", description: "Encontrar rutas seguras y evitar peligros" },
]

export default function GameSkills({ character }: GameSkillsProps) {
  const [activeTab, setActiveTab] = useState<string>("all")

  // Obtener información de una habilidad por su ID
  const getSkillInfo = (skillId: string) => {
    // Primero buscar en habilidades personalizadas
    if (character.customSkills) {
      const customSkill = character.customSkills.find((skill) => skill.id === skillId)
      if (customSkill) {
        return {
          name: customSkill.name,
          description: customSkill.description,
          isCustom: true,
          improved: customSkill.improved || false,
          improvedEffect: customSkill.improvedEffect || "",
        }
      }
    }

    // Luego buscar en habilidades predefinidas
    const predefinedSkill = availableSpecialSkills.find((skill) => skill.id === skillId)
    if (predefinedSkill) {
      // Verificar si está mejorada
      let improved = false
      let improvedEffect = ""

      if (character.improvedSkills) {
        const improvement = character.improvedSkills.find((imp) => imp.skillId === skillId)
        if (improvement) {
          improved = true
          improvedEffect = improvement.effect
        }
      }

      return {
        name: predefinedSkill.name,
        description: predefinedSkill.description,
        isCustom: false,
        improved,
        improvedEffect,
      }
    }

    // Si no se encuentra, devolver información genérica
    return {
      name: skillId,
      description: "Habilidad especial",
      isCustom: false,
      improved: false,
      improvedEffect: "",
    }
  }

  // Filtrar habilidades según la pestaña activa
  const getFilteredSkills = () => {
    if (activeTab === "all") {
      return character.specialSkills
    } else if (activeTab === "improved") {
      // Filtrar habilidades mejoradas
      return character.specialSkills.filter((skillId) => {
        // Verificar si es una habilidad personalizada mejorada
        if (character.customSkills) {
          const customSkill = character.customSkills.find((skill) => skill.id === skillId)
          if (customSkill && customSkill.improved) return true
        }

        // Verificar si está en el registro de habilidades mejoradas
        if (character.improvedSkills) {
          return character.improvedSkills.some((imp) => imp.skillId === skillId)
        }

        return false
      })
    } else if (activeTab === "custom") {
      // Filtrar habilidades personalizadas
      if (character.customSkills) {
        return character.customSkills.map((skill) => skill.id)
      }
      return []
    } else {
      // Filtrar habilidades predefinidas (no personalizadas)
      const customSkillIds = character.customSkills ? character.customSkills.map((skill) => skill.id) : []
      return character.specialSkills.filter((skillId) => !customSkillIds.includes(skillId))
    }
  }

  const filteredSkills = getFilteredSkills()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-[#ff6a39] flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Habilidades Especiales
        </h3>
        <Badge variant="outline" className="bg-[#1a1412] text-white border-[#5c3c2e]">
          {character.specialSkills.length} habilidades
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4 bg-[#3c2a20]">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
            Todas
          </TabsTrigger>
          <TabsTrigger value="improved" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
            Mejoradas
          </TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
            Personalizadas
          </TabsTrigger>
          <TabsTrigger value="standard" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
            Estándar
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
        <CardContent className="pt-4">
          <ScrollArea className="h-[400px] pr-4">
            {filteredSkills.length > 0 ? (
              <div className="space-y-4">
                {filteredSkills.map((skillId) => {
                  const skillInfo = getSkillInfo(skillId)

                  return (
                    <div
                      key={skillId}
                      className={`p-4 rounded-lg border ${
                        skillInfo.improved
                          ? "bg-[#2c3c2e] border-[#6a9955]"
                          : skillInfo.isCustom
                            ? "bg-[#3c2a3c] border-[#9c59d1]"
                            : "bg-[#1a1412] border-[#5c3c2e]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {skillInfo.isCustom ? (
                            <Star className="h-5 w-5 text-[#9c59d1] mr-2 flex-shrink-0" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-[#d9a646] mr-2 flex-shrink-0" />
                          )}
                          <h4 className="font-semibold text-white">{skillInfo.name}</h4>
                        </div>
                        {skillInfo.improved && (
                          <Badge className="bg-[#6a9955] text-white border-none flex items-center">
                            <ArrowUpCircle className="h-3 w-3 mr-1" />
                            Mejorada
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-[#c4a59d] mt-2 ml-7">{skillInfo.description}</p>

                      {skillInfo.improved && (
                        <div className="mt-3 ml-7 bg-[#1a1412] p-3 rounded border border-[#6a9955]">
                          <div className="flex items-center">
                            <Sparkles className="h-4 w-4 text-[#d9a646] mr-2" />
                            <span className="text-sm font-medium text-[#d9a646]">Mejora:</span>
                          </div>
                          <p className="text-sm text-[#c4a59d] mt-1 ml-6">{skillInfo.improvedEffect}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#8a7a72] py-10">
                <BookOpen className="h-12 w-12 mb-4 opacity-30" />
                <p>No hay habilidades en esta categoría</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="bg-[#1a1412] p-4 rounded-lg border border-[#5c3c2e]">
        <h4 className="font-semibold text-[#ff6a39] mb-2">Sobre las Habilidades Especiales</h4>
        <ul className="text-sm text-[#c4a59d] space-y-2">
          <li>• Las habilidades especiales representan capacidades únicas de tu personaje.</li>
          <li>• Al subir de nivel, puedes aprender nuevas habilidades o mejorar las existentes.</li>
          <li>• Las habilidades mejoradas son más poderosas que sus versiones básicas.</li>
          <li>• Las habilidades personalizadas son creadas por ti y adaptadas a tu estilo de juego.</li>
        </ul>
      </div>
    </div>
  )
}
