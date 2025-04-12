"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Heart, Shield } from "lucide-react"
import type { CharacterType } from "./character-creator"

interface CharacterHealthProps {
  character: CharacterType
}

export default function CharacterHealth({ character }: CharacterHealthProps) {
  const baseHealth = 10
  const bonusHealth = Math.max(0, character.stats.resistencia - 2)
  const totalHealth = baseHealth + bonusHealth

  // Calcular el porcentaje para la barra de progreso
  const healthPercentage = (totalHealth / 30) * 100 // Asumiendo un máximo teórico de 30 PV

  return (
    <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-[#2c3c2e] border-4 border-[#6a9955] flex items-center justify-center">
              <div className="text-center">
                <Heart className="h-12 w-12 text-[#a13b29] mx-auto mb-1" />
                <span className="text-4xl font-bold text-white">{totalHealth}</span>
                <span className="text-sm text-[#c4a59d] block">PV</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#ff6a39] text-center">Cálculo de Salud</h3>

            <div className="bg-[#1a1412] p-4 rounded-lg border border-[#5c3c2e]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#c4a59d]">Salud Base</span>
                <span className="font-semibold text-white">{baseHealth} PV</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-[#6a9955] mr-2" />
                  <span className="text-[#c4a59d]">Bonus por Resistencia ({character.stats.resistencia})</span>
                </div>
                <span className="font-semibold text-[#6a9955]">+{bonusHealth} PV</span>
              </div>

              <div className="h-px bg-[#5c3c2e] my-3"></div>

              <div className="flex justify-between items-center">
                <span className="text-[#c4a59d]">Salud Total</span>
                <span className="font-bold text-xl text-white">{totalHealth} PV</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#c4a59d]">Puntos de Vida</span>
                <span className="text-[#c4a59d]">{totalHealth}/30</span>
              </div>
              <Progress value={healthPercentage} className="h-3 bg-[#3c2a20]" indicatorClassName="bg-[#a13b29]" />
            </div>

            <div className="bg-[#1a1412] p-4 rounded-lg border border-[#5c3c2e] mt-4">
              <h4 className="font-semibold text-[#ff6a39] mb-2">Reglas de Salud</h4>
              <ul className="text-sm text-[#c4a59d] space-y-2">
                <li>• Cada personaje empieza con 10 PV base.</li>
                <li>• La Resistencia (RES) influye en tu capacidad para resistir daño.</li>
                <li>
                  • Si tienes 3 o más puntos en RES, comienzas con +1 PV adicional por cada punto por encima de 2.
                </li>
                <li className="pl-4 text-[#8a7a72] italic">
                  Ejemplo: Con RES 4, empiezas con 12 PV (10 base + 2 adicionales).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
