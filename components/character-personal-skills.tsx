"use client"

import { useState, useEffect } from "react"
import type { CharacterType } from "./character-creator"
import { Check, X, AlertCircle, Plus, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface CharacterPersonalSkillsProps {
  character: CharacterType
  updateCharacter: (updates: Partial<CharacterType>) => void
}

export default function CharacterPersonalSkills({ character, updateCharacter }: CharacterPersonalSkillsProps) {
  const REQUIRED_SKILLS = 6
  const MIN_POINTS_PER_SKILL = 1
  const MAX_POINTS_PER_SKILL = 10
  const [activeTab, setActiveTab] = useState<string>("selection")
  const { toast } = useToast()

  // Lista de habilidades personales disponibles
  const allPersonalSkills = [
    { id: "medicina", name: "Medicina", description: "Tratar heridas, infecciones, estabilizar." },
    { id: "supervivencia", name: "Supervivencia", description: "Hacer fuego, construir refugios, rastrear." },
    { id: "mecanica", name: "Mecánica", description: "Reparar vehículos o maquinaria simple." },
    { id: "tecnologia", name: "Tecnología", description: "Hackear, arreglar radios, usar computadoras." },
    { id: "persuasion", name: "Persuasión", description: "Convencer a otros, negociar, calmar." },
    { id: "intimidacion", name: "Intimidación", description: "Amenazar, causar miedo o imponerse." },
    { id: "sigilo", name: "Sigilo", description: "Moverse sin ser visto ni oído." },
    { id: "observacion", name: "Observación", description: "Percibir detalles ocultos o peligros." },
    { id: "atletismo", name: "Atletismo", description: "Correr, escalar, nadar, saltar." },
    { id: "armas_fuego", name: "Armas de fuego", description: "Usar pistolas, rifles, escopetas." },
    { id: "armas_blancas", name: "Armas blancas", description: "Cuchillos, bates, machetes, combate cuerpo a cuerpo." },
    { id: "conduccion", name: "Conducción", description: "Manejar bajo presión, en caminos difíciles." },
    { id: "ingenieria_casera", name: "Ingeniería casera", description: "Crear trampas, reparar estructuras." },
    { id: "orientacion", name: "Orientación", description: "Leer mapas, brújulas, encontrar el norte." },
    { id: "sigilo_urbano", name: "Sigilo urbano", description: "Saqueo silencioso, escapar en ciudad." },
    { id: "empatia", name: "Empatía", description: "Leer emociones, detectar mentiras." },
    { id: "explosivos", name: "Explosivos", description: "Armar bombas, usar dinamita o cocteles molotov." },
    { id: "primeros_auxilios", name: "Primeros auxilios", description: "Detener hemorragias, vendajes rápidos." },
    {
      id: "cultura_general",
      name: "Cultura general",
      description: "Historia, referencias útiles, conocimiento civil.",
    },
    { id: "intuicion", name: "Intuición", description: "Sentir que algo está mal, actuar sin pruebas." },
  ]

  // Inicializar las habilidades personales si es necesario
  useEffect(() => {
    if (character.personalSkills.length === 0 && character.selectedPersonalSkillIds.length > 0) {
      // Si hay IDs seleccionados pero no hay objetos de habilidad, crearlos
      const initialSkills = character.selectedPersonalSkillIds.map((id) => ({
        id,
        name: allPersonalSkills.find((skill) => skill.id === id)?.name || id,
        points: MIN_POINTS_PER_SKILL,
      }))

      updateCharacter({
        personalSkills: initialSkills,
        personalSkillPointsLeft: character.stats.inteligencia * 5 - initialSkills.length * MIN_POINTS_PER_SKILL,
      })
    }
  }, [])

  // Cambiar a la pestaña de distribución cuando se hayan seleccionado las 6 habilidades
  useEffect(() => {
    if (character.selectedPersonalSkillIds.length === REQUIRED_SKILLS && activeTab === "selection") {
      setActiveTab("distribution")
    }
  }, [character.selectedPersonalSkillIds.length])

  const toggleSkill = (skillId: string) => {
    const currentSelectedIds = [...character.selectedPersonalSkillIds]
    const skillIndex = currentSelectedIds.indexOf(skillId)

    if (skillIndex === -1) {
      // Si no está seleccionada, intentar añadirla
      if (currentSelectedIds.length < REQUIRED_SKILLS) {
        // Verificar si hay suficientes puntos disponibles
        if (character.personalSkillPointsLeft >= MIN_POINTS_PER_SKILL) {
          const newSelectedIds = [...currentSelectedIds, skillId]

          // Crear el objeto de habilidad con puntos mínimos
          const newSkill = {
            id: skillId,
            name: allPersonalSkills.find((skill) => skill.id === skillId)?.name || skillId,
            points: MIN_POINTS_PER_SKILL,
          }

          const newSkills = [...character.personalSkills, newSkill]

          updateCharacter({
            selectedPersonalSkillIds: newSelectedIds,
            personalSkills: newSkills,
            personalSkillPointsLeft: character.personalSkillPointsLeft - MIN_POINTS_PER_SKILL,
          })
        } else {
          // No hay suficientes puntos disponibles
          toast({
            title: "Puntos insuficientes",
            description: "No tienes suficientes puntos para seleccionar más habilidades.",
            variant: "destructive",
          })
        }
      }
    } else {
      // Si ya está seleccionada, quitarla
      currentSelectedIds.splice(skillIndex, 1)

      // Encontrar y eliminar la habilidad de la lista de habilidades
      const newSkills = character.personalSkills.filter((skill) => skill.id !== skillId)

      // Calcular los puntos que se liberan
      const removedSkill = character.personalSkills.find((skill) => skill.id === skillId)
      const pointsToAdd = removedSkill ? removedSkill.points : 0

      updateCharacter({
        selectedPersonalSkillIds: currentSelectedIds,
        personalSkills: newSkills,
        personalSkillPointsLeft: character.personalSkillPointsLeft + pointsToAdd,
      })
    }
  }

  const handlePointChange = (skillId: string, change: number) => {
    // Validaciones
    const skill = character.personalSkills.find((s) => s.id === skillId)
    if (!skill) return

    // No permitir reducir por debajo del mínimo
    if (change < 0 && skill.points <= MIN_POINTS_PER_SKILL) return

    // No permitir aumentar por encima del máximo
    if (change > 0 && skill.points >= MAX_POINTS_PER_SKILL) return

    // No permitir gastar más puntos de los disponibles
    if (change > 0 && character.personalSkillPointsLeft <= 0) return

    // Actualizar los puntos de la habilidad
    const newSkills = character.personalSkills.map((s) => {
      if (s.id === skillId) {
        return { ...s, points: s.points + change }
      }
      return s
    })

    updateCharacter({
      personalSkills: newSkills,
      personalSkillPointsLeft: character.personalSkillPointsLeft - change,
    })
  }

  const getSkillById = (id: string) => {
    return allPersonalSkills.find((skill) => skill.id === id)
  }

  const getTotalPoints = () => {
    return character.stats.inteligencia * 5
  }

  const getSelectionAlertMessage = () => {
    const remaining = REQUIRED_SKILLS - character.selectedPersonalSkillIds.length
    if (remaining > 0) {
      return `Debes seleccionar ${remaining} habilidad${remaining !== 1 ? "es" : ""} más.`
    } else {
      return "Has seleccionado todas las habilidades requeridas. Ahora distribuye los puntos."
    }
  }

  const getDistributionAlertMessage = () => {
    if (character.personalSkillPointsLeft > 0) {
      return `Aún tienes ${character.personalSkillPointsLeft} punto${character.personalSkillPointsLeft !== 1 ? "s" : ""} por distribuir.`
    } else {
      return "Has distribuido todos los puntos correctamente."
    }
  }

  const allPointsDistributed =
    character.personalSkillPointsLeft === 0 && character.selectedPersonalSkillIds.length === REQUIRED_SKILLS

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Habilidades Personales</h3>
        <Badge variant="outline" className="border-green-500 text-green-400">
          {getTotalPoints()} puntos totales
        </Badge>
      </div>

      <Alert className="bg-gray-800 border-green-700 mb-4">
        <AlertCircle className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-gray-300">
          Selecciona exactamente {REQUIRED_SKILLS} habilidades personales y distribuye {getTotalPoints()} puntos entre
          ellas (basado en tu inteligencia).
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="selection">Selección</TabsTrigger>
          <TabsTrigger value="distribution" disabled={character.selectedPersonalSkillIds.length < REQUIRED_SKILLS}>
            Distribución
          </TabsTrigger>
        </TabsList>

        <TabsContent value="selection">
          <Alert
            className={
              character.selectedPersonalSkillIds.length === REQUIRED_SKILLS
                ? "bg-green-900/30 border-green-700"
                : "bg-yellow-900/30 border-yellow-700"
            }
          >
            <AlertCircle
              className={
                character.selectedPersonalSkillIds.length === REQUIRED_SKILLS
                  ? "h-4 w-4 text-green-400"
                  : "h-4 w-4 text-yellow-400"
              }
            />
            <AlertDescription className="text-gray-300">{getSelectionAlertMessage()}</AlertDescription>
          </Alert>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {allPersonalSkills.map((skill) => {
              const isSelected = character.selectedPersonalSkillIds.includes(skill.id)
              const isDisabled = !isSelected && character.selectedPersonalSkillIds.length >= REQUIRED_SKILLS

              return (
                <div
                  key={skill.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? "bg-green-900/30 border-green-700"
                      : isDisabled
                        ? "bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed"
                        : "bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer"
                  }`}
                  onClick={() => !isDisabled && toggleSkill(skill.id)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white">{skill.name}</h4>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isSelected ? "bg-green-500" : "bg-gray-700"
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3 text-white" /> : <X className="h-3 w-3 text-zinc-400" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{skill.description}</p>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-white">Puntos disponibles</h4>
            <span className={`text-xl font-bold ${allPointsDistributed ? "text-green-400" : "text-yellow-400"}`}>
              {character.personalSkillPointsLeft}
            </span>
          </div>

          <Alert
            className={allPointsDistributed ? "bg-green-900/30 border-green-700" : "bg-yellow-900/30 border-yellow-700"}
          >
            <AlertCircle className={allPointsDistributed ? "h-4 w-4 text-green-400" : "h-4 w-4 text-yellow-400"} />
            <AlertDescription className="text-gray-300">{getDistributionAlertMessage()}</AlertDescription>
          </Alert>

          <ScrollArea className="h-[400px] pr-4 mt-4">
            <div className="space-y-6">
              {character.personalSkills.map((skill) => {
                const skillInfo = getSkillById(skill.id)

                return (
                  <div key={skill.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-white">{skill.name}</h4>
                        <p className="text-xs text-zinc-400">{skillInfo?.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full border-zinc-700"
                          onClick={() => handlePointChange(skill.id, -1)}
                          disabled={skill.points <= MIN_POINTS_PER_SKILL}
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Disminuir</span>
                        </Button>
                        <span className="w-8 text-center font-bold">{skill.points}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full border-zinc-700"
                          onClick={() => handlePointChange(skill.id, 1)}
                          disabled={character.personalSkillPointsLeft <= 0 || skill.points >= MAX_POINTS_PER_SKILL}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Aumentar</span>
                        </Button>
                      </div>
                    </div>
                    <Progress
                      value={(skill.points / MAX_POINTS_PER_SKILL) * 100}
                      className="h-2 bg-gray-700"
                      indicatorClassName="bg-green-500"
                    />
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
