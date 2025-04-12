"use client"

import { useState, useEffect, useRef } from "react"
import type { Character, GameItem, ItemType } from "@/types/game"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Package, Trash2, Plus, Coffee, Check, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { saveGameState, getGameState } from "@/lib/storage"

interface CharacterBackpackProps {
  character: Character
  readOnly?: boolean
  onInventoryChange?: (newInventory: GameItem[]) => void
}

// Lista de emojis para usar como imágenes de objetos
const itemEmojis = [
  "🔫",
  "🔪",
  "⚔️",
  "🛡️",
  "🧰",
  "🔦",
  "🧴",
  "🥫",
  "💧",
  "🧪",
  "💊",
  "🩹",
  "🔥",
  "📻",
  "🗺️",
  "🔹",
  "🔸",
  "🍫",
  "🧥",
  "📦",
  "🧭",
  "🔧",
  "🪓",
  "🔨",
  "🧲",
  "🧬",
  "🧯",
  "🧰",
  "🧱",
  "🧶",
]

// Tipos de objetos disponibles
const itemTypes: { value: ItemType; label: string }[] = [
  { value: "weapon", label: "Arma" },
  { value: "ammo", label: "Munición" },
  { value: "food", label: "Comida" },
  { value: "water", label: "Agua" },
  { value: "medicine", label: "Medicina" },
  { value: "tool", label: "Herramienta" },
  { value: "resource", label: "Recurso" },
  { value: "clothing", label: "Ropa" },
  { value: "misc", label: "Miscelánea" },
]

// Clave para almacenar objetos personalizados en localStorage
const CUSTOM_ITEMS_KEY = "zombie_custom_items"

