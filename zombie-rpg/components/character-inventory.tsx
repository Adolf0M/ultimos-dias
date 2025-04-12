"use client"
import type { CharacterType } from "./character-creator"
import { Card, CardContent } from "@/components/ui/card"
import { Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CharacterInventoryProps {
  character: CharacterType
  updateCharacter: (updates: Partial<CharacterType>) => void
}

export default function CharacterInventory({ character, updateCharacter }: CharacterInventoryProps) {
  const MAX_ITEMS = 2

  // Lista de objetos disponibles
  const availableItems = [
    {
      id: "pistola",
      name: "Pistola 9mm",
      description: "Una pistola semiautomática con 12 balas. Efectiva a corta distancia.",
      category: "arma",
      image: "🔫",
    },
    {
      id: "botiquin",
      name: "Botiquín de primeros auxilios",
      description: "Contiene vendas, antisépticos y analgésicos básicos.",
      category: "medicina",
      image: "🧰",
    },
    {
      id: "cuchillo",
      name: "Cuchillo de caza",
      description: "Un cuchillo afilado y resistente. Útil para combate cuerpo a cuerpo y supervivencia.",
      category: "arma",
      image: "🔪",
    },
    {
      id: "linterna",
      name: "Linterna táctica",
      description: "Linterna resistente con baterías de larga duración.",
      category: "herramienta",
      image: "🔦",
    },
    {
      id: "comida",
      name: "Raciones de emergencia",
      description: "Comida enlatada y barras energéticas para 3 días.",
      category: "supervivencia",
      image: "🥫",
    },
    {
      id: "agua",
      name: "Cantimplora con purificador",
      description: "Permite almacenar y purificar agua encontrada en el camino.",
      category: "supervivencia",
      image: "🧴",
    },
    {
      id: "mochila",
      name: "Mochila táctica",
      description: "Mochila resistente con múltiples compartimentos.",
      category: "equipamiento",
      image: "🎒",
    },
    {
      id: "radio",
      name: "Radio de emergencia",
      description: "Radio que funciona con manivela para comunicaciones de emergencia.",
      category: "herramienta",
      image: "📻",
    },
    {
      id: "mapa",
      name: "Mapa de la ciudad",
      description: "Mapa detallado con rutas de evacuación marcadas.",
      category: "navegación",
      image: "🗺️",
    },
    {
      id: "machete",
      name: "Machete",
      description: "Arma contundente para combate cuerpo a cuerpo y despejar caminos.",
      category: "arma",
      image: "⚔️",
    },
  ]

  const toggleItem = (itemId: string) => {
    const currentInventory = [...character.inventory]
    const itemIndex = currentInventory.indexOf(itemId)

    if (itemIndex === -1) {
      // Si no tiene el objeto, intentar añadirlo
      if (currentInventory.length < MAX_ITEMS) {
        updateCharacter({
          inventory: [...currentInventory, itemId],
        })
      }
    } else {
      // Si ya tiene el objeto, quitarlo
      currentInventory.splice(itemIndex, 1)
      updateCharacter({
        inventory: currentInventory,
      })
    }
  }

  const getItemById = (itemId: string) => {
    return availableItems.find((item) => item.id === itemId)
  }

  const getAlertMessage = () => {
    if (character.inventory.length === 0) {
      return "Selecciona hasta 2 objetos para tu inventario inicial."
    } else if (character.inventory.length === 1) {
      return "Puedes seleccionar 1 objeto más para tu inventario inicial."
    } else if (character.inventory.length === 2) {
      return "Has seleccionado el número máximo de objetos."
    }
    return ""
  }

  const getAlertVariant = () => {
    if (character.inventory.length < MAX_ITEMS) {
      return "bg-[#3c3020] border-[#d9a646]"
    } else {
      return "bg-[#2c3c2e] border-[#6a9955]"
    }
  }

  return (
    <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#ff6a39]">Inventario Inicial</h3>
          <Badge
            variant="outline"
            className={
              character.inventory.length === MAX_ITEMS
                ? "border-[#6a9955] text-[#6a9955]"
                : "border-[#d9a646] text-[#d9a646]"
            }
          >
            {character.inventory.length}/{MAX_ITEMS} seleccionados
          </Badge>
        </div>

        <Alert className={`${getAlertVariant()} mb-4`}>
          <AlertCircle
            className={character.inventory.length === MAX_ITEMS ? "h-4 w-4 text-[#6a9955]" : "h-4 w-4 text-[#d9a646]"}
          />
          <AlertDescription className="text-[#c4a59d]">{getAlertMessage()}</AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {character.inventory.map((itemId) => {
            const item = getItemById(itemId)
            if (!item) return null

            return (
              <div key={itemId} className="bg-[#2c3c2e] border border-[#6a9955] rounded-lg p-4 flex items-start">
                <div className="text-4xl mr-3">{item.image}</div>
                <div>
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <p className="text-sm text-[#c4a59d]">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <h4 className="font-semibold text-[#ff6a39] mb-3">Objetos Disponibles</h4>

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableItems.map((item) => {
              const isSelected = character.inventory.includes(item.id)
              const isDisabled = !isSelected && character.inventory.length >= MAX_ITEMS

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border transition-colors flex items-start ${
                    isSelected
                      ? "bg-[#2c3c2e] border-[#6a9955]"
                      : isDisabled
                        ? "bg-[#1a1412] border-[#5c3c2e] opacity-50 cursor-not-allowed"
                        : "bg-[#1a1412] border-[#5c3c2e] hover:border-[#8a6c5e] cursor-pointer"
                  }`}
                  onClick={() => !isDisabled && toggleItem(item.id)}
                >
                  <div className="text-4xl mr-3">{item.image}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold text-white">{item.name}</h4>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#6a9955] flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#c4a59d] mt-1">{item.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs border-[#5c3c2e] text-[#c4a59d]">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
