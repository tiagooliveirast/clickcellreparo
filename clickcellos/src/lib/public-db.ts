import { supabase } from "./supabase"
import { prisma } from "./prisma"
import type { StatusOS } from "@/types"

const isVercel = !!process.env.VERCEL

export async function getUnidadeBySlug(slug: string) {
  if (isVercel) {
    const { data, error } = await supabase
      .from("unidades_franquias")
      .select("id, nome_fantasia, whatsapp_contato, chave_pix_padrao, status_contrato, endereco_unidade, slug_subdominio")
      .eq("slug_subdominio", slug)
      .single()
    if (error || !data) return null
    return {
      id: data.id,
      nomeFantasia: data.nome_fantasia,
      slugSubdominio: data.slug_subdominio,
      whatsappContato: data.whatsapp_contato,
      chavePixPadrao: data.chave_pix_padrao || null,
      statusContrato: data.status_contrato,
      enderecoUnidade: data.endereco_unidade || null,
      dataCadastro: null,
    }
  }
  return prisma.unidadeFranquia.findUnique({ where: { slugSubdominio: slug } })
}

export async function findOrCreateCliente(data: {
  idUnidade: number
  nomeCompleto: string
  whatsapp: string
  enderecoRua?: string
  enderecoNumero?: string
  enderecoBairro?: string
  enderecoCidade?: string
  enderecoPontoRef?: string
}) {
  if (isVercel) {
    const { data: existing } = await supabase
      .from("clientes")
      .select("*")
      .eq("id_unidade", data.idUnidade)
      .eq("whatsapp", data.whatsapp)
      .single()
    if (existing) return { id: existing.id, ...existing }
    const { data: created } = await supabase
      .from("clientes")
      .insert({
        id_unidade: data.idUnidade,
        nome_completo: data.nomeCompleto,
        whatsapp: data.whatsapp,
        endereco_rua: data.enderecoRua || null,
        endereco_numero: data.enderecoNumero || null,
        endereco_bairro: data.enderecoBairro || null,
        endereco_cidade: data.enderecoCidade || null,
        endereco_ponto_referencia: data.enderecoPontoRef || null,
        origem_lead: "PassagemNaLoja",
      })
      .select()
      .single()
    if (!created) throw new Error("Failed to create cliente")
    return { id: created.id, ...created }
  }
  const existing = await prisma.cliente.findFirst({
    where: { idUnidade: data.idUnidade, whatsapp: data.whatsapp },
  })
  if (existing) return existing
  return prisma.cliente.create({
    data: {
      idUnidade: data.idUnidade,
      nomeCompleto: data.nomeCompleto,
      whatsapp: data.whatsapp,
      enderecoRua: data.enderecoRua,
      enderecoNumero: data.enderecoNumero,
      enderecoBairro: data.enderecoBairro,
      enderecoCidade: data.enderecoCidade,
      enderecoPontoRef: data.enderecoPontoRef,
      origemLead: "PassagemNaLoja",
    },
  })
}

export async function createAparelho(data: {
  idCliente: number
  marca: string
  modelo: string
  cor?: string
  imeiSerial?: string
}) {
  if (isVercel) {
    const { data: created } = await supabase
      .from("aparelhos")
      .insert({
        id_cliente: data.idCliente,
        marca: data.marca,
        modelo: data.modelo,
        cor: data.cor || null,
        imei_serial: data.imeiSerial || null,
      })
      .select()
      .single()
    if (!created) throw new Error("Failed to create aparelho")
    return { id: created.id, ...created }
  }
  return prisma.aparelho.create({ data })
}

export async function createOrdemServico(data: {
  idOS: string
  idUnidade: number
  idAparelho: number
  sintomaReclamado: string
}) {
  if (isVercel) {
    const { data: created } = await supabase
      .from("ordens_servico")
      .insert({
        id_os: data.idOS,
        id_unidade: data.idUnidade,
        id_aparelho: data.idAparelho,
        sintoma_reclamado: data.sintomaReclamado,
        status_os: "Recebido",
      })
      .select()
      .single()
    if (!created) throw new Error("Failed to create ordem servico")
    return { idOS: created.id_os }
  }
  return prisma.ordemServico.create({
    data: {
      idOS: data.idOS,
      idUnidade: data.idUnidade,
      idAparelho: data.idAparelho,
      sintomaReclamado: data.sintomaReclamado,
    },
  })
}

