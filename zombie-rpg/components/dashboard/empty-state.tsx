import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Skull } from "lucide-react"
import Link from "next/link"

export default function EmptyState() {
  return (
    <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
      <CardContent className="pt-6 pb-8 flex flex-col items-center text-center">
        <Skull className="h-16 w-16 text-[#a13b29] mb-4" />

        <h3 className="text-xl font-bold text-[#ff6a39] mb-2">No hay supervivientes</h3>
        <p className="text-[#c4a59d] mb-6 max-w-md">
          Parece que aún no has creado ningún personaje para enfrentar el apocalipsis zombie. ¡Crea tu primer
          superviviente para comenzar tu aventura!
        </p>

        <Button className="bg-[#a13b29] hover:bg-[#c04a33] text-white" size="lg" asChild>
          <Link href="/character/create">
            <UserPlus className="h-5 w-5 mr-2" />
            Crear Personaje
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
