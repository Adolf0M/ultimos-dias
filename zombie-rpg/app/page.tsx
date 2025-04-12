"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import CharacterCard from "@/components/dashboard/character-card"
import EmptyState from "@/components/dashboard/empty-state"
import { getAllCharacterSummaries, deleteCharacter, migrateOldData, type CharacterSummary } from "@/lib/storage"
import { UserPlus, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const [characters, setCharacters] = useState<CharacterSummary[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Cargar personajes al iniciar
  useEffect(() => {
    // Migrar datos antiguos si existen
    migrateOldData()

    // Cargar todos los personajes
    loadCharacters()
  }, [])

  const loadCharacters = () => {
    setLoading(true)
    const allCharacters = getAllCharacterSummaries()
    setCharacters(allCharacters)
    setLoading(false)
  }

  const handleDeleteCharacter = (id: string) => {
    // Confirmar antes de eliminar
    if (window.confirm("¿Estás seguro de que quieres eliminar este personaje? Esta acción no se puede deshacer.")) {
      deleteCharacter(id)

      // Actualizar la lista de personajes
      setCharacters(characters.filter((char) => char.id !== id))

      toast({
        title: "Personaje eliminado",
        description: "El personaje ha sido eliminado permanentemente.",
      })
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1a1412] text-zinc-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <p className="text-zinc-400">Cargando personajes...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#1a1412] text-zinc-100 py-8 px-4 bg-[url('/bg-texture.png')] bg-repeat">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#ff6a39] mb-2 font-display">Últimos Días</h1>
            <p className="text-[#c4a59d]">Gestiona tus supervivientes y continúa tu aventura</p>
          </div>

          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              className="border-[#5c3c2e] hover:bg-[#3c2a20] bg-[#1a1412] text-[#c4a59d]"
              onClick={loadCharacters}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>

            <Button className="bg-[#a13b29] hover:bg-[#c04a33] text-white" asChild>
              <Link href="/character/create">
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Personaje
              </Link>
            </Button>
          </div>
        </div>

        {characters.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} onDelete={handleDeleteCharacter} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
