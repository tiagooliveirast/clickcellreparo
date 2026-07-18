"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FiCpu, FiFileText, FiMessageSquare } from "react-icons/fi"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"

const diagnosticosSimulados = [
  "Possível problema na placa lógica. Recomenda-se microscopia para identificar solda fria.",
  "Bateria com sinais de inchaço. Substituição necessária.",
  "Conector de carga com oxidação. Limpeza ultrassônica recomendada.",
  "Display com trincas internas. Substituição do conjunto display/touch necessária.",
  "Falha no chip de áudio. Micro-solda para substituição do componente.",
  "Conector de carga com desgaste mecânico. Troca do conector recomendada.",
  "Problema de software - recomenda-se formatação e teste.",
  "Antena de sinal com mau contato. Reparo na solda da antena.",
]

const laudosSimulados = [
  "Aparelho apresenta falha intermitente no carregamento. Após abertura, constatou-se oxidação no conector de carga. Realizada limpeza química e ultrassônica. Testado com 3 cabos diferentes - funcionando normalmente. Garantia de 90 dias.",
  "Cliente relata tela sem imagem. Constatado display quebrado internamente sem sinais de impacto externo. Substituído conjunto display + touch. Calibração realizada. Testes de toque e imagem OK.",
  "Bateria com autonomia muito baixa (menos de 30 min). Bateria apresenta inchaço. Substituída por bateria original. Ciclo de calibração realizado. Autonomia recuperada para > 24h.",
  "Microfone não funciona em chamadas. Detectado sujeira no conector do microfone inferior. Realizada limpeza. Teste de chamada OK.",
  "Aparelho não liga. Constatado curto na placa lógica. Realizada micro-solda para substituição do capacitor danificado. Aparelho liga e funciona normalmente.",
]

const mensagensSimuladas = [
  "Olá! Passando para informar que o reparo do seu aparelho foi concluído com sucesso ✅ Já estamos realizando os testes finais. O valor do serviço foi de R$ 180,00. Pode passar aqui para retirar? 😊",
  "Boa tarde! Seu aparelho já está em nossa bancada para diagnóstico 🔧 Assim que identificarmos o problema, entraremos em contato com o orçamento detalhado 📋",
  "Olá! Seu aparelho está aguardando a peça chegar (previsão: 3 dias úteis). Assim que chegar, priorizamos o reparo e avisamos! 🙏",
  "Bom dia! Infelizmente identificamos que a placa lógica do seu aparelho está com um dano irreversível. O reparo não é viável tecnicamente. Pode passar para retirar o aparelho sem custos. Qualquer dúvida, estamos à disposição!",
]

export default function AIPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [sintomas, setSintomas] = useState("")
  const [diagnosticoResult, setDiagnosticoResult] = useState("")
  const [diagnosticoLoading, setDiagnosticoLoading] = useState(false)

  const [anotacoes, setAnotacoes] = useState("")
  const [laudoResult, setLaudoResult] = useState("")
  const [laudoLoading, setLaudoLoading] = useState(false)

  const [ordemList, setOrdemList] = useState<{ idOS: string; cliente?: string }[]>([])
  const [selectedOS, setSelectedOS] = useState("")
  const [mensagemResult, setMensagemResult] = useState("")
  const [mensagemLoading, setMensagemLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    if (session?.user?.role === "Master" || session?.user?.role === "Franqueado") {
      router.push(`/${session?.user?.role?.toLowerCase()}`)
      return
    }
    loadOrdens()
  }, [status, session, router])

  const loadOrdens = async () => {
    try {
      const res = await fetch("/api/ordens-servico")
      if (res.ok) {
        const data = await res.json()
        setOrdemList(
          data.map((o: { idOS: string; cliente?: { nomeCompleto: string } }) => ({
            idOS: o.idOS,
            cliente: o.cliente?.nomeCompleto,
          }))
        )
      }
    } catch {
      console.error("Erro ao carregar ordens")
    }
  }

  const handleDiagnosticar = () => {
    if (!sintomas.trim()) return
    setDiagnosticoLoading(true)
    setTimeout(() => {
      const idx = Math.floor(Math.random() * diagnosticosSimulados.length)
      setDiagnosticoResult(diagnosticosSimulados[idx])
      setDiagnosticoLoading(false)
    }, 1500)
  }

  const handleGerarLaudo = () => {
    if (!anotacoes.trim()) return
    setLaudoLoading(true)
    setTimeout(() => {
      const idx = Math.floor(Math.random() * laudosSimulados.length)
      const laudo = `Data: ${new Date().toLocaleDateString("pt-BR")}\n\nAnotações do técnico:\n${anotacoes}\n\n---\n\n${laudosSimulados[idx]}`
      setLaudoResult(laudo)
      setLaudoLoading(false)
    }, 1500)
  }

  const handleGerarMensagem = () => {
    if (!selectedOS) return
    setMensagemLoading(true)
    setTimeout(() => {
      const idx = Math.floor(Math.random() * mensagensSimuladas.length)
      const os = ordemList.find((o) => o.idOS === selectedOS)
      setMensagemResult(`📱 OS: ${selectedOS} - ${os?.cliente || "Cliente"}\n\n${mensagensSimuladas[idx]}`)
      setMensagemLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <FiCpu size={24} className="text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">ClickCell AI</h2>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FiCpu size={20} />
          </div>
          <h3 className="font-semibold text-gray-900">Diagnóstico</h3>
        </div>
        <div className="space-y-3">
          <Input
            label="Sintomas Relatados"
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
            placeholder="Descreva os sintomas relatados pelo cliente..."
          />
          <Button onClick={handleDiagnosticar} loading={diagnosticoLoading}>
            Diagnosticar
          </Button>
          {diagnosticoResult && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-gray-800">
              {diagnosticoResult}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
            <FiFileText size={20} />
          </div>
          <h3 className="font-semibold text-gray-900">Gerar Laudo</h3>
        </div>
        <div className="space-y-3">
          <Input
            label="Anotações do Técnico"
            value={anotacoes}
            onChange={(e) => setAnotacoes(e.target.value)}
            placeholder="Descreva o que foi feito no reparo..."
          />
          <Button onClick={handleGerarLaudo} loading={laudoLoading}>
            Gerar Laudo
          </Button>
          {laudoResult && (
            <div className="whitespace-pre-wrap rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-gray-800 font-mono">
              {laudoResult}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <FiMessageSquare size={20} />
          </div>
          <h3 className="font-semibold text-gray-900">WhatsApp Copilot</h3>
        </div>
        <div className="space-y-3">
          <Select
            label="Selecionar O.S."
            options={[
              { value: "", label: "Selecione uma ordem..." },
              ...ordemList.map((o) => ({ value: o.idOS, label: `${o.idOS} - ${o.cliente || "Sem cliente"}` })),
            ]}
            value={selectedOS}
            onChange={(e) => setSelectedOS(e.target.value)}
          />
          <Button onClick={handleGerarMensagem} loading={mensagemLoading} disabled={!selectedOS}>
            Gerar Mensagem
          </Button>
          {mensagemResult && (
            <div className="whitespace-pre-wrap rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-gray-800">
              {mensagemResult}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
