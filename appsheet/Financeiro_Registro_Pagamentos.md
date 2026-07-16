# 💰 Módulo Financeiro — Registro Manual de Pagamentos
## Click Cell OS — AppSheet (Sem Gateway de Integração)

---

## 📌 Premissa Fundamental

> **O sistema NÃO se comunica com bancos, intermediários de pagamento ou APIs financeiras externas.**  
> Todos os pagamentos são recebidos fisicamente (fora do sistema) e apenas **registrados** no AppSheet para controle de caixa e cálculo de margens.

---

## 1. Campos de Pagamento na Tabela `Ordens_Servico`

| Coluna | Tipo | Uso | Preenchido Por |
|--------|------|-----|---------------|
| **Preco_Orcado_Cliente** | `Currency` | Valor total orçado / cobrado do cliente | Técnico ou Franqueado |
| **Custo_Peca** | `Currency` | Custo da peça para a franquia | Franqueado ou Master |
| **Custo_Mao_Obra_Tecnico** | `Currency` | Custo da mão de obra (comissão do técnico) | Franqueado |
| **Metodo_Pagamento_Registro** 📋 | `Enum Text` | Canal de pagamento usado pelo cliente (fora do sistema) | Franqueado ou Master |
| **Data_Fechamento** | `DateTime` | Timestamp da finalização e registro do pagamento | Automático ao mudar status p/ "Finalizado" |

### Valores Permitidos: `Metodo_Pagamento_Registro`

| Valor | Significado |
|-------|-------------|
| `Ainda nao Pago` | Default — OS ainda não quitada |
| `PIX` | Cliente pagou via PIX (para a chave da loja) |
| `Cartao de Credito` | Pagamento com cartão de crédito (na maquininha física) |
| `Cartao de Debito` | Pagamento com cartão de débito (na maquininha física) |
| `Dinheiro` | Pagamento em espécie |
| `Link Externo` | Link de pagamento gerado fora do sistema (mercado pago etc.) |

---

## 2. Cálculo Automatizado de Lucro Líquido

### Virtual Column: `Lucro_Liquido_Servico`

```
[Preco_Orcado_Cliente] - ([Custo_Peca] + [Custo_Mao_Obra_Tecnico])
```

### Virtual Column: `Margem_Percentual`

```
IF([Preco_Orcado_Cliente] > 0,
   ROUND(([Lucro_Liquido_Servico] / [Preco_Orcado_Cliente]) * 100, 1),
   0)
```

---

## 3. Telas de Registro de Pagamento

### 3.1. Tela: `Registrar_Pagamento_Form`

**Acessível por:** Master, Franqueado  
**Visível quando:** `[Status_OS] = "Finalizado"` ou no momento da finalização

```
+═══════════════════════════════════════════
║  💰 REGISTRAR PAGAMENTO                  ║
║                                          ║
║  O.S.: OS-2026-0012                      ║
║  Cliente: João Silva                     ║
║  Aparelho: iPhone 13 Pro                 ║
║                                          ║
║  ── VALORES ──                           ║
║  💲 Preço Orçado:   R$ [_____350,00__]  ║
║  🔧 Custo Peça:     R$ [_____120,00__]  ║
║  👨‍🔧 Mão de Obra:   R$ [______80,00__]  ║
║  ─────────────────────────────────────── ║
║  📊 Lucro Estimado: R$ 150,00           ║
║  📊 Margem: 42,9%                        ║
║                                          ║
║  ── PAGAMENTO ──                         ║
║  Como o cliente pagou? *                 ║
║  [PIX ▼]                                 ║
║    ├── Ainda nao Pago                    ║
║    ├── PIX                               ║
║    ├── Cartao de Credito                 ║
║    ├── Cartao de Debito                  ║
║    ├── Dinheiro                          ║
║    └── Link Externo                      ║
║                                          ║
║  ─────────────────────────────────────── ║
║  ⚠️ Pagamento recebido fora do sistema.  ║
║  Este é apenas um registro de controle.  ║
║                                          ║
║  [✅ Registrar Pagamento]                ║
╚══════════════════════════════════════════╝
```