export async function getOrdemServico(idOS: string) {
  if (isVercel) {
    const { data } = await supabase
      .from("ordens_servico")
      .select(`
        *,
        aparelho: id_aparelho (
          *,
          cliente: id_cliente ( nome_completo, whatsapp )
        ),
        unidade: id_unidade ( nome_fantasia, slug_subdominio, whatsapp_contato )
      `)
      .eq("id_os", idOS)
      .single()
    return data || null
  }
  return prisma.ordemServico.findFirst({
    where: { idOS },
    include: {
      aparelho: { include: { cliente: { select: { nomeCompleto: true, whatsapp: true } } } },
      unidade: { select: { nomeFantasia: true, slugSubdominio: true, whatsappContato: true } },
    },
  })
}

export async function getClienteByWhatsapp(whatsapp: string) {
  if (isVercel) {
    const { data } = await supabase
      .from("clientes")
      .select("id")
      .eq("whatsapp", whatsapp)
    return data || []
  }
  return prisma.cliente.findMany({
    where: { whatsapp: { equals: whatsapp } },
    select: { id: true },
  })
}

export async function getAparelhosByClienteIds(ids: number[]) {
  if (isVercel) {
    const { data } = await supabase
      .from("aparelhos")
      .select("id")
      .in("id_cliente", ids)
    return data || []
  }
  return prisma.aparelho.findMany({
    where: { idCliente: { in: ids } },
    select: { id: true },
  })
}

export async function getOrdemByAparelhoIds(ids: number[]) {
  if (isVercel) {
    const { data } = await supabase
      .from("ordens_servico")
      .select(`
        *,
        aparelho: id_aparelho (
          *,
          cliente: id_cliente ( nome_completo, whatsapp )
        ),
        unidade: id_unidade ( nome_fantasia, slug_subdominio, whatsapp_contato )
      `)
      .in("id_aparelho", ids)
      .order("data_abertura", { ascending: false })
      .limit(1)
      .single()
    return data || null
  }
  return prisma.ordemServico.findFirst({
    where: { idAparelho: { in: ids } },
    include: {
      aparelho: { include: { cliente: { select: { nomeCompleto: true, whatsapp: true } } } },
      unidade: { select: { nomeFantasia: true, slugSubdominio: true, whatsappContato: true } },
    },
    orderBy: { dataAbertura: "desc" },
  })
}

export async function checkOSExists(idOS: string) {
  if (isVercel) {
    const { data } = await supabase
      .from("ordens_servico")
      .select("id_os")
      .eq("id_os", idOS)
      .single()
    return !!data
  }
  return prisma.ordemServico.findUnique({ where: { idOS } })
}

export async function updateOrdemStatus(idOS: string, statusNovo: string, statusAnterior: string, alteradoPor: number) {
  if (isVercel) {
    const { data } = await supabase
      .from("ordens_servico")
      .update({ status_os: statusNovo, ultima_atualizacao_status: new Date().toISOString() })
      .eq("id_os", idOS)
      .select()
      .single()
    if (!data) throw new Error("Failed to update ordem")
    await supabase.from("status_log").insert({
      id_os: idOS,
      status_anterior: statusAnterior,
      status_novo: statusNovo,
      alterado_por: alteradoPor,
    })
    return data
  }
  const [updated] = await prisma.$transaction([
    prisma.ordemServico.update({
      where: { idOS },
      data: { statusOS: statusNovo as StatusOS, ultimaAtualizacaoStatus: new Date() },
    }),
    prisma.statusLog.create({
      data: { idOS, statusAnterior: statusAnterior as StatusOS, statusNovo: statusNovo as StatusOS, alteradoPor },
    }),
  ])
  return updated
}
