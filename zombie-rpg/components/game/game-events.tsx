"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Character, GameItem } from "@/types/game"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { createItemCopy } from "@/data/items"
import { useToast } from "@/hooks/use-toast"
import {
  Skull,
  Heart,
  AlertTriangle,
  ShieldAlert,
  Syringe,
  Droplets,
  Utensils,
  Sparkles,
  Plus,
  Edit,
  Trash,
  Check,
  X,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveGameState, getGameState } from "@/lib/storage"

// Definir la interfaz para los eventos
interface GameEvent {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  type: "danger" | "positive" | "neutral"
  effects: {
    health: number
    maxHealth: number
    items: string[]
  }
  isCustom?: boolean
}

interface GameEventsProps {
  character: Character
  onHealthChange: (newHealth: number, newMaxHealth: number) => void
  onInventoryChange: (newInventory: GameItem[]) => void
}

// Definir los eventos disponibles
const defaultGameEvents: GameEvent[] = [
  {
    id: "zombie_attack",
    title: "Ataque Zombie",
    description: "Un zombie te ataca por sorpresa. Recibes daño.",
    icon: <Skull className="h-5 w-5 text-[#a13b29]" />,
    type: "danger",
    effects: {
      health: -3,
      maxHealth: 0,
      items: [],
    },
  },
  {
    id: "find_medicine",
    title: "Botiquín Encontrado",
    description: "Encuentras un botiquín en un armario abandonado.",
    icon: <Syringe className="h-5 w-5 text-[#6a9955]" />,
    type: "positive",
    effects: {
      health: 0,
      maxHealth: 0,
      items: ["botiquin"],
    },
  },
  {
    id: "find_food",
    title: "Comida Enlatada",
    description: "Encuentras varias latas de comida en buen estado.",
    icon: <Utensils className="h-5 w-5 text-[#d9a646]" />,
    type: "positive",
    effects: {
      health: 0,
      maxHealth: 0,
      items: ["lata_conserva", "lata_conserva"],
    },
  },
  {
    id: "find_water",
    title: "Agua Potable",
    description: "Encuentras botellas de agua sin abrir.",
    icon: <Droplets className="h-5 w-5 text-[#4a8cca]" />,
    type: "positive",
    effects: {
      health: 0,
      maxHealth: 0,
      items: ["botella_agua", "botella_agua"],
    },
  },
  {
    id: "find_ammo",
    title: "Munición",
    description: "Encuentras munición en un cadáver.",
    icon: <ShieldAlert className="h-5 w-5 text-[#d9a646]" />,
    type: "positive",
    effects: {
      health: 0,
      maxHealth: 0,
      items: ["municion_9mm"],
    },
  },
  {
    id: "heal_rest",
    title: "Descanso Reparador",
    description: "Encuentras un lugar seguro para descansar y recuperas salud.",
    icon: <Heart className="h-5 w-5 text-[#6a9955]" />,
    type: "positive",
    effects: {
      health: 2,
      maxHealth: 0,
      items: [],
    },
  },
  {
    id: "increase_max_health",
    title: "Entrenamiento Físico",
    description: "Después de días de ejercicio, tu resistencia física aumenta.",
    icon: <Sparkles className="h-5 w-5 text-[#9c59d1]" />,
    type: "positive",
    effects: {
      health: 1,
      maxHealth: 1,
      items: [],
    },
  },
  {
    id: "lose_supplies",
    title: "Emboscada",
    description: "Un grupo de bandidos te embosca y pierdes algunos suministros.",
    icon: <AlertTriangle className="h-5 w-5 text-[#d9a646]" />,
    type: "danger",
    effects: {
      health: -1,
      maxHealth: 0,
      items: ["remove_random"],
    },
  },
]

// Claves para almacenar datos en localStorage
const CUSTOM_EVENTS_KEY = "zombie_custom_events"
const EVENT_LOG_KEY = "zombie_event_log"

