"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import type { CharacterType } from "./character-creator"

interface CharacterBasicsProps {
  character: CharacterType
  updateCharacter: (updates: Partial<CharacterType>) => void
}

export default function CharacterBasics({ character, updateCharacter }: CharacterBasicsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white font-semibold">
          Nombre
        </Label>
        <Input
          id="name"
          value={character.name}
          onChange={(e) => updateCharacter({ name: e.target.value })}
          placeholder="Nombre de tu personaje"
          className="bg-[#1a1412] border-[#5c3c2e] text-white"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="age" className="text-white font-semibold">
            Edad: {character.age}
          </Label>
        </div>
        <Slider
          id="age"
          min={18}
          max={70}
          step={1}
          value={[character.age]}
          onValueChange={(value) => updateCharacter({ age: value[0] })}
          className="py-4"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="background" className="text-white font-semibold">
          Historia
        </Label>
        <Textarea
          id="background"
          value={character.background}
          onChange={(e) => updateCharacter({ background: e.target.value })}
          placeholder="¿Cuál es la historia de tu personaje? ¿Cómo sobrevivió al apocalipsis?"
          className="min-h-[100px] bg-[#1a1412] border-[#5c3c2e] text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="appearance" className="text-white font-semibold">
          Apariencia
        </Label>
        <Textarea
          id="appearance"
          value={character.appearance}
          onChange={(e) => updateCharacter({ appearance: e.target.value })}
          placeholder="Describe la apariencia física de tu personaje"
          className="min-h-[100px] bg-[#1a1412] border-[#5c3c2e] text-white"
        />
      </div>
    </div>
  )
}
