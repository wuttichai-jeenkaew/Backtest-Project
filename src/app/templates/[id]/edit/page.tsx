import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { TemplateForm } from "@/components/templates/template-form"

async function getTemplate(id: string) {
  const template = await prisma.backtestTemplate.findUnique({
    where: { id }
  })

  if (!template) return null

  return {
    ...template,
    startingCapital: template.startingCapital ? Number(template.startingCapital) : null,
    commission: template.commission ? Number(template.commission) : null,
    slippage: template.slippage ? Number(template.slippage) : null
  }
}

async function getSystems() {
  const systems = await prisma.tradingSystem.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
  return systems
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [template, systems] = await Promise.all([
    getTemplate(id),
    getSystems()
  ])

  if (!template) {
    notFound()
  }

  return <TemplateForm systems={systems} template={template} />
}
