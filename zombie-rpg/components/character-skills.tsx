"use client"

import type { CharacterType } from "./character-creator"
import { Check, X, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CharacterSkillsProps {
  character: CharacterType
  updateCharacter: (updates: Partial<CharacterType>) => void
}

export default function CharacterSkills({ character, updateCharacter }: CharacterSkillsProps) {
  const MAX_SKILLS = 2

  const allSkills = [
    {
      id: "combate_cuerpo",
      name: "Combate cuerpo a cuerpo",
      description: "Habilidad para luchar con armas cuerpo a cuerpo o a mano limpia",
    },
    { id: "armas_fuego", name: "Armas de fuego", description: "Precisión y manejo de pistolas, rifles y escopetas" },
    { id: "sigilo", name: "Sigilo", description: "Capacidad para moverse sin ser detectado" },
    { id: "primeros_auxilios", name: "Primeros auxilios", description: "Tratamiento de heridas y enfermedades" },
    {
      id: "supervivencia",
      name: "Supervivencia",
      description: "Encontrar comida, agua y refugio en entornos hostiles",
    },
    { id: "mecanica", name: "Mecánica", description: "Reparación de vehículos y creación de trampas" },
    { id: "liderazgo", name: "Liderazgo", description: "Capacidad para dirigir grupos y mantener la moral alta" },
    { id: "negociacion", name: "Negociación", description: "Persuasión y capacidad para conseguir mejores tratos" },
    { id: "atletismo", name: "Atletismo", description: "Correr, saltar y escalar con eficacia" },
    { id: "rastreo", name: "Rastreo", description: "Seguir huellas y encontrar recursos ocultos" },
    { id: "electronica", name: "Electrónica", description: "Reparar y hackear dispositivos electrónicos" },
    { id: "cocina", name: "Cocina", description: "Preparar comidas nutritivas con recursos limitados" },
  ]

  const toggleSkill = (skillId: string) => {
    const currentSkills = [...character.skills]
    const skillIndex = currentSkills.indexOf(skillId)

    if (skillIndex === -1) {
      // Si no tiene la habilidad, intentar añadirla
      if (currentSkills.length < MAX_SKILLS) {
        updateCharacter({
          skills: [...currentSkills, skillId],
        })
      }
    } else {
      // Si ya tiene la habilidad, quitarla
      currentSkills.splice(skillIndex, 1)
      updateCharacter({
        skills: currentSkills,
      })
    }
  }

  const getAlertMessage = () => {
    if (character.skills.length < MAX_SKILLS) {
      return `Debes seleccionar ${MAX_SKILLS - character.skills.length} habilidad${
        MAX_SKILLS - character.skills.length !== 1 ? "es" : ""
      } más.`
    } else if (character.skills.length === MAX_SKILLS) {
      return "Has seleccionado el número exacto de habilidades requeridas."
    }
    return ""
  }

  const getAlertVariant = () => {
    if (character.skills.length < MAX_SKILLS) {
      return "bg-[#3c3020] border-[#d9a646]"
    } else if (character.skills.length === MAX_SKILLS) {
      return "bg-[#2c3c2e] border-[#6a9955]"
    }
    return ""
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#ff6a39]">Habilidades especiales</h3>
        <Badge
          variant="outline"
          className={
            character.skills.length === MAX_SKILLS
              ? "border-[#6a9955] text-[#6a9955]"
              : "border-[#d9a646] text-[#d9a646]"
          }
        >
          {character.skills.length}/{MAX_SKILLS} seleccionadas
        </Badge>
      </div>

      <Alert className={`${getAlertVariant()} mb-4`}>
        <AlertCircle
          className={character.skills.length === MAX_SKILLS ? "h-4 w-4 text-[#6a9955]" : "h-4 w-4 text-[#d9a646]"}
        />
        <AlertDescription className="text-[#c4a59d]">{getAlertMessage()}</AlertDescription>
      </Alert>

      <p className="text-sm text-[#c4a59d] mb-4">
        Selecciona exactamente {MAX_SKILLS} habilidades especiales para tu personaje.
      </p>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {allSkills.map((skill) => {
            const isSelected = character.skills.includes(skill.id)
            const isDisabled = !isSelected && character.skills.length >= MAX_SKILLS

            return (
              <div
                key={skill.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? "bg-[#2c3c2e] border-[#6a9955]"
                    : isDisabled
                      ? "bg-[#1a1412] border-[#5c3c2e] opacity-50 cursor-not-allowed"
                      : "bg-[#1a1412] border-[#5c3c2e] hover:border-[#8a6c5e] cursor-pointer"
                }`}
                onClick={() => !isDisabled && toggleSkill(skill.id)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-white">{skill.name}</h4>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-[#6a9955]" : "bg-[#3c2a20]"
                    }`}
                  >
                    {isSelected ? <Check className="h-3 w-3 text-white" /> : <X className="h-3 w-3 text-[#8a7a72]" />}
                  </div>
                </div>
                <p className="text-sm text-[#c4a59d] mt-1">{skill.description}</p>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
