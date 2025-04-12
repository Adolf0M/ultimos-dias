"use client"

import { useState, useEffect } from "react"
import type { Character } from "@/types/game"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Heart, PlusCircle, MinusCircle, Skull, Activity, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { saveGameState, getGameState } from "@/lib/storage"

interface GameHealthProps {
  character: Character
  onHealthChange: (current: number, max: number) => void
}

export default function GameHealth({ character, onHealthChange }: GameHealthProps) {
  const [currentHealth, setCurrentHealth] = useState(character.health.current)
  const [maxHealth, setMaxHealth] = useState(character.health.max)
  const [damageAmount, setDamageAmount] = useState(1)
  const [healAmount, setHealAmount] = useState(1)
  const { toast } = useToast()

  // Añadir un useEffect para escuchar cambios de salud desde otros componentes
  useEffect(() => {
    // Actualizar el estado local cuando cambie la salud del personaje
    setCurrentHealth(character.health.current)
    setMaxHealth(character.health.max)
  }, [character.health.current, character.health.max])

  // Añadir otro useEffect para escuchar eventos de actualización de salud
  useEffect(() => {
    const handleHealthUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.current !== undefined) {
        setCurrentHealth(event.detail.current)
        if (event.detail.max !== undefined) {
          setMaxHealth(event.detail.max)
        }
        // Notificar al componente padre
        onHealthChange(event.detail.current, event.detail.max || maxHealth)
      }
    }

    window.addEventListener("character-health-update", handleHealthUpdate as EventListener)

    return () => {
      window.removeEventListener("character-health-update", handleHealthUpdate as EventListener)
    }
  }, [onHealthChange, maxHealth])

  // Calcular el porcentaje de salud
  const healthPercentage = (currentHealth / maxHealth) * 100

  // Determinar el estado de salud
  const getHealthStatus = () => {
    if (healthPercentage <= 25) return { text: "Crítico", color: "text-[#a13b29]" }
    if (healthPercentage <= 50) return { text: "Herido", color: "text-[#d9a646]" }
    if (healthPercentage <= 75) return { text: "Lastimado", color: "text-[#d9a646]" }
    return { text: "Saludable", color: "text-[#6a9955]" }
  }

  // Determinar el color de la barra de salud
  const getHealthColor = () => {
    if (healthPercentage <= 25) return "bg-[#a13b29]"
    if (healthPercentage <= 50) return "bg-[#d9a646]"
    return "bg-[#6a9955]"
  }

  // Función para guardar el estado del juego actualizado
  const saveGameStateToStorage = (newHealth: number, newMaxHealth: number) => {
    // Obtener el estado actual del juego
    const gameState = getGameState(character.id)

    if (gameState) {
      // Actualizar el personaje con los nuevos valores de salud
      const updatedCharacter = {
        ...gameState.character,
        health: {
          current: newHealth,
          max: newMaxHealth,
        },
        lastUpdated: new Date().toISOString(),
      }

      // Actualizar y guardar el estado del juego
      const updatedGameState = {
        ...gameState,
        character: updatedCharacter,
        saveDate: new Date().toISOString(),
      }

      // Guardar en localStorage
      saveGameState(updatedGameState)
    }
  }

  const handleDamage = () => {
    const newHealth = Math.max(0, currentHealth - damageAmount)
    setCurrentHealth(newHealth)
    onHealthChange(newHealth, maxHealth)

    // Guardar en localStorage
    saveGameStateToStorage(newHealth, maxHealth)

    toast({
      title: "Daño recibido",
      description: `Has recibido ${damageAmount} puntos de daño.`,
      variant: newHealth === 0 ? "destructive" : "default",
    })

    if (newHealth === 0) {
      toast({
        title: "¡ESTADO CRÍTICO!",
        description: "Estás al borde de la muerte. Necesitas atención médica urgente.",
        variant: "destructive",
      })
    }
  }

  const handleHeal = () => {
    if (currentHealth === maxHealth) {
      toast({
        title: "Salud completa",
        description: "Ya tienes la salud al máximo.",
      })
      return
    }

    const newHealth = Math.min(maxHealth, currentHealth + healAmount)
    setCurrentHealth(newHealth)
    onHealthChange(newHealth, maxHealth)

    // Guardar en localStorage
    saveGameStateToStorage(newHealth, maxHealth)

    toast({
      title: "Salud recuperada",
      description: `Has recuperado ${healAmount} puntos de vida.`,
    })
  }

  const handleIncreaseMaxHealth = () => {
    const newMaxHealth = maxHealth + 1
    setMaxHealth(newMaxHealth)
    onHealthChange(currentHealth, newMaxHealth)

    // Guardar en localStorage
    saveGameStateToStorage(currentHealth, newMaxHealth)

    toast({
      title: "Salud máxima aumentada",
      description: "Tu salud máxima ha aumentado en 1 punto.",
    })
  }

  const handleDecreaseMaxHealth = () => {
    if (maxHealth <= 1) return

    const newMaxHealth = maxHealth - 1
    const newCurrentHealth = Math.min(currentHealth, newMaxHealth)

    setMaxHealth(newMaxHealth)
    setCurrentHealth(newCurrentHealth)
    onHealthChange(newCurrentHealth, newMaxHealth)

    // Guardar en localStorage
    saveGameStateToStorage(newCurrentHealth, newMaxHealth)

    toast({
      title: "Salud máxima reducida",
      description: "Tu salud máxima ha disminuido en 1 punto.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-8">
        <div className="w-32 h-32 rounded-full bg-[#1a1412] border-4 border-[#5c3c2e] flex items-center justify-center">
          <div className="text-center">
            <Heart className={`h-12 w-12 mx-auto mb-1 ${getHealthStatus().color}`} />
            <span className="text-4xl font-bold text-white">{currentHealth}</span>
            <span className="text-sm text-[#c4a59d] block">/ {maxHealth} PV</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-white mr-2" />
            <span className="text-white font-semibold">Estado de Salud</span>
          </div>
          <span className={`font-bold ${getHealthStatus().color}`}>{getHealthStatus().text}</span>
        </div>

        <Progress value={healthPercentage} className="h-3 bg-[#3c2a20]" indicatorClassName={getHealthColor()} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-[#5c3c2e] bg-[#3c2a20]">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-white flex items-center mb-4">
              <Skull className="h-5 w-5 text-[#a13b29] mr-2" />
              Recibir Daño
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-[#c4a59d]">Cantidad de daño:</label>
                  <span className="text-white font-bold">{damageAmount}</span>
                </div>
                <Slider
                  value={[damageAmount]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setDamageAmount(value[0])}
                  className="py-2"
                />
              </div>

              <Button variant="destructive" className="w-full" onClick={handleDamage}>
                <MinusCircle className="h-4 w-4 mr-2" />
                Aplicar Daño
              </Button>

              {currentHealth === 0 && (
                <div className="flex items-center mt-2 text-[#a13b29] text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  ¡Estado crítico! Necesitas atención médica.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#5c3c2e] bg-[#2c3c2e]">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-white flex items-center mb-4">
              <Heart className="h-5 w-5 text-[#6a9955] mr-2" />
              Curar Salud
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-[#c4a59d]">Cantidad a curar:</label>
                  <span className="text-white font-bold">{healAmount}</span>
                </div>
                <Slider
                  value={[healAmount]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setHealAmount(value[0])}
                  className="py-2"
                />
              </div>

              <Button
                className="w-full bg-[#6a9955] hover:bg-[#5a8945]"
                onClick={handleHeal}
                disabled={currentHealth >= maxHealth}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Aplicar Curación
              </Button>

              {currentHealth >= maxHealth && (
                <div className="flex items-center mt-2 text-[#6a9955] text-sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Salud al máximo.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#5c3c2e] bg-[#2a3c4a]">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Modificar Salud Máxima</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <label className="text-sm text-[#c4a59d]">Salud máxima actual:</label>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={maxHealth}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (value > 0) {
                      setMaxHealth(value)
                      setCurrentHealth(Math.min(currentHealth, value))
                      onHealthChange(Math.min(currentHealth, value), value)

                      // Guardar en localStorage
                      saveGameStateToStorage(Math.min(currentHealth, value), value)
                    }
                  }}
                  className="w-20 bg-[#1a1412] border-[#5c3c2e] text-white"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecreaseMaxHealth}
                disabled={maxHealth <= 1}
                className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30]"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncreaseMaxHealth}
                className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30]"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-[#c4a59d] mt-4">
            La salud máxima representa tu resistencia física total. Puede aumentar con entrenamiento, objetos especiales
            o eventos de juego.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