### 3.2. Tela: `Detalhe_Financeiro_OS` (Somente Leitura para Técnico)

```
+═══════════════════════════════════════════
║  💰 DETALHES FINANCEIROS                 ║
║                                          ║
║  O.S.: OS-2026-0012                      ║
║                                           ║
║  Preço Orçado:     R$ 350,00             ║
║  Custo Peça:       R$ 120,00             ║
║  Custo Mão de Obra: R$ 80,00              ║
║  ──────────────────────────────────────── ║
║  Lucro Líquido:    R$ 150,00             ║
║  Margem:           42,9%                  ║
║  ──────────────────────────────────────── ║
║  Método Pagamento: PIX                   ║
║  Data Fechamento:  16/07/2026            ║
╚══════════════════════════════════════════╝
```

> **Regra de Visibilidade para Técnico:**  
> `SHOW_IF = IN(CONTEXT("Role"), "Master", "Franqueado")`  
> Se for Técnico ou Motoboy, a seção financeira fica **completamente oculta**.

---

## 4. Action: `Finalizar_OS_Com_Pagamento`

**Disparada por:** Botão na tela da O.S. ou ao mover status para "Finalizado"

### Configuração (Multi-Step Action)

| Passo | Tipo | Detalhes |
|-------|------|----------|
| 1 | `Set Columns Values` | `{Status_OS: "Finalizado", Data_Fechamento: NOW(), Ultima_Atualizacao_Status: NOW()}` |
| 2 | Validação | Se `Metodo_Pagamento_Registro = "Ainda nao Pago"` → Exibir aviso: "Confirma que o cliente ainda não pagou?" |
| 3 | `Show Message` | "✅ O.S. {ID_OS} finalizada. Pagamento registrado como {Metodo_Pagamento_Registro}." |

---

## 5. Financeiro — Views de Dashboard

### 5.1. Painel Financeiro (Franqueado / Master)

```
+═══════════════════════════════════════════
║  💰 FINANCEIRO — UNIDADE SALVADOR       ║
║                                          ║
║  ┌──────────────┐  ┌──────────────────┐  ║
║  │ 📅 HOJE      │  │ 📅 ESTE MÊS      │  ║
║  │ R$ 1.250,00 │  │ R$ 22.300,00     │  ║
║  │ (5 O.S.)    │  │ (127 O.S.)       │  ║
║  └──────────────┘  └──────────────────┘  ║
║                                          ║
║  ── MARGEM MÉDIA DO MÊS ──              ║
║  [████████████░░░░░░░] 62,3%            ║
║                                          ║
║  ── MÉTODOS DE PAGAMENTO ──             ║
║  PIX:               R$ 12.800,00 (57%)  ║
║  Cartão de Crédito: R$  5.400,00 (24%)  ║
║  Dinheiro:          R$  3.100,00 (14%)  ║
║  Cartão de Débito:  R$  1.000,00 (4%)   ║
║  Link Externo:      R$    0,00   (0%)   ║
║  Ainda não Pago:    R$  2.500,00        ║
║                                          ║
║  ── O.S. POR STATUS ──                  ║
║  Finalizadas:       89                  ║
║  Em andamento:      38                  ║
║  Aguardando Cliente:  5                 ║
║  Aguardando Peça:     7                 ║
║                                          ║
║  [📊 Exportar Relatório]                 ║
╚══════════════════════════════════════════╝
```

### 5.2. Expressões AppSheet para o Dashboard

