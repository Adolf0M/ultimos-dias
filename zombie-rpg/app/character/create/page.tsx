"use client"
import { Button } from "@/components/ui/button"
import CharacterCreator from "@/components/character-creator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateCharacterPage() {
  return (
    <main className="min-h-screen bg-[#1a1412] text-zinc-100 py-8 px-4 bg-[url('/bg-texture.png')] bg-repeat">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            className="border-[#5c3c2e] hover:bg-[#3c2a20] bg-[#1a1412] text-[#c4a59d] mr-4"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-[#ff6a39] font-display">Crear Personaje</h1>
            <p className="text-[#c4a59d]">Diseña tu superviviente para el apocalipsis zombie</p>
          </div>
        </div>

        <CharacterCreator />
      </div>
    </main>
  )
}
