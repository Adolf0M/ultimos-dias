"use client"

import { useState } from "react"
import type { Character } from "@/types/game"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUp,
  Trophy,
  Star,
  Sparkles,
  Brain,
  Heart,
  Skull,
  Zap,
  Users,
  BookOpen,
  ArrowUpCircle,
  Plus,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { saveGameState, getGameState } from "@/lib/storage"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GameLevelProps {
  character: Character
  onCharacterUpdate: (updatedCharacter: Character) => void
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

export default function GameLevel({ character, onCharacterUpdate }: GameLevelProps) {
  const [isLevelUpDialogOpen, setIsLevelUpDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isNewSkillDialogOpen, setIsNewSkillDialogOpen] = useState(false)
  const [isImproveSkillDialogOpen, setIsImproveSkillDialogOpen] = useState(false)
  const [isCustomSkillDialogOpen, setIsCustomSkillDialogOpen] = useState(false)
  const [selectedBonus, setSelectedBonus] = useState<string | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [selectedSkillToImprove, setSelectedSkillToImprove] = useState<string | null>(null)
  const [customSkill, setCustomSkill] = useState({ name: "", description: "" })
  const [improvedSkillEffect, setImprovedSkillEffect] = useState("")
  const { toast } = useToast()

  // Calcular el nivel actual y el próximo nivel
  const currentLevel = character.level || 1
  const nextLevel = currentLevel + 1

  // Beneficios disponibles al subir de nivel
  const levelBenefits = [
    {
      id: "health",
      name: "Salud Máxima",
      description: "+2 puntos de vida máxima",
      icon: <Heart className="h-5 w-5 text-[#a13b29]" />,
    },
    {
      id: "strength",
      name: "Fuerza",
      description: "+1 punto de fuerza",
      icon: <Skull className="h-5 w-5 text-[#d9a646]" />,
    },
    {
      id: "agility",
      name: "Agilidad",
      description: "+1 punto de agilidad",
      icon: <Zap className="h-5 w-5 text-[#4a8cca]" />,
    },
    {
      id: "intelligence",
      name: "Inteligencia",
      description: "+1 punto de inteligencia",
      icon: <Brain className="h-5 w-5 text-[#9c59d1]" />,
    },
    {
      id: "resistance",
      name: "Resistencia",
      description: "+1 punto de resistencia",
      icon: <Heart className="h-5 w-5 text-[#6a9955]" />,
    },
    {
      id: "charisma",
      name: "Carisma",
      description: "+1 punto de carisma",
      icon: <Users className="h-5 w-5 text-[#4a8cca]" />,
    },
    {
      id: "new_skill",
      name: "Nueva Habilidad",
      description: "Aprender una nueva habilidad especial",
      icon: <BookOpen className="h-5 w-5 text-[#9c59d1]" />,
    },
    {
      id: "improve_skill",
      name: "Mejorar Habilidad",
      description: "Mejorar una habilidad existente",
      icon: <ArrowUpCircle className="h-5 w-5 text-[#6a9955]" />,
    },
  ]

  // Función para iniciar el proceso de subir de nivel
  const handleStartLevelUp = () => {
    setSelectedBonus(null)
    setIsLevelUpDialogOpen(true)
  }

  // Función para confirmar la selección de beneficio
  const handleConfirmSelection = () => {
    if (!selectedBonus) {
      toast({
        title: "Selección requerida",
        description: "Debes seleccionar un beneficio para subir de nivel.",
        variant: "destructive",
      })
      return
    }

    setIsLevelUpDialogOpen(false)

    // Si es nueva habilidad o mejorar habilidad, ir directamente a esos diálogos
    if (selectedBonus === "new_skill") {
      setIsNewSkillDialogOpen(true)
    } else if (selectedBonus === "improve_skill") {
      setIsImproveSkillDialogOpen(true)
    } else {
      // Para otros beneficios, mostrar diálogo de confirmación
      setIsConfirmDialogOpen(true)
    }
  }

  // Función para aplicar la subida de nivel
  const handleLevelUp = () => {
    // Crear una copia del personaje para modificarlo
    const updatedCharacter = { ...character }

    // Incrementar el nivel
    updatedCharacter.level = nextLevel

    // Aplicar el beneficio seleccionado
    switch (selectedBonus) {
      case "health":
        updatedCharacter.health.max += 2
        updatedCharacter.health.current += 2 // También aumentamos la salud actual
        break
      case "strength":
        updatedCharacter.stats.fuerza += 1
        break
      case "agility":
        updatedCharacter.stats.agilidad += 1
        break
      case "intelligence":
        updatedCharacter.stats.inteligencia += 1
        break
      case "resistance":
        updatedCharacter.stats.resistencia += 1
        // Si aumenta la resistencia, también aumenta la salud máxima
        if (updatedCharacter.stats.resistencia > 2) {
          updatedCharacter.health.max += 1
          updatedCharacter.health.current += 1
        }
        break
      case "charisma":
        updatedCharacter.stats.carisma += 1
        break
      case "new_skill":
        // Esta opción se maneja en handleAddNewSkill
        return
      case "improve_skill":
        // Esta opción se maneja en handleImproveSkill
        return
    }

    // Actualizar la fecha de última modificación
    updatedCharacter.lastUpdated = new Date().toISOString()

    // Guardar los cambios en localStorage
    const gameState = getGameState(character.id)
    if (gameState) {
      const updatedGameState = {
        ...gameState,
        character: updatedCharacter,
        saveDate: new Date().toISOString(),
      }
      saveGameState(updatedGameState)
    }

    // Notificar al componente padre
    onCharacterUpdate(updatedCharacter)

    // Cerrar el diálogo de confirmación
    setIsConfirmDialogOpen(false)

    // Disparar un evento para actualizar la salud si fue modificada
    if (selectedBonus === "health" || selectedBonus === "resistance") {
      const healthEvent = new CustomEvent("character-health-update", {
        detail: { current: updatedCharacter.health.current, max: updatedCharacter.health.max },
      })
      window.dispatchEvent(healthEvent)
    }

    // Mostrar notificación de éxito
    toast({
      title: "¡Nivel Aumentado!",
      description: `${character.name} ha subido al nivel ${nextLevel}.`,
    })
  }

  // Función para añadir una nueva habilidad
  const handleAddNewSkill = () => {
    if (!selectedSkill && !customSkill.name) {
      toast({
        title: "Selección requerida",
        description: "Debes seleccionar o crear una habilidad.",
        variant: "destructive",
      })
      return
    }

    // Crear una copia del personaje para modificarlo
    const updatedCharacter = { ...character }

    // Incrementar el nivel
    updatedCharacter.level = nextLevel

    // Añadir la nueva habilidad
    if (selectedSkill === "custom") {
      // Añadir habilidad personalizada
      if (customSkill.name) {
        const customSkillId = `custom_${Date.now()}`
        updatedCharacter.specialSkills.push(customSkillId)

        // Si el personaje no tiene un array de habilidades personalizadas, crearlo
        if (!updatedCharacter.customSkills) {
          updatedCharacter.customSkills = []
        }

        // Añadir la habilidad personalizada
        updatedCharacter.customSkills.push({
          id: customSkillId,
          name: customSkill.name,
          description: customSkill.description,
          improved: false,
        })
      }
    } else if (selectedSkill) {
      // Añadir habilidad predefinida
      updatedCharacter.specialSkills.push(selectedSkill)
    }

    // Actualizar la fecha de última modificación
    updatedCharacter.lastUpdated = new Date().toISOString()

    // Guardar los cambios en localStorage
    const gameState = getGameState(character.id)
    if (gameState) {
      const updatedGameState = {
        ...gameState,
        character: updatedCharacter,
        saveDate: new Date().toISOString(),
      }
      saveGameState(updatedGameState)
    }

    // Notificar al componente padre
    onCharacterUpdate(updatedCharacter)

    // Cerrar los diálogos
    setIsNewSkillDialogOpen(false)
    setIsCustomSkillDialogOpen(false)

    // Mostrar notificación de éxito
    toast({
      title: "¡Nivel Aumentado!",
      description: `${character.name} ha subido al nivel ${nextLevel} y ha aprendido una nueva habilidad.`,
    })
  }

  // Función para mejorar una habilidad existente
  const handleImproveSkill = () => {
    if (!selectedSkillToImprove || !improvedSkillEffect) {
      toast({
        title: "Información requerida",
        description: "Debes seleccionar una habilidad y describir la mejora.",
        variant: "destructive",
      })
      return
    }

    // Crear una copia del personaje para modificarlo
    const updatedCharacter = { ...character }

    // Incrementar el nivel
    updatedCharacter.level = nextLevel

    // Marcar la habilidad como mejorada
    // Primero verificamos si es una habilidad personalizada
    let isCustomSkill = false
    if (updatedCharacter.customSkills) {
      const customSkillIndex = updatedCharacter.customSkills.findIndex((skill) => skill.id === selectedSkillToImprove)
      if (customSkillIndex !== -1) {
        updatedCharacter.customSkills[customSkillIndex].improved = true
        updatedCharacter.customSkills[customSkillIndex].improvedEffect = improvedSkillEffect
        isCustomSkill = true
      }
    }

    // Si no es una habilidad personalizada, la añadimos a un registro de habilidades mejoradas
    if (!isCustomSkill) {
      if (!updatedCharacter.improvedSkills) {
        updatedCharacter.improvedSkills = []
      }

      updatedCharacter.improvedSkills.push({
        skillId: selectedSkillToImprove,
        effect: improvedSkillEffect,
      })
    }

    // Actualizar la fecha de última modificación
    updatedCharacter.lastUpdated = new Date().toISOString()

    // Guardar los cambios en localStorage
    const gameState = getGameState(character.id)
    if (gameState) {
      const updatedGameState = {
        ...gameState,
        character: updatedCharacter,
        saveDate: new Date().toISOString(),
      }
      saveGameState(updatedGameState)
    }

    // Notificar al componente padre
    onCharacterUpdate(updatedCharacter)

    // Cerrar el diálogo
    setIsImproveSkillDialogOpen(false)

    // Mostrar notificación de éxito
    toast({
      title: "¡Nivel Aumentado!",
      description: `${character.name} ha subido al nivel ${nextLevel} y ha mejorado una habilidad.`,
    })
  }

  // Obtener el nombre de una habilidad por su ID
  const getSkillNameById = (skillId: string) => {
    // Primero buscar en habilidades personalizadas
    if (character.customSkills) {
      const customSkill = character.customSkills.find((skill) => skill.id === skillId)
      if (customSkill) return customSkill.name
    }

    // Luego buscar en habilidades predefinidas
    const predefinedSkill = availableSpecialSkills.find((skill) => skill.id === skillId)
    if (predefinedSkill) return predefinedSkill.name

    return skillId // Fallback
  }

  // Verificar si una habilidad ya está mejorada
  const isSkillImproved = (skillId: string) => {
    // Verificar en habilidades personalizadas
    if (character.customSkills) {
      const customSkill = character.customSkills.find((skill) => skill.id === skillId)
      if (customSkill && customSkill.improved) return true
    }

    // Verificar en registro de habilidades mejoradas
    if (character.improvedSkills) {
      return character.improvedSkills.some((skill) => skill.skillId === skillId)
    }

    return false
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-[#d9a646] mr-2" />
              <h3 className="text-xl font-semibold text-[#ff6a39]">Nivel de Personaje</h3>
            </div>
            <Badge variant="outline" className="bg-[#3c2a20] text-[#d9a646] border-[#5c3c2e] text-lg px-3 py-1">
              Nivel {currentLevel}
            </Badge>
          </div>

          <div className="bg-[#1a1412] p-4 rounded-lg border border-[#5c3c2e] mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#c4a59d]">Progreso de Capítulo</span>
              <span className="text-[#c4a59d]">Capítulo actual</span>
            </div>
            <Progress value={100} className="h-3 bg-[#3c2a20]" indicatorClassName="bg-[#d9a646]" />
            <p className="text-sm text-[#8a7a72] mt-3">
              Los personajes suben de nivel al comenzar un nuevo capítulo de la historia. Usa el botón "Subir de Nivel"
              cuando comiences un nuevo capítulo en tu campaña.
            </p>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleStartLevelUp} className="bg-[#d9a646] hover:bg-[#c9964e] text-white font-medium">
              <ArrowUp className="mr-2 h-4 w-4" />
              Subir de Nivel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para seleccionar beneficio de nivel */}
      <Dialog open={isLevelUpDialogOpen} onOpenChange={setIsLevelUpDialogOpen}>
        <DialogContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-[#ff6a39] flex items-center">
              <Star className="h-5 w-5 text-[#d9a646] mr-2" />
              Subir al Nivel {nextLevel}
            </DialogTitle>
            <DialogDescription className="text-[#c4a59d]">
              Selecciona un beneficio para tu personaje al subir de nivel.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup value={selectedBonus || ""} onValueChange={setSelectedBonus}>
              <div className="space-y-3">
                {levelBenefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                      selectedBonus === benefit.id
                        ? "bg-[#3c3020] border-[#d9a646]"
                        : "bg-[#1a1412] border-[#5c3c2e] hover:border-[#8a6c5e]"
                    }`}
                  >
                    <RadioGroupItem value={benefit.id} id={benefit.id} className="mt-1" />
                    <Label htmlFor={benefit.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center">
                        <div className="mr-2">{benefit.icon}</div>
                        <div>
                          <p className="font-medium text-white">{benefit.name}</p>
                          <p className="text-sm text-[#c4a59d]">{benefit.description}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLevelUpDialogOpen(false)}
              className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-[#c4a59d]"
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmSelection} className="bg-[#d9a646] hover:bg-[#c9964e] text-white">
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-[#ff6a39]">Confirmar Subida de Nivel</DialogTitle>
            <DialogDescription className="text-[#c4a59d]">
              ¿Estás seguro de que quieres subir de nivel? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-[#1a1412] p-4 rounded-lg border border-[#5c3c2e]">
              <div className="flex items-center mb-3">
                <Sparkles className="h-5 w-5 text-[#d9a646] mr-2" />
                <h4 className="font-semibold text-white">Beneficio seleccionado:</h4>
              </div>
              {selectedBonus && (
                <div className="flex items-center ml-7">
                  {levelBenefits.find((b) => b.id === selectedBonus)?.icon}
                  <div className="ml-2">
                    <p className="text-white">{levelBenefits.find((b) => b.id === selectedBonus)?.name}</p>
                    <p className="text-sm text-[#c4a59d]">
                      {levelBenefits.find((b) => b.id === selectedBonus)?.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-[#c4a59d]"
            >
              Cancelar
            </Button>
            <Button onClick={handleLevelUp} className="bg-[#d9a646] hover:bg-[#c9964e] text-white">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para seleccionar nueva habilidad */}
      <Dialog open={isNewSkillDialogOpen} onOpenChange={setIsNewSkillDialogOpen}>
        <DialogContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-[#ff6a39] flex items-center">
              <BookOpen className="h-5 w-5 text-[#9c59d1] mr-2" />
              Aprender Nueva Habilidad
            </DialogTitle>
            <DialogDescription className="text-[#c4a59d]">
              Selecciona una habilidad especial para aprender.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={selectedSkill || ""} onValueChange={setSelectedSkill}>
              <SelectTrigger className="bg-[#1a1412] border-[#5c3c2e] text-white">
                <SelectValue placeholder="Selecciona una habilidad" />
              </SelectTrigger>
              <SelectContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white max-h-[300px]">
                {availableSpecialSkills
                  .filter((skill) => !character.specialSkills.includes(skill.id))
                  .map((skill) => (
                    <SelectItem key={skill.id} value={skill.id} className="text-white">
                      <div className="flex flex-col">
                        <span>{skill.name}</span>
                        <span className="text-xs text-[#c4a59d]">{skill.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                <SelectItem value="custom" className="text-white">
                  <div className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Crear habilidad personalizada</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {selectedSkill === "custom" && (
              <Button
                onClick={() => setIsCustomSkillDialogOpen(true)}
                className="mt-4 w-full bg-[#9c59d1] hover:bg-[#8c49c1] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Habilidad Personalizada
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewSkillDialogOpen(false)
                setSelectedBonus(null)
              }}
              className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-[#c4a59d]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddNewSkill}
              className="bg-[#d9a646] hover:bg-[#c9964e] text-white"
              disabled={!selectedSkill}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para crear habilidad personalizada */}
      <Dialog open={isCustomSkillDialogOpen} onOpenChange={setIsCustomSkillDialogOpen}>
        <DialogContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-[#ff6a39]">Crear Habilidad Personalizada</DialogTitle>
            <DialogDescription className="text-[#c4a59d]">
              Define una nueva habilidad especial para tu personaje.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name" className="text-white">
                Nombre de la habilidad
              </Label>
              <Input
                id="skill-name"
                value={customSkill.name}
                onChange={(e) => setCustomSkill({ ...customSkill, name: e.target.value })}
                placeholder="Ej: Maestro de Trampas"
                className="bg-[#1a1412] border-[#5c3c2e] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-description" className="text-white">
                Descripción y efectos
              </Label>
              <Textarea
                id="skill-description"
                value={customSkill.description}
                onChange={(e) => setCustomSkill({ ...customSkill, description: e.target.value })}
                placeholder="Ej: Puedes crear trampas efectivas con materiales básicos. +2 al daño de trampas."
                className="bg-[#1a1412] border-[#5c3c2e] text-white min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomSkillDialogOpen(false)}
              className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-[#c4a59d]"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setIsCustomSkillDialogOpen(false)
                setSelectedSkill("custom")
              }}
              className="bg-[#9c59d1] hover:bg-[#8c49c1] text-white"
              disabled={!customSkill.name || !customSkill.description}
            >
              Guardar Habilidad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para mejorar habilidad existente */}
      <Dialog open={isImproveSkillDialogOpen} onOpenChange={setIsImproveSkillDialogOpen}>
        <DialogContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-[#ff6a39] flex items-center">
              <ArrowUpCircle className="h-5 w-5 text-[#6a9955] mr-2" />
              Mejorar Habilidad Existente
            </DialogTitle>
            <DialogDescription className="text-[#c4a59d]">
              Selecciona una habilidad para mejorar y describe cómo se mejora.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-to-improve" className="text-white">
                Habilidad a mejorar
              </Label>
              <Select value={selectedSkillToImprove || ""} onValueChange={setSelectedSkillToImprove}>
                <SelectTrigger className="bg-[#1a1412] border-[#5c3c2e] text-white">
                  <SelectValue placeholder="Selecciona una habilidad" />
                </SelectTrigger>
                <SelectContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white max-h-[300px]">
                  {character.specialSkills
                    .filter((skillId) => !isSkillImproved(skillId))
                    .map((skillId) => (
                      <SelectItem key={skillId} value={skillId} className="text-white">
                        {getSkillNameById(skillId)}
                      </SelectItem>
                    ))}
                  {character.customSkills &&
                    character.customSkills
                      .filter((skill) => !skill.improved)
                      .map((skill) => (
                        <SelectItem key={skill.id} value={skill.id} className="text-white">
                          {skill.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="improvement-description" className="text-white">
                Descripción de la mejora
              </Label>
              <Textarea
                id="improvement-description"
                value={improvedSkillEffect}
                onChange={(e) => setImprovedSkillEffect(e.target.value)}
                placeholder="Ej: Médico de Campo ahora cura 2 PV diarios en lugar de 1."
                className="bg-[#1a1412] border-[#5c3c2e] text-white min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImproveSkillDialogOpen(false)
                setSelectedBonus(null)
              }}
              className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-[#c4a59d]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImproveSkill}
              className="bg-[#6a9955] hover:bg-[#5a8945] text-white"
              disabled={!selectedSkillToImprove || !improvedSkillEffect}
            >
              Confirmar Mejora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