| Métrica | Expressão |
|---------|-----------|
| Faturamento Hoje | `SUM(FILTER([Ordens_Servico], DATE([Data_Fechamento]) = TODAY()), [Preco_Orcado_Cliente])` |
| Faturamento Mês | `SUM(FILTER([Ordens_Servico], MONTH([Data_Fechamento]) = MONTH(TODAY()) AND YEAR([Data_Fechamento]) = YEAR(TODAY())), [Preco_Orcado_Cliente])` |
| Lucro Líquido Mês | `SUM(FILTER([Ordens_Servico], MONTH([Data_Fechamento]) = MONTH(TODAY()) AND YEAR([Data_Fechamento]) = YEAR(TODAY())), [Preco_Orcado_Cliente] - ([Custo_Peca] + [Custo_Mao_Obra_Tecnico]))` |
| Margem Média % | `ROUND(([Lucro_Mes] / [Faturamento_Mes]) * 100, 1)` (se faturamento > 0) |
| Total PIX | `SUM(FILTER([Ordens_Servico], MONTH([Data_Fechamento]) = MONTH(TODAY()) AND YEAR([Data_Fechamento]) = YEAR(TODAY()) AND [Metodo_Pagamento_Registro] = "PIX"), [Preco_Orcado_Cliente])` |
| A Receber | `SUM(FILTER([Ordens_Servico], [Status_OS] = "Finalizado" AND [Metodo_Pagamento_Registro] = "Ainda nao Pago"), [Preco_Orcado_Cliente])` |

---

## 6. Regras de Segurança Financeira

### Visualização de Dados Financeiros por Role

| Elemento | Master | Franqueado | Técnico | Motoboy |
|----------|--------|------------|---------|---------|
| Preço Orçado | ✅ | ✅ | 🔒 Somente leitura | ❌ Oculto |
| Custo Peça | ✅ | ✅ | ❌ Oculto | ❌ Oculto |
| Custo Mão de Obra | ✅ | ✅ | ❌ Oculto | ❌ Oculto |
| Método Pagamento | ✅ | ✅ | ❌ Oculto | ❌ Oculto |
| Lucro/Margem | ✅ | ✅ | ❌ Oculto | ❌ Oculto |
| Dashboard Financeiro | ✅ (Global) | ✅ (Sua Unidade) | ❌ Oculto | ❌ Oculto |

### AppSheet Security Filter: Financeiro

```
IF(IN(CONTEXT("Role"), "Master"), TRUE,
   IF(IN(CONTEXT("Role"), "Franqueado"),
      [ID_Unidade] = CONTEXT("ID_Unidade"),
      FALSE))
```

---

## 7. Checklist de Verificação (Sem Gateway)

- [ ] **❌ NENHUMA** chamada `HTTP` ou `API` para gateways de pagamento
- [ ] **❌ NENHUM** campo de "token de transação" ou "ID do gateway"
- [ ] **❌ NENHUMA** integração com Stripe, Mercado Pago, PagSeguro, etc.
- [ ] **✅** Único campo de método de pagamento: `Metodo_Pagamento_Registro` (Enum manual)
- [ ] **✅** Valores financeiros inseridos manualmente pelo operador
- [ ] **✅** Cálculo de lucro é puramente matemático (não envolve taxas de gateway)
- [ ] **✅** Técnico e Motoboy **NÃO** enxergam valores

---

## 8. Ações de Botão por Tela Financeira

| Tela | Botão | Ação | AppSheet Config |
|------|-------|------|-----------------|
| Detalhe da O.S. (status Finalizado) | [Registrar Pagamento] | Abre formulário `Registrar_Pagamento_Form` | `Action: OpenForm` |
| `Registrar_Pagamento_Form` | [✅ Salvar] | Salva valores + método + data | `Action: Data:SetColumnsValues` |
| Dashboard Financeiro | [📊 Exportar] | Exporta dados do mês para PDF/CSV | `Action: Export` |
| O.S. em "Pronto para Entrega" | [💳 Finalizar e Registrar] | Multi-step: Status→Finalizado + form pagamento | `Action: Multi-step` |