export default function CharacterBackpack({ character, readOnly = false, onInventoryChange }: CharacterBackpackProps) {
  const [inventory, setInventory] = useState<GameItem[]>(character.inventory)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null)
  const [isCreatingItem, setIsCreatingItem] = useState(false)
  const [customItems, setCustomItems] = useState<GameItem[]>([])
  const { toast } = useToast()

  // Estado para el nuevo objeto
  const [newItem, setNewItem] = useState<Partial<GameItem>>({
    name: "",
    description: "",
    type: "misc",
    stackable: false,
    quantity: 1,
    maxStack: 10,
    weight: 1,
    image: "📦",
    usable: true,
    consumable: false,
    healthRestore: 0,
    damage: 0,
  })

  // Calcular el peso total y la capacidad
  const totalWeight = inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const totalItems = inventory.length
  const maxItems = character.inventoryCapacity

  // Referencia para rastrear si el cambio fue interno
  const isInternalUpdate = useRef(false)

  // Cargar objetos personalizados al iniciar
  useEffect(() => {
    loadCustomItems()
  }, [])

  // Actualizar el inventario del personaje cuando cambie
  useEffect(() => {
    // Verificar si el inventario ha cambiado realmente antes de actualizar el estado
    const inventoryChanged = JSON.stringify(inventory) !== JSON.stringify(character.inventory)
    if (inventoryChanged) {
      setInventory(character.inventory)
    }
  }, [character.inventory])

  // Notificar cambios al componente padre
  useEffect(() => {
    // Solo notificar cambios si no es una actualización interna
    if (onInventoryChange && !readOnly && !isInternalUpdate.current) {
      onInventoryChange(inventory)

      // Guardar en localStorage
      saveInventoryToStorage(inventory)
    }
    // Resetear la bandera después de cada actualización
    isInternalUpdate.current = false
  }, [inventory, onInventoryChange, readOnly])

  // Función para cargar objetos personalizados desde localStorage
  const loadCustomItems = () => {
    const savedItems = localStorage.getItem(CUSTOM_ITEMS_KEY)
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems)
        setCustomItems(parsedItems)
      } catch (error) {
        console.error("Error al cargar objetos personalizados:", error)
      }
    }
  }

  // Función para guardar objetos personalizados en localStorage
  const saveCustomItems = (items: GameItem[]) => {
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(items))
  }

  // Función para guardar el inventario en localStorage
  const saveInventoryToStorage = (newInventory: GameItem[]) => {
    // Obtener el estado actual del juego
    const gameState = getGameState(character.id)

    if (gameState) {
      // Actualizar el personaje con el nuevo inventario
      const updatedCharacter = {
        ...gameState.character,
        inventory: newInventory,
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

  // Generar un ID único para un nuevo objeto
  const generateItemId = () => {
    return `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  // Manejar la creación de un nuevo objeto
  const handleCreateItem = () => {
    if (readOnly) return
    if (!newItem.name) {
      toast({
        title: "Error",
        description: "El objeto debe tener un nombre.",
        variant: "destructive",
      })
      return
    }

    isInternalUpdate.current = true

    // Verificar si ya tenemos el máximo de objetos
    if (totalItems >= maxItems) {
      toast({
        title: "Mochila llena",
        description: "No puedes llevar más objetos. Descarta algo primero.",
        variant: "destructive",
      })
      return
    }

    // Crear el nuevo objeto
    const createdItem: GameItem = {
      id: generateItemId(),
      name: newItem.name || "Objeto sin nombre",
      description: newItem.description || "Sin descripción",
      type: (newItem.type as ItemType) || "misc",
      stackable: newItem.stackable || false,
      quantity: newItem.quantity || 1,
      maxStack: newItem.maxStack || 10,
      weight: newItem.weight || 1,
      image: newItem.image || "📦",
      usable: newItem.usable !== undefined ? newItem.usable : true,
      consumable: newItem.consumable || false,
      healthRestore:
        newItem.type === "medicine" || newItem.type === "food" || newItem.type === "water"
          ? newItem.healthRestore || 0
          : undefined,
      damage: newItem.type === "weapon" ? newItem.damage || 0 : undefined,
    }

    // Añadir el nuevo objeto al inventario
    const updatedInventory = [...inventory, createdItem]
    setInventory(updatedInventory)

    // Guardar en localStorage
    saveInventoryToStorage(updatedInventory)

    // Guardar el objeto personalizado para uso futuro
    const updatedCustomItems = [...customItems, createdItem]
    setCustomItems(updatedCustomItems)
    saveCustomItems(updatedCustomItems)

    // Resetear el formulario
    setNewItem({
      name: "",
      description: "",
      type: "misc",
      stackable: false,
      quantity: 1,
      maxStack: 10,
      weight: 1,
      image: "📦",
      usable: true,
      consumable: false,
      healthRestore: 0,
      damage: 0,
    })

    setIsCreatingItem(false)

    toast({
      title: "Objeto creado",
      description: `Has añadido ${createdItem.name} a tu mochila.`,
    })
  }

  // Manejar la eliminación de un objeto
  const handleRemoveItem = (index: number) => {
    if (readOnly) return

    isInternalUpdate.current = true

    const itemToRemove = inventory[index]
    const updatedInventory = [...inventory]
    updatedInventory.splice(index, 1)

    setInventory(updatedInventory)
    setSelectedItem(null)

    // Guardar en localStorage
    saveInventoryToStorage(updatedInventory)

    toast({
      title: "Objeto descartado",
      description: `Has descartado ${itemToRemove.name} de tu mochila.`,
    })
  }

  // Manejar el uso de un objeto
  const handleUseItem = (index: number) => {
    if (readOnly) return

    isInternalUpdate.current = true

    const itemToUse = inventory[index]
    const updatedInventory = [...inventory]

    // Si el objeto es consumible, reducir su cantidad o eliminarlo
    if (itemToUse.consumable) {
      // Aplicar efectos del objeto (como restaurar salud)
      if (itemToUse.healthRestore && itemToUse.healthRestore > 0) {
        // Calcular la nueva salud (sin exceder el máximo)
        const currentHealth = character.health.current
        const maxHealth = character.health.max
        const newHealth = Math.min(currentHealth + itemToUse.healthRestore, maxHealth)

        // Actualizar la salud del personaje si hay un cambio
        if (newHealth > currentHealth) {
          // Actualizar directamente el personaje con la nueva salud
          const updatedCharacter = {
            ...character,
            health: {
              ...character.health,
              current: newHealth,
            },
          }

          // Notificar al componente padre del cambio de salud
          if (onInventoryChange) {
            // Usamos setTimeout para asegurar que este cambio se procese después
            // de la actualización del inventario
            setTimeout(() => {
              // Disparar un evento personalizado para actualizar la salud
              const healthEvent = new CustomEvent("character-health-update", {
                detail: { current: newHealth, max: maxHealth },
              })
              window.dispatchEvent(healthEvent)
            }, 0)
          }
        }
      }

      if (itemToUse.quantity > 1) {
        // Reducir la cantidad
        updatedInventory[index] = {
          ...itemToUse,
          quantity: itemToUse.quantity - 1,
        }
      } else {
        // Eliminar el objeto
        updatedInventory.splice(index, 1)
      }

      setInventory(updatedInventory)
      setSelectedItem(null)

      // Guardar en localStorage
      saveInventoryToStorage(updatedInventory)

      // Mostrar mensaje según el tipo de objeto
      let message = "Has usado"
      if (itemToUse.type === "food" || itemToUse.type === "water") {
        message = "Has consumido"
      } else if (itemToUse.type === "medicine") {
        message = "Has aplicado"
      }

      toast({
        title: "Objeto utilizado",
        description: `${message} ${itemToUse.name}.${
          itemToUse.healthRestore ? ` Recuperas ${itemToUse.healthRestore} PV.` : ""
        }`,
      })
    } else if (itemToUse.usable) {
      // Para objetos usables pero no consumibles
      toast({
        title: "Objeto utilizado",
        description: `Has usado ${itemToUse.name}.`,
      })
    }
  }

  // Manejar cambios en la cantidad de un objeto
  const handleQuantityChange = (item: GameItem, newQuantity: number) => {
    if (readOnly || !item.stackable) return
    if (newQuantity < 1 || newQuantity > item.maxStack) return

    isInternalUpdate.current = true

    const itemIndex = inventory.findIndex((i) => i.id === item.id)
    if (itemIndex === -1) return

    const updatedInventory = [...inventory]
    updatedInventory[itemIndex] = {
      ...item,
      quantity: newQuantity,
    }

    setInventory(updatedInventory)
    setSelectedItem({ ...item, quantity: newQuantity })

    // Guardar en localStorage
    saveInventoryToStorage(updatedInventory)
  }

  const filteredInventory = activeTab === "all" ? inventory : inventory.filter((item) => item.type === activeTab)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-[#ff6a39] flex items-center gap-2">
          <Package className="h-5 w-5" />
          Mochila
        </h3>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[#1a1412] text-white border-[#5c3c2e]">
            {totalItems}/{maxItems} objetos
          </Badge>
          <Badge variant="outline" className="bg-[#1a1412] text-white border-[#5c3c2e]">
            {totalWeight.toFixed(1)} kg
          </Badge>
        </div>
      </div>

      <Progress
        value={(totalItems / maxItems) * 100}
        className="h-2 bg-[#3c2a20]"
        indicatorClassName={totalItems >= maxItems ? "bg-[#a13b29]" : "bg-[#6a9955]"}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-7 mb-4 bg-[#3c2a20]">
              <TabsTrigger
                value="all"
                className="text-xs sm:text-sm px-1 sm:px-2 data-[state=active]:bg-[#a13b29] data-[state=active]:text-white"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="weapon"
                className="text-xs sm:text-sm px-1 sm:px-2 data-[state=active]:bg-[#a13b29] data-[state=active]:text-white"
              >
                Armas
              </TabsTrigger>
              <TabsTrigger
                value="ammo"
                className="text-xs sm:text-sm px-1 sm:px-2 data-[state=active]:bg-[#a13b29] data-[state=active]:text-white"
              >
                Mun.
              </TabsTrigger>
              <TabsTrigger
                value="food"
                className="text-xs sm:text-sm px-1 sm:px-2 data-[state=active]:bg-[#a13b29] data-[state=active]:text-white"
              >
                Comida
              </TabsTrigger>
              <TabsTrigger
                value="water"
                className="text-xs sm:text-sm px-1 sm:px-2 data-[state=active]:bg-[#a13b29] data-[state=active]:text-white"
              >
                Agua
              </TabsTrigger>
              <TabsTrigger
                value="medicine"
                className="text-xs sm:text-sm px-1 sm:px-2 data-[state=active]:bg-[#a13b29] data-[state=active]:text-white"
              >
                Med.
              </TabsTrigger>
              <TabsTrigger
                value="tool"
                className="text-xs sm:text-sm px-1 sm:px-2 data-[state=active]:bg-[#a13b29] data-[state=active]:text-white"
              >
                Herr.
              </TabsTrigger>
            </TabsList>

            <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
              <CardContent className="pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  {filteredInventory.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {filteredInventory.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className={`p-3 rounded-lg border border-[#5c3c2e] bg-[#1a1412] flex items-center ${
                            selectedItem === item ? "border-[#6a9955]" : "hover:border-[#8a6c5e]"
                          } cursor-pointer`}
                          onClick={() => setSelectedItem(item === selectedItem ? null : item)}
                        >
                          <div className="text-3xl mr-3">{item.image}</div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-semibold text-white">{item.name}</h4>
                              {item.stackable && <span className="text-[#c4a59d]">x{item.quantity}</span>}
                            </div>
                            <p className="text-xs text-[#8a7a72]">{item.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs border-[#5c3c2e] text-[#c4a59d]">
                                {item.weight * item.quantity} kg
                              </Badge>
                              {item.type && (
                                <Badge variant="outline" className="text-xs border-[#5c3c2e] text-[#c4a59d]">
                                  {itemTypes.find((t) => t.value === item.type)?.label || item.type}
                                </Badge>
                              )}
                              {item.type === "weapon" && item.damage && (
                                <Badge variant="outline" className="text-xs border-[#5c3c2e] text-[#c4a59d]">
                                  Daño: {item.damage}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#8a7a72] py-10">
                      <Package className="h-12 w-12 mb-4 opacity-30" />
                      <p>No hay objetos en esta categoría</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        <div>
          <Card className="border-[#5c3c2e] bg-[#2a1f1a] h-full">
            <CardContent className="pt-4">
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl mb-2 mx-auto">{selectedItem.image}</div>
                    <h3 className="text-xl font-semibold text-[#ff6a39]">{selectedItem.name}</h3>
                    {selectedItem.stackable && (
                      <div className="flex items-center justify-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30]"
                          onClick={() => handleQuantityChange(selectedItem, Math.max(1, selectedItem.quantity - 1))}
                          disabled={selectedItem.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-3 text-white">{selectedItem.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30]"
                          onClick={() =>
                            handleQuantityChange(
                              selectedItem,
                              Math.min(selectedItem.maxStack, selectedItem.quantity + 1),
                            )
                          }
                          disabled={selectedItem.quantity >= selectedItem.maxStack}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[#c4a59d]">{selectedItem.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-[#1a1412] p-2 rounded">
                        <span className="text-[#8a7a72]">Tipo:</span>
                        <p className="text-white capitalize">
                          {itemTypes.find((t) => t.value === selectedItem.type)?.label || selectedItem.type}
                        </p>
                      </div>
                      <div className="bg-[#1a1412] p-2 rounded">
                        <span className="text-[#8a7a72]">Peso:</span>
                        <p className="text-white">{selectedItem.weight * selectedItem.quantity} kg</p>
                      </div>
                      {selectedItem.damage && (
                        <div className="bg-[#1a1412] p-2 rounded">
                          <span className="text-[#8a7a72]">Daño:</span>
                          <p className="text-white">{selectedItem.damage}</p>
                        </div>
                      )}
                      {selectedItem.healthRestore && (
                        <div className="bg-[#1a1412] p-2 rounded">
                          <span className="text-[#8a7a72]">Restaura:</span>
                          <p className="text-white">+{selectedItem.healthRestore} PV</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      {selectedItem.usable && (
                        <Button
                          className="w-full bg-[#4a8cca] hover:bg-[#3a7cba] text-white text-xs sm:text-sm px-2"
                          onClick={() => {
                            const index = inventory.findIndex((item) => item.id === selectedItem.id)
                            if (index !== -1) handleUseItem(index)
                          }}
                        >
                          <Coffee className="h-4 w-4 mr-1" />
                          <span>Usar</span>
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        className="w-full text-white text-xs sm:text-sm px-2"
                        onClick={() => {
                          const index = inventory.findIndex((item) => item.id === selectedItem.id)
                          if (index !== -1) handleRemoveItem(index)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span>Descartar</span>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#8a7a72] py-10">
                  <p className="mb-4 text-center">Selecciona un objeto para ver detalles</p>

                  {!readOnly && (
                    <div className="w-full">
                      <Button
                        className="w-full bg-[#a13b29] hover:bg-[#c04a33] text-white"
                        onClick={() => setIsCreatingItem(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Nuevo Objeto
                      </Button>

                      <Dialog open={isCreatingItem} onOpenChange={setIsCreatingItem}>
                        <DialogContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white max-w-md w-[90vw] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-[#ff6a39]">Crear Nuevo Objeto</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="item-name" className="text-white">
                                Nombre
                              </Label>
                              <Input
                                id="item-name"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                placeholder="Nombre del objeto"
                                className="bg-[#1a1412] border-[#5c3c2e] text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="item-description" className="text-white">
                                Descripción
                              </Label>
                              <Textarea
                                id="item-description"
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                placeholder="Descripción del objeto"
                                className="bg-[#1a1412] border-[#5c3c2e] text-white"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="item-type" className="text-white">
                                  Tipo
                                </Label>
                                <Select
                                  value={newItem.type as string}
                                  onValueChange={(value) => setNewItem({ ...newItem, type: value as ItemType })}
                                >
                                  <SelectTrigger className="bg-[#1a1412] border-[#5c3c2e] text-white">
                                    <SelectValue placeholder="Tipo de objeto" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white">
                                    {itemTypes.map((type) => (
                                      <SelectItem key={type.value} value={type.value} className="text-white">
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="item-image" className="text-white">
                                  Imagen
                                </Label>
                                <Select
                                  value={newItem.image}
                                  onValueChange={(value) => setNewItem({ ...newItem, image: value })}
                                >
                                  <SelectTrigger className="bg-[#1a1412] border-[#5c3c2e] text-white">
                                    <SelectValue placeholder="Imagen" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#2a1f1a] border-[#5c3c2e] text-white">
                                    {itemEmojis.map((emoji) => (
                                      <SelectItem key={emoji} value={emoji} className="text-white">
                                        <div className="flex items-center">
                                          <span className="mr-2 text-xl">{emoji}</span>
                                          <span>{emoji}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="item-weight" className="text-white">
                                  Peso (kg)
                                </Label>
                                <div className="flex items-center">
                                  <Input
                                    id="item-weight"
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={newItem.weight}
                                    onChange={(e) =>
                                      setNewItem({ ...newItem, weight: Number.parseFloat(e.target.value) || 0.1 })
                                    }
                                    className="bg-[#1a1412] border-[#5c3c2e] text-white"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="item-stackable" className="text-white">
                                    Acumulable
                                  </Label>
                                  <Switch
                                    id="item-stackable"
                                    checked={newItem.stackable}
                                    onCheckedChange={(checked) => setNewItem({ ...newItem, stackable: checked })}
                                  />
                                </div>
                                {newItem.stackable && (
                                  <div className="pt-2">
                                    <Label htmlFor="item-maxStack" className="text-white text-xs">
                                      Máximo acumulable: {newItem.maxStack}
                                    </Label>
                                    <Slider
                                      id="item-maxStack"
                                      min={2}
                                      max={100}
                                      step={1}
                                      value={[newItem.maxStack || 10]}
                                      onValueChange={(value) => setNewItem({ ...newItem, maxStack: value[0] })}
                                      className="py-2"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="item-usable" className="text-white">
                                    Usable
                                  </Label>
                                  <Switch
                                    id="item-usable"
                                    checked={newItem.usable}
                                    onCheckedChange={(checked) => setNewItem({ ...newItem, usable: checked })}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="item-consumable" className="text-white">
                                    Consumible
                                  </Label>
                                  <Switch
                                    id="item-consumable"
                                    checked={newItem.consumable}
                                    onCheckedChange={(checked) => setNewItem({ ...newItem, consumable: checked })}
                                  />
                                </div>
                              </div>
                            </div>

                            {(newItem.type === "medicine" || newItem.type === "food" || newItem.type === "water") && (
                              <div className="space-y-2">
                                <Label htmlFor="item-healthRestore" className="text-white">
                                  Restauración de salud: {newItem.healthRestore}
                                </Label>
                                <Slider
                                  id="item-healthRestore"
                                  min={0}
                                  max={10}
                                  step={1}
                                  value={[newItem.healthRestore || 0]}
                                  onValueChange={(value) => setNewItem({ ...newItem, healthRestore: value[0] })}
                                  className="py-2"
                                />
                              </div>
                            )}

                            {newItem.type === "weapon" && (
                              <div className="space-y-2">
                                <Label htmlFor="item-damage" className="text-white">
                                  Daño: {newItem.damage}
                                </Label>
                                <Slider
                                  id="item-damage"
                                  min={0}
                                  max={10}
                                  step={1}
                                  value={[newItem.damage || 0]}
                                  onValueChange={(value) => setNewItem({ ...newItem, damage: value[0] })}
                                  className="py-2"
                                />
                              </div>
                            )}
                          </div>

                          <DialogFooter className="mt-6">
                            <Button
                              variant="outline"
                              onClick={() => setIsCreatingItem(false)}
                              className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-white"
                            >
                              Cancelar
                            </Button>
                            <Button className="bg-[#a13b29] hover:bg-[#c04a33] text-white" onClick={handleCreateItem}>
                              <Check className="h-4 w-4 mr-2" />
                              Crear Objeto
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
