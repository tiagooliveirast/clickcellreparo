import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const userRole = session.user.role
  const idUnidade = session.user.idUnidade

  const unidades = await prisma.unidadeFranquia.findMany({
    where: userRole !== "Master" ? { id: idUnidade } : undefined,
    include: { _count: { select: { usuarios: true, clientes: true, ordensServico: true } } },
    orderBy: { nomeFantasia: "asc" },
  })

  return NextResponse.json(unidades)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (session.user.role !== "Master") return NextResponse.json({ error: "Apenas Master pode criar unidades" }, { status: 403 })

  const body = await request.json()
  const { nomeFantasia, slugSubdominio, whatsappContato, chavePixPadrao, franqueadoNome, franqueadoEmail, franqueadoSenha } = body

  if (!nomeFantasia || !slugSubdominio || !whatsappContato || !franqueadoNome || !franqueadoEmail || !franqueadoSenha) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const slugExistente = await prisma.unidadeFranquia.findUnique({ where: { slugSubdominio } })
  if (slugExistente) return NextResponse.json({ error: "Slug já em uso" }, { status: 409 })

  const emailExistente = await prisma.usuario.findUnique({ where: { email: franqueadoEmail } })
  if (emailExistente) return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 })

  const senhaHash = await bcrypt.hash(franqueadoSenha, 10)

  const unidade = await prisma.unidadeFranquia.create({
    data: {
      nomeFantasia,
      slugSubdominio,
      whatsappContato,
      chavePixPadrao,
      usuarios: {
        create: {
          nome: franqueadoNome,
          email: franqueadoEmail,
          senhaHash,
          role: "Franqueado",
        },
      },
    },
    include: { usuarios: true },
  })

  return NextResponse.json(unidade, { status: 201 })
}