export default function GameEvents({ character, onHealthChange, onInventoryChange }: GameEventsProps) {
  const [eventLog, setEventLog] = useState<string[]>([])
  const [customEvents, setCustomEvents] = useState<GameEvent[]>([])
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isEditingEvent, setIsEditingEvent] = useState<GameEvent | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")
  const { toast } = useToast()

  // Estado para el nuevo evento
  const [newEvent, setNewEvent] = useState<Partial<GameEvent>>({
    title: "",
    description: "",
    type: "positive",
    effects: {
      health: 0,
      maxHealth: 0,
      items: [],
    },
  })

  // Cargar eventos personalizados y registro de eventos al iniciar
  useEffect(() => {
    loadCustomEvents()
    loadEventLog()
  }, [])

  // Guardar el registro de eventos cuando cambie
  useEffect(() => {
    if (eventLog.length > 0) {
      localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(eventLog))
    }
  }, [eventLog])

  // Función para cargar el registro de eventos desde localStorage
  const loadEventLog = () => {
    const savedLog = localStorage.getItem(EVENT_LOG_KEY)
    if (savedLog) {
      try {
        const parsedLog = JSON.parse(savedLog)
        setEventLog(parsedLog)
      } catch (error) {
        console.error("Error al cargar el registro de eventos:", error)
        // Inicializar con un mensaje de bienvenida si hay error
        setEventLog(["Bienvenido al simulador de eventos. Aquí puedes probar diferentes situaciones del juego."])
      }
    } else {
      // Inicializar con un mensaje de bienvenida si no hay datos guardados
      setEventLog(["Bienvenido al simulador de eventos. Aquí puedes probar diferentes situaciones del juego."])
    }
  }

  // Función para cargar eventos personalizados desde localStorage
  const loadCustomEvents = () => {
    const savedEvents = localStorage.getItem(CUSTOM_EVENTS_KEY)
    if (savedEvents) {
      try {
        // Necesitamos reconstruir los iconos ya que no se pueden serializar
        const parsedEvents: GameEvent[] = JSON.parse(savedEvents)
        const eventsWithIcons = parsedEvents.map((event) => ({
          ...event,
          icon: getIconForType(event.type),
          isCustom: true,
        }))
        setCustomEvents(eventsWithIcons)
      } catch (error) {
        console.error("Error al cargar eventos personalizados:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los eventos personalizados.",
          variant: "destructive",
        })
      }
    }
  }

  // Función para guardar eventos personalizados en localStorage
  const saveCustomEvents = (events: GameEvent[]) => {
    // Eliminar los iconos antes de guardar (no se pueden serializar)
    const eventsToSave = events.map(({ icon, ...rest }) => rest)
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(eventsToSave))
  }

  // Función para guardar el estado completo del juego
  const saveGameStateToStorage = (updatedHealth: number, updatedMaxHealth: number, updatedInventory: GameItem[]) => {
    // Obtener el estado actual del juego
    const gameState = getGameState(character.id)

    if (gameState) {
      // Actualizar el personaje con los nuevos valores
      const updatedCharacter = {
        ...gameState.character,
        health: {
          current: updatedHealth,
          max: updatedMaxHealth,
        },
        inventory: updatedInventory,
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

  // Función para obtener un icono basado en el tipo de evento
  const getIconForType = (type: string) => {
    switch (type) {
      case "danger":
        return <Skull className="h-5 w-5 text-[#a13b29]" />
      case "positive":
        return <Heart className="h-5 w-5 text-[#6a9955]" />
      case "neutral":
        return <AlertTriangle className="h-5 w-5 text-[#d9a646]" />
      default:
        return <AlertTriangle className="h-5 w-5 text-[#d9a646]" />
    }
  }

  // Función para generar un ID único
  const generateEventId = () => {
    return `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  // Función para crear un nuevo evento
  const handleCreateEvent = () => {
    if (!newEvent.title) {
      toast({
        title: "Error",
        description: "El evento debe tener un título.",
        variant: "destructive",
      })
      return
    }

    const createdEvent: GameEvent = {
      id: generateEventId(),
      title: newEvent.title || "Evento sin título",
      description: newEvent.description || "Sin descripción",
      icon: getIconForType(newEvent.type || "neutral"),
      type: (newEvent.type as "danger" | "positive" | "neutral") || "neutral",
      effects: {
        health: newEvent.effects?.health || 0,
        maxHealth: newEvent.effects?.maxHealth || 0,
        items: newEvent.effects?.items || [],
      },
      isCustom: true,
    }

    const updatedEvents = [...customEvents, createdEvent]
    setCustomEvents(updatedEvents)
    saveCustomEvents(updatedEvents)

    // Resetear el formulario
    setNewEvent({
      title: "",
      description: "",
      type: "positive",
      effects: {
        health: 0,
        maxHealth: 0,
        items: [],
      },
    })

    setIsCreatingEvent(false)

    toast({
      title: "Evento creado",
      description: `Has creado el evento "${createdEvent.title}".`,
    })
  }

  // Función para actualizar un evento existente
  const handleUpdateEvent = () => {
    if (!isEditingEvent || !newEvent.title) return

    const updatedEvent: GameEvent = {
      ...isEditingEvent,
      title: newEvent.title,
      description: newEvent.description || "",
      icon: getIconForType(newEvent.type || "neutral"),
      type: newEvent.type as "danger" | "positive" | "neutral",
      effects: {
        health: newEvent.effects?.health || 0,
        maxHealth: newEvent.effects?.maxHealth || 0,
        items: newEvent.effects?.items || [],
      },
    }

    const updatedEvents = customEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))

    setCustomEvents(updatedEvents)
    saveCustomEvents(updatedEvents)
    setIsEditingEvent(null)

    toast({
      title: "Evento actualizado",
      description: `Has actualizado el evento "${updatedEvent.title}".`,
    })
  }

  // Función para eliminar un evento
  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      const updatedEvents = customEvents.filter((event) => event.id !== eventId)
      setCustomEvents(updatedEvents)
      saveCustomEvents(updatedEvents)

      toast({
        title: "Evento eliminado",
        description: "El evento ha sido eliminado correctamente.",
      })
    }
  }

  // Función para editar un evento
  const handleEditEvent = (event: GameEvent) => {
    setIsEditingEvent(event)
    setNewEvent({
      title: event.title,
      description: event.description,
      type: event.type,
      effects: { ...event.effects },
    })
  }

  // Función para limpiar el registro de eventos
  const handleClearEventLog = () => {
    setEventLog([])
    localStorage.removeItem(EVENT_LOG_KEY)
  }

  // Combinar eventos predefinidos y personalizados
  const allEvents = [...defaultGameEvents, ...customEvents]

  // Filtrar eventos según la pestaña activa
  const filteredEvents = activeTab === "all" ? allEvents : activeTab === "custom" ? customEvents : defaultGameEvents

  const handleEvent = (eventId: string) => {
    const event = allEvents.find((e) => e.id === eventId)
    if (!event) return

    // Aplicar efectos del evento
    let newHealth = character.health.current
    let newMaxHealth = character.health.max
    const newInventory = [...character.inventory]
    let logMessage = `[${new Date().toLocaleTimeString()}] ${event.title}: ${event.description}`

    // Modificar salud
    if (event.effects.health !== 0) {
      newHealth = Math.max(0, Math.min(character.health.max, character.health.current + event.effects.health))
      logMessage += ` Salud ${event.effects.health > 0 ? "+" : ""}${event.effects.health}.`

      // Disparar un evento para asegurar que todos los componentes se actualicen
      if (event.effects.health > 0) {
        setTimeout(() => {
          const healthEvent = new CustomEvent("character-health-update", {
            detail: { current: newHealth, max: newMaxHealth },
          })
          window.dispatchEvent(healthEvent)
        }, 0)
      }
    }

    // Modificar salud máxima
    if (event.effects.maxHealth !== 0) {
      newMaxHealth = character.health.max + event.effects.maxHealth
      newHealth = Math.min(newHealth, newMaxHealth) // Asegurar que la salud actual no exceda la máxima
      logMessage += ` Salud máxima ${event.effects.maxHealth > 0 ? "+" : ""}${event.effects.maxHealth}.`
    }

    // Modificar inventario
    if (event.effects.items.length > 0) {
      if (event.effects.items[0] === "remove_random" && character.inventory.length > 0) {
        // Eliminar un objeto aleatorio del inventario
        const randomIndex = Math.floor(Math.random() * character.inventory.length)
        const removedItem = character.inventory[randomIndex]
        newInventory.splice(randomIndex, 1)
        logMessage += ` Perdiste ${removedItem.name}.`
      } else {
        // Añadir objetos al inventario
        for (const itemId of event.effects.items) {
          const newItem = createItemCopy(itemId)
          if (newItem) {
            // Verificar si hay espacio en el inventario
            if (newInventory.length < character.inventoryCapacity) {
              // Verificar si el objeto es acumulable y ya existe en el inventario
              if (newItem.stackable) {
                const existingItemIndex = newInventory.findIndex((item) => item.id === newItem.id)
                if (existingItemIndex >= 0) {
                  const existingItem = newInventory[existingItemIndex]
                  const newQuantity = existingItem.quantity + newItem.quantity

                  if (newQuantity <= existingItem.maxStack) {
                    // Actualizar cantidad del objeto existente
                    newInventory[existingItemIndex] = {
                      ...existingItem,
                      quantity: newQuantity,
                    }
                  } else {
                    // Si excede el máximo, añadir como nuevo objeto
                    newInventory.push(newItem)
                  }
                } else {
                  // Añadir nuevo objeto acumulable
                  newInventory.push(newItem)
                }
              } else {
                // Añadir objeto no acumulable
                newInventory.push(newItem)
              }

              logMessage += ` Obtienes ${newItem.name}.`
            } else {
              logMessage += " Tu mochila está llena, no puedes llevar más objetos."
              break
            }
          }
        }
      }
    }

    // Actualizar el estado del juego
    onHealthChange(newHealth, newMaxHealth)
    onInventoryChange(newInventory)

    // Guardar el estado actualizado en localStorage
    saveGameStateToStorage(newHealth, newMaxHealth, newInventory)

    // Actualizar el registro de eventos
    const updatedEventLog = [logMessage, ...eventLog]
    setEventLog(updatedEventLog)
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(updatedEventLog))

    // Mostrar notificación
    toast({
      title: event.title,
      description: event.description,
      variant: event.type === "danger" ? "destructive" : "default",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-[#ff6a39] mb-4">Simulador de Eventos</h3>
        <Button onClick={() => setIsCreatingEvent(true)} className="bg-[#a13b29] hover:bg-[#c04a33] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Crear Evento
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 bg-[#3c2a20]">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
            Todos
          </TabsTrigger>
          <TabsTrigger value="default" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
            Predefinidos
          </TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-[#a13b29] data-[state=active]:text-white">
            Personalizados
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((event) => (
          <Card
            key={event.id}
            className={`border-${event.type === "danger" ? "[#5c3c2e]" : event.type === "positive" ? "[#3c4c3e]" : "[#5c4c2e]"} bg-${
              event.type === "danger" ? "[#3c2a20]" : event.type === "positive" ? "[#2c3c2e]" : "[#3c3020]"
            } cursor-pointer hover:bg-opacity-80 transition-colors relative`}
            onClick={() => handleEvent(event.id)}
          >
            {event.isCustom && (
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-[#1a1412] hover:bg-[#2a2422]"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditEvent(event)
                  }}
                >
                  <Edit className="h-3 w-3 text-[#c4a59d]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-[#1a1412] hover:bg-[#2a2422]"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteEvent(event.id)
                  }}
                >
                  <Trash className="h-3 w-3 text-[#a13b29]" />
                </Button>
              </div>
            )}
            <CardContent className="pt-4 flex items-start">
              <div className="mr-3 mt-1">{event.icon}</div>
              <div>
                <h4 className="font-semibold text-white">{event.title}</h4>
                <p className="text-sm text-[#c4a59d]">{event.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {event.effects.health !== 0 && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        event.effects.health > 0 ? "border-[#6a9955] text-[#6a9955]" : "border-[#a13b29] text-[#a13b29]"
                      }`}
                    >
                      Salud {event.effects.health > 0 ? "+" : ""}
                      {event.effects.health}
                    </Badge>
                  )}
                  {event.effects.maxHealth !== 0 && (
                    <Badge variant="outline" className="text-xs border-[#9c59d1] text-[#9c59d1]">
                      Salud Máx {event.effects.maxHealth > 0 ? "+" : ""}
                      {event.effects.maxHealth}
                    </Badge>
                  )}
                  {event.effects.items.length > 0 && event.effects.items[0] !== "remove_random" && (
                    <Badge variant="outline" className="text-xs border-[#4a8cca] text-[#4a8cca]">
                      +Objetos
                    </Badge>
                  )}
                  {event.effects.items.length > 0 && event.effects.items[0] === "remove_random" && (
                    <Badge variant="outline" className="text-xs border-[#d9a646] text-[#d9a646]">
                      -Objetos
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#5c3c2e] bg-[#1a1412]">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-[#ff6a39]">Registro de Eventos</h4>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30]"
              onClick={handleClearEventLog}
            >
              Limpiar
            </Button>
          </div>

          <ScrollArea className="h-[200px] pr-4">
            {eventLog.length > 0 ? (
              <div className="space-y-2">
                {eventLog.map((log, index) => (
                  <div key={index} className="text-sm text-[#c4a59d] border-l-2 border-[#5c3c2e] pl-3 py-1">
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#8a7a72]">No hay eventos registrados</div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar eventos */}
      <Dialog
        open={isCreatingEvent || isEditingEvent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatingEvent(false)
            setIsEditingEvent(null)
            setNewEvent({
              title: "",
              description: "",
              type: "positive",
              effects: {
                health: 0,
                maxHealth: 0,
                items: [],
              },
            })
          }
        }}
      >
        <DialogContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white max-w-md w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#ff6a39]">
              {isEditingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="event-title" className="text-white">
                Título
              </Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Título del evento"
                className="bg-[#1a1412] border-[#5c3c2e] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description" className="text-white">
                Descripción
              </Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Descripción del evento"
                className="bg-[#1a1412] border-[#5c3c2e] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-type" className="text-white">
                Tipo
              </Label>
              <Select
                value={newEvent.type}
                onValueChange={(value) =>
                  setNewEvent({ ...newEvent, type: value as "danger" | "positive" | "neutral" })
                }
              >
                <SelectTrigger className="bg-[#1a1412] border-[#5c3c2e] text-white">
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white">
                  <SelectItem value="positive" className="text-[#6a9955]">
                    Positivo
                  </SelectItem>
                  <SelectItem value="danger" className="text-[#a13b29]">
                    Peligro
                  </SelectItem>
                  <SelectItem value="neutral" className="text-[#d9a646]">
                    Neutral
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-health" className="text-white">
                Cambio de Salud
              </Label>
              <div className="flex items-center">
                <Input
                  id="event-health"
                  type="number"
                  value={newEvent.effects?.health || 0}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      effects: {
                        ...newEvent.effects!,
                        health: Number.parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="bg-[#1a1412] border-[#5c3c2e] text-white"
                />
                <span className="ml-2 text-[#c4a59d]">PV</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-max-health" className="text-white">
                Cambio de Salud Máxima
              </Label>
              <div className="flex items-center">
                <Input
                  id="event-max-health"
                  type="number"
                  value={newEvent.effects?.maxHealth || 0}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      effects: {
                        ...newEvent.effects!,
                        maxHealth: Number.parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="bg-[#1a1412] border-[#5c3c2e] text-white"
                />
                <span className="ml-2 text-[#c4a59d]">PV</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Efectos de Inventario</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-white"
                  onClick={() =>
                    setNewEvent({
                      ...newEvent,
                      effects: {
                        ...newEvent.effects!,
                        items: ["remove_random"],
                      },
                    })
                  }
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Perder objeto aleatorio
                </Button>
                <Button
                  variant="outline"
                  className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-white"
                  onClick={() =>
                    setNewEvent({
                      ...newEvent,
                      effects: {
                        ...newEvent.effects!,
                        items: [],
                      },
                    })
                  }
                >
                  <X className="h-4 w-4 mr-2" />
                  Sin efecto
                </Button>
              </div>
              <p className="text-xs text-[#8a7a72] mt-2">
                Para añadir objetos específicos, necesitarás editar el código para incluir los IDs de los objetos
                deseados.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingEvent(false)
                setIsEditingEvent(null)
              }}
              className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-white"
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#a13b29] hover:bg-[#c04a33] text-white"
              onClick={isEditingEvent ? handleUpdateEvent : handleCreateEvent}
            >
              <Check className="h-4 w-4 mr-2" />
              {isEditingEvent ? "Actualizar" : "Crear"} Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
