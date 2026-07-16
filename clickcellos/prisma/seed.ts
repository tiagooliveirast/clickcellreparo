import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  // Create Master user (no unit needed)
  const masterHash = await bcrypt.hash("master123", 10)
  const master = await prisma.usuario.upsert({
    where: { email: "master@clickcell.com.br" },
    update: {},
    create: {
      nome: "Master Click Cell",
      email: "master@clickcell.com.br",
      senhaHash: masterHash,
      role: "Master",
      ativo: true,
    },
  })
  console.log(`✅ Master user created: ${master.email}`)

  // Create Unidade Salvador
  const hashSalvador = await bcrypt.hash("franqueado123", 10)
  const salvador = await prisma.unidadeFranquia.upsert({
    where: { slugSubdominio: "salvador" },
    update: {},
    create: {
      nomeFantasia: "Click Cell Salvador",
      slugSubdominio: "salvador",
      whatsappContato: "+5571999999999",
      chavePixPadrao: "salvador@clickcell.com.br",
      statusContrato: "Ativo",
      enderecoUnidade: "Av. ACM, 1000 - Salvador, BA",
    },
  })
  console.log(`✅ Unidade Salvador created`)

  const franqueadoSalvador = await prisma.usuario.upsert({
    where: { email: "franqueado.salvador@clickcell.com.br" },
    update: {},
    create: {
      idUnidade: salvador.id,
      nome: "Carlos Franqueado",
      email: "franqueado.salvador@clickcell.com.br",
      senhaHash: hashSalvador,
      role: "Franqueado",
      ativo: true,
    },
  })
  console.log(`✅ Franqueado Salvador created: ${franqueadoSalvador.email}`)

  const tecHash = await bcrypt.hash("tecnico123", 10)
  const tecnicoSalvador = await prisma.usuario.upsert({
    where: { email: "tecnico.salvador@clickcell.com.br" },
    update: {},
    create: {
      idUnidade: salvador.id,
      nome: "Pedro Técnico",
      email: "tecnico.salvador@clickcell.com.br",
      senhaHash: tecHash,
      role: "Tecnico",
      ativo: true,
    },
  })
  console.log(`✅ Técnico Salvador created: ${tecnicoSalvador.email}`)

  const motoHash = await bcrypt.hash("motoboy123", 10)
  const motoboySalvador = await prisma.usuario.upsert({
    where: { email: "motoboy.salvador@clickcell.com.br" },
    update: {},
    create: {
      idUnidade: salvador.id,
      nome: "João Motoboy",
      email: "motoboy.salvador@clickcell.com.br",
      senhaHash: motoHash,
      role: "Motoboy",
      ativo: true,
    },
  })
  console.log(`✅ Motoboy Salvador created: ${motoboySalvador.email}`)

  // Create Unidade Lauro
  const hashLauro = await bcrypt.hash("franqueado123", 10)
  const lauro = await prisma.unidadeFranquia.upsert({
    where: { slugSubdominio: "lauro" },
    update: {},
    create: {
      nomeFantasia: "Click Cell Lauro de Freitas",
      slugSubdominio: "lauro",
      whatsappContato: "+5571988888888",
      chavePixPadrao: "lauro@clickcell.com.br",
      statusContrato: "Ativo",
    },
  })
  console.log(`✅ Unidade Lauro created`)

  await prisma.usuario.upsert({
    where: { email: "franqueado.lauro@clickcell.com.br" },
    update: {},
    create: {
      idUnidade: lauro.id,
      nome: "Ana Franqueada",
      email: "franqueado.lauro@clickcell.com.br",
      senhaHash: hashLauro,
      role: "Franqueado",
      ativo: true,
    },
  })
  console.log(`✅ Franqueado Lauro created`)

  await prisma.usuario.upsert({
    where: { email: "tecnico.lauro@clickcell.com.br" },
    update: {},
    create: {
      idUnidade: lauro.id,
      nome: "Lucas Técnico",
      email: "tecnico.lauro@clickcell.com.br",
      senhaHash: tecHash,
      role: "Tecnico",
      ativo: true,
    },
  })
  console.log(`✅ Técnico Lauro created`)

  // Create sample clientes, aparelhos, and OS for Salvador
  const cliente1 = await prisma.cliente.upsert({
    where: { id: 1 },
    update: {},
    create: {
      idUnidade: salvador.id,
      nomeCompleto: "Maria Silva",
      whatsapp: "+5571988887777",
      enderecoRua: "Rua das Flores",
      enderecoNumero: "123",
      enderecoBairro: "Pituba",
      enderecoCidade: "Salvador",
      origemLead: "Instagram",
    },
  })

  const aparelho1 = await prisma.aparelho.upsert({
    where: { id: 1 },
    update: {},
    create: {
      idCliente: cliente1.id,
      marca: "Apple",
      modelo: "iPhone 14 Pro Max",
      cor: "Preto",
      imeiSerial: "356789012345678",
    },
  })

  await prisma.ordemServico.upsert({
    where: { idOS: "OS-2026-0001" },
    update: {},
    create: {
      idOS: "OS-2026-0001",
      idUnidade: salvador.id,
      idAparelho: aparelho1.id,
      idTecnicoResponsavel: tecnicoSalvador.id,
      sintomaReclamado: "Tela trincada no canto superior direito. Toque funciona parcialmente. Necessita substituição do display.",
      statusOS: "AguardandoCliente",
      precoOrcadoCliente: 650,
      custoPeca: 380,
      custoMaoObraTecnico: 80,
      laudoTecnico: "Display original com frame - necessário substituição completa. Touch ID permanece funcional após troca.",
      fotosChecklistEntrada: [],
    },
  })

  const cliente2 = await prisma.cliente.upsert({
    where: { id: 2 },
    update: {},
    create: {
      idUnidade: salvador.id,
      nomeCompleto: "João Santos",
      whatsapp: "+5571977776666",
      enderecoRua: "Av. Oceânica",
      enderecoNumero: "456",
      enderecoBairro: "Barra",
      enderecoCidade: "Salvador",
      origemLead: "Indicacao",
    },
  })

  const aparelho2 = await prisma.aparelho.upsert({
    where: { id: 2 },
    update: {},
    create: {
      idCliente: cliente2.id,
      marca: "Samsung",
      modelo: "Galaxy S24 Ultra",
      cor: "Branco",
      imeiSerial: "357890123456789",
    },
  })

  await prisma.ordemServico.upsert({
    where: { idOS: "OS-2026-0002" },
    update: {},
    create: {
      idOS: "OS-2026-0002",
      idUnidade: salvador.id,
      idAparelho: aparelho2.id,
      idTecnicoResponsavel: tecnicoSalvador.id,
      sintomaReclamado: "Aparelho não carrega. Conector USB-C danificado. Necessita troca da porta de carga.",
      statusOS: "NaBancada",
      precoOrcadoCliente: 180,
      custoPeca: 45,
      custoMaoObraTecnico: 50,
    },
  })

  const cliente3 = await prisma.cliente.upsert({
    where: { id: 3 },
    update: {},
    create: {
      idUnidade: salvador.id,
      nomeCompleto: "Ana Costa",
      whatsapp: "+5571966665555",
      enderecoRua: "Rua da Paz",
      enderecoNumero: "789",
      enderecoBairro: "Rio Vermelho",
      enderecoCidade: "Salvador",
      origemLead: "GoogleAds",
    },
  })

  const aparelho3 = await prisma.aparelho.upsert({
    where: { id: 3 },
    update: {},
    create: {
      idCliente: cliente3.id,
      marca: "Xiaomi",
      modelo: "Redmi Note 13",
      cor: "Azul",
    },
  })

  await prisma.ordemServico.upsert({
    where: { idOS: "OS-2026-0003" },
    update: {},
    create: {
      idOS: "OS-2026-0003",
      idUnidade: salvador.id,
      idAparelho: aparelho3.id,
      sintomaReclamado: "Bateria descarregando muito rápido. Dura menos de 2 horas em uso moderado.",
      statusOS: "Recebido",
    },
  })

  console.log("✅ Sample OS created: OS-2026-0001, OS-2026-0002, OS-2026-0003")
  console.log("")
  console.log("🎉 Seed completed! Credenciais de teste:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("Master:     master@clickcell.com.br / master123")
  console.log("Franqueado: franqueado.salvador@clickcell.com.br / franqueado123")
  console.log("Técnico:    tecnico.salvador@clickcell.com.br / tecnico123")
  console.log("Motoboy:    motoboy.salvador@clickcell.com.br / motoboy123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("Portal Público: http://localhost:3000/salvador")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
