import { prisma } from "@/lib/prisma"
import { TemplateForm } from "@/components/templates/template-form"

async function getSystems() {
  const systems = await prisma.tradingSystem.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
  return systems
}

export default async function NewTemplatePage() {
  const systems = await getSystems()

  return <TemplateForm systems={systems} />
}
