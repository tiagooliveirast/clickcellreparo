export type Role = "Master" | "Franqueado" | "Tecnico" | "Motoboy"
export type StatusOS =
  | "Recebido"
  | "Triagem"
  | "AguardandoOrcamento"
  | "AguardandoCliente"
  | "AguardandoPeca"
  | "NaBancada"
  | "EmTestes"
  | "Higienizacao"
  | "ProntoParaEntrega"
  | "Finalizado"
export type MetodoPagamento =
  | "AindaNaoPago"
  | "PIX"
  | "CartaoDeCredito"
  | "CartaoDeDebito"
  | "Dinheiro"
  | "LinkExterno"
export type OrigemLead =
  | "Instagram"
  | "GoogleAds"
  | "Indicacao"
  | "PassagemNaLoja"
export type StatusContrato = "Ativo" | "Bloqueado"

export const STATUS_OS_LABELS: Record<StatusOS, string> = {
  Recebido: "Recebido (Aguardando Coleta)",
  Triagem: "Triagem",
  AguardandoOrcamento: "Aguardando Orçamento",
  AguardandoCliente: "Aguardando Cliente",
  AguardandoPeca: "Aguardando Peça",
  NaBancada: "Na Bancada",
  EmTestes: "Em Testes",
  Higienizacao: "Higienização",
  ProntoParaEntrega: "Pronto para Entrega",
  Finalizado: "Finalizado",
}

export const STATUS_OS_ORDER: StatusOS[] = [
  "Recebido",
  "Triagem",
  "AguardandoOrcamento",
  "AguardandoCliente",
  "AguardandoPeca",
  "NaBancada",
  "EmTestes",
  "Higienizacao",
  "ProntoParaEntrega",
  "Finalizado",
]

export const METODO_PAGAMENTO_LABELS: Record<MetodoPagamento, string> = {
  AindaNaoPago: "Ainda não Pago",
  PIX: "PIX",
  CartaoDeCredito: "Cartão de Crédito",
  CartaoDeDebito: "Cartão de Débito",
  Dinheiro: "Dinheiro",
  LinkExterno: "Link Externo",
}

export const ORIGEM_LEAD_LABELS: Record<OrigemLead, string> = {
  Instagram: "Instagram",
  GoogleAds: "Google Ads",
  Indicacao: "Indicação",
  PassagemNaLoja: "Passagem na Loja",
}

export interface UserSession {
  id: number
  idUnidade: number
  nome: string
  email: string
  role: Role
  slug?: string
}
