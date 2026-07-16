# 🌐 Telas Públicas — Portal Click Cell (Sem Login)
## AppSheet Web App / Public Forms — Baseado em Slugs de Unidade

---

## 🧱 Arquitetura do Portal Público

```
                    ┌──────────────────────────────────┐
                    │  ACESSO PÚBLICO (SEM LOGIN)      │
                    │  https://[app].appsheet.com/...  │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │  AppSheet: Tabela de Referência  │
                    │  "Unidades_Franquias"            │
                    │  Filtro: Slug = URL Parameter    │
                    └──────────────┬───────────────────┘
                                   │
              ┌────────────────────┼──────────────────────┐
              │                    │                      │
              ▼                    ▼                      ▼
    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
    │  Landing Page    │ │ Solicitação de   │ │ Rastreamento     │
    │  Conversão       │ │ Coleta (Form)    │ │ Track & Trace    │
    └──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Como Funciona o Roteamento por Slug

No AppSheet Web App, use **Initial Value Expressions** baseadas em parâmetros de URL:

```
App Settings > Deployment > Web App URL Parameters
  → Parâmetro: slug (ex: ?slug=salvador)
```

Cada view pública usa o slug para carregar a unidade correta:

```
LOOKUP([_PARAM("slug")], [Unidades_Franquias], [Slug_Subdominio], [ID_Unidade])
```

---

## 1. Landing Page Pública (`/` ou `/{slug}`)

**Tipo AppSheet:** `View → Dashboard` com `Show as Web Page` (público, sem login)

```
+══════════════════════════════════════════+
║  🔵 CLICK CELL REPAROS                  ║
║  ─────────────────────────────────────── ║
║  🏪 UNIDADE {NOME_FANTASIA_UNIDADE}      ║
║                                          ║
║  📱 Conserto Rápido e Garantido          ║
║  🔧 Todas as Marcas | Todas as Linhas    ║
║                                          ║
║  ✅ Retirada, Orçamento e Entrega        ║
║     com Custo Zero!                      ║
║                                          ║
║  ┌────────────────────────────────────┐  ║
║  │  📞 FALE CONOSCO NO WHATSAPP      │  ║
║  │  💬 {WHATSAPP_CONTATO}            │  ║
║  │     (Toque para abrir)            │  ║
║  └────────────────────────────────────┘  ║
║                                          ║
║  ┌────────────────────────────────────┐  ║
║  │  🛵 SOLICITAR COLETA GRÁTIS       │  ║
║  │  → Vamos buscar seu celular       │  ║
║  └────────────────────────────────────┘  ║
║                                          ║
║  ┌────────────────────────────────────┐  ║
║  │  🔍 RASTREAR MINHA O.S.           │  ║
║  │  → Acompanhe o reparo             │  ║
║  └────────────────────────────────────┘  ║
║                                          ║
║  💳 Aceitamos: PIX | Cartão | Dinheiro   ║
║  Chave PIX: {CHAVE_PIX_PADRAO}          ║
║                                          ║
║  ─────────────────────────────────────── ║
║  © Click Cell - Unidade {NOME_FANTASIA}  ║
╚══════════════════════════════════════════╝
```

### AppSheet Expressions para Landing Page

| Elemento | Expressão |
|----------|-----------|
| Nome Unidade | `LOOKUP([_PARAM("slug")], [Unidades_Franquias], [Slug_Subdominio], [Nome_Fantasia_Unidade])` |
| WhatsApp | `LOOKUP([_PARAM("slug")], [Unidades_Franquias], [Slug_Subdominio], [WhatsApp_Contato])` |
| Chave Pix | `LOOKUP([_PARAM("slug")], [Unidades_Franquias], [Slug_Subdominio], [Chave_Pix_Padrao])` |
| Link WhatsApp | `CONCATENATE("https://wa.me/", [WhatsApp_Contato])` |
| Validar Slug | `NOT(ISBLANK(LOOKUP([_PARAM("slug")], [Unidades_Franquias], [Slug_Subdominio], [ID_Unidade])))` |

### Regras de Exibição

- Se `Status_Contrato = "Bloqueado"` → Exibir página de erro: "Unidade temporariamente indisponível"
- Se slug não existe → Exibir 404: "Unidade não encontrada"

---

## 2. Solicitação de Coleta (`/{slug}/solicitar-coleta`)

**Tipo AppSheet:** `Form → View` com envio público (sem autenticação)

### Fluxo de Criação

```
Cliente preenche formulário
        │
        ▼
AppSheet cria registro em [Clientes] com ID_Unidade do slug
        │
        ▼
AppSheet cria registro em [Aparelhos] vinculado ao ID_Cliente
        │
        ▼
AppSheet cria registro em [Ordens_Servico] vinculado ao ID_Aparelho
  Status = "Recebido (Aguardando Coleta)"
  ID_Unidade herdado
  Data_Abertura = NOW()
        │
        ▼
Exibe mensagem de sucesso com número da O.S.
```

```
+═══════════════════════════════════════════
║  🛵 SOLICITAÇÃO DE COLETA GRÁTIS        ║
║  Unidade: {NOME_FANTASIA}               ║
║                                          ║
║  ── SEUS DADOS ──                       ║
║  Nome Completo * [_________________]     ║
║  WhatsApp *      [_________________]     ║
║  ── ENDEREÇO PARA COLETA ──             ║
║  Rua *           [_________________]     ║
║  Número *        [_________________]     ║
║  Bairro          [_________________]     ║
║  Cidade *        [_________________]     ║
║  Ponto de Ref.   [_________________]     ║
║  ── DADOS DO APARELHO ──                ║
║  Marca *         [iPhone ▼]              ║
║  Modelo *        [_________________]     ║
║  Cor             [_________________]     ║
║  IMEI/Serial     [_________________]     ║
║  ── DEFEITO ──                           ║
║  Qual o problema? *                      ║
║  [Não liga, tela quebrada...         ]   ║
║  ......................................]  ║
║                                          ║
║  [📋 ENTENDI, QUERO AGENDAR A COLETA]   ║
║                                          ║
║  🔒 Seus dados estão seguros             ║
╚══════════════════════════════════════════╝
```

### AppSheet Config: Form Actions

**`OnSubmit` Action (Botão de Envio):**

```
Configurar como "Multi-step" Action:
  1. AddOrCreateRow → [Clientes]
     - ID_Unidade:    LOOKUP([_PARAM("slug")], [Unidades_Franquias], [Slug_Subdominio], [ID_Unidade])
     - Nome_Completo: [Nome_Completo]
     - WhatsApp:      [WhatsApp]
     - Endereco_Rua:  [Endereco_Rua]
     - Endereco_Numero: [Endereco_Numero]
     - Endereco_Bairro: [Endereco_Bairro]
     - Endereco_Cidade: [Endereco_Cidade]
     - Endereco_Ponto_Referencia: [Endereco_Ponto_Referencia]
     - Origem_Lead:   "Instagram" (ou campo separado)
     - Data_Cadastro: NOW()

  2. Set_columns_values → variável temporária [ID_Cliente_Criado]
     - Expressão: LAST(FILTER([Clientes], [WhatsApp] = [_THISROW].[WhatsApp] AND [Data_Cadastro] = NOW()), [ID_Cliente])

  3. AddOrCreateRow → [Aparelhos]
     - ID_Cliente:  [ID_Cliente_Criado]
     - Marca:       [Marca]
     - Modelo:      [Modelo]
     - Cor:         [Cor]
     - IMEI_Serial: [IMEI_Serial]

  4. Set_columns_values → variável temporária [ID_Aparelho_Criado]
     - Expressão: LAST(FILTER([Aparelhos], [ID_Cliente] = [ID_Cliente_Criado]), [ID_Aparelho])

  5. AddOrCreateRow → [Ordens_Servico]
     - ID_OS:          "OS-" & YEAR(NOW()) & "-" & TEXT(COUNT(FILTER([Ordens_Servico], YEAR([Data_Abertura]) = YEAR(NOW()))) + 1, "0000")
     - ID_Unidade:     LOOKUP([_PARAM("slug")], [Unidades_Franquias], [Slug_Subdominio], [ID_Unidade])
     - ID_Aparelho:    [ID_Aparelho_Criado]
     - Sintoma_Reclamado: [Sintoma_Reclamado]
     - Status_OS:      "Recebido"
     - Data_Abertura:  NOW()
     - Ultima_Atualizacao_Status: NOW()

  6. Show_Message → "✅ Coleta Agendada! Seu número de O.S. é OS-2026-XXXX. Entraremos em contato pelo WhatsApp."
```

---

## 3. Rastreamento de Status — Track & Trace (`/{slug}/rastrear`)

**Tipo AppSheet:** `View → Dashboard` público com `InitialValue` baseado no formulário de consulta.

### Etapa 1: Formulário de Consulta (Sem Senha)

```
+═══════════════════════════════════════════
║  🔍 ACOMPANHE SEU REPARO                ║
║                                          ║
║  Digite seu número de O.S. ou WhatsApp:  ║
║  [_________________________]             ║
║                                          ║
║  [🔍 RASTREAR]                           ║
╚══════════════════════════════════════════╝
```

### Etapa 2: Resultado do Rastreamento

```
+═══════════════════════════════════════════
║  🔍 OS-2026-0012 — STATUS DO REPARO    ║
║                                          ║
║  Aparelho: iPhone 13 Pro · Apple        ║
║  Cliente: João Silva                    ║
║                                          ║
║  ── PROGRESSO ──                         ║
║  [✅] [✅] [✅] [⬜] [⬜] [⬜] [⬜]     ║
║  🟢    🟢   🟢   ⚪   ⚪   ⚪   ⚪      ║
║  R   T   A.O  A.C  A.P  N.B  E.T       ║
║  [⬜] [⬜] [⬜]                          ║
║  ⚪   ⚪   ⚪                            ║
║  H   P.E  F                              ║
║                                          ║
║  Status Atual: Aguardando Cliente        ║
║  Última atualização: 15/07/2026 14:30   ║
║                                          ║
║  ── FOTOS DO APARELHO ──                ║
║  [📸 Frente] [📸 Verso] [📸 Detalhe]   ║
║                                          ║
║  ── LAUDO TÉCNICO ──                    ║
║  "Aparelho apresenta falha no           ║
║   conector de carga. Necessário         ║
║   substituição da peça."                ║
║                                          ║
║  ┌────────────────────────────────────┐  ║
║  │  ✅ APROVAR REPARO                 │  ║
║  │  (Status: Aguardando Cliente)      │  ║
║  └────────────────────────────────────┘  ║
║                                          ║
║  📞 Dúvidas? Fale conosco:              ║
║  💬 {WHATSAPP_CONTATO}                  ║
╚══════════════════════════════════════════╝
```

### AppSheet Expressions para Rastreamento

| Elemento | Expressão |
|----------|-----------|
| Carregar O.S. | `IF(LEFT([_PARAM("consulta")], 3) = "OS-", FILTER([Ordens_Servico], [ID_OS] = [_PARAM("consulta")]), FILTER([Ordens_Servico], IN([_PARAM("consulta")], [Clientes].[WhatsApp], [Clientes.ID_Cliente])))` |
| Unidade da O.S. | `LOOKUP([Ordens_Servico.ID_Unidade], [Unidades_Franquias], [ID_Unidade], [Nome_Fantasia_Unidade])` |
| WhatsApp da Unidade | `LOOKUP([Ordens_Servico.ID_Unidade], [Unidades_Franquias], [ID_Unidade], [WhatsApp_Contato])` |
| Barra de Progresso | `SWITCH([Status_OS], "Recebido", 1, "Triagem", 2, "Aguardando Orcamento", 3, "Aguardando Cliente", 4, "Aguardando Peca", 5, "Na Bancada", 6, "Em Testes", 7, "Higienizacao", 8, "Pronto para Entrega", 9, "Finalizado", 10)` |

### Barra de Progresso Visual (AppSheet via Partial)

Crie uma **Virtual Column** chamada `Progresso_Pct`:

```
([Progresso_Num] / 10) * 100
```

Onde `Progresso_Num` é:

```
SWITCH([Status_OS],
  "Recebido", 1,
  "Triagem", 2,
  "Aguardando Orcamento", 3,
  "Aguardando Cliente", 4,
  "Aguardando Peca", 5,
  "Na Bancada", 6,
  "Em Testes", 7,
  "Higienizacao", 8,
  "Pronto para Entrega", 9,
  "Finalizado", 10)
```

### Etapa 3: Botão "Aprovar Reparo" (Ação Pública)

**Visível apenas quando:** `[Status_OS] = "Aguardando Cliente"`

**Configuração:** Action do tipo `Data Action → Set Columns Values`

```
Nome: Aprovar_Reparo_Publico
Expressão:
  IF([Status_OS] = "Aguardando Cliente",
     {Status_OS: "Na Bancada",
      Ultima_Atualizacao_Status: NOW()},
     {Status_OS: [Status_OS]})
Condição de Exibição:
  [Status_OS] = "Aguardando Cliente"
```

> **Nota de Segurança:** Esta ação é pública, portanto não requer login. Para evitar abusos, a O.S. só é visível via consulta por número O.S. + WhatsApp (confirmação dupla). Implemente na Etapa 1 a **validação dupla**: cliente deve informar **Número da O.S.** E **WhatsApp** para acessar o tracking completo.

---

## 4. Detalhes Técnicos de Implementação no AppSheet

### 4.1. Configuração de Segurança para Views Públicas

```
AppSheet > App > Security > Authentication
  → App Access: "Everyone (Public)"

AppSheet > App > Security > Data Access
  → Para [Clientes], [Aparelhos], [Ordens_Servico]:
     → "Allow anonymous access?": YES (apenas para CREATE de solicitações)
     → "Row-Level Security": Ativado via Slice
```

### 4.2. Slice Público para Solicitação de Coleta

```
Nome: Slice_Solicitacao_Publica
Base Table: [Clientes]
Row Filter: FALSE (não lê dados existentes, apenas cria novos)
Allow Add: YES (permite criar novos registros)
Allow Edit: NO
Allow Delete: NO
```

Use esta slice para o formulário de solicitação pública.

### 4.3. Segmentação de Views Públicas vs Privadas

| View | Pública? | Requer Slug? | Autenticação |
|------|----------|-------------|--------------|
| Landing Page | ✅ Sim | ✅ Sim | Nenhuma |
| Solicitar Coleta | ✅ Sim | ✅ Sim | Nenhuma |
| Rastrear O.S. | ✅ Sim | ✅ Sim | Nenhuma (ou validação dupla) |
| Dashboard Master | ❌ Não | ❌ Não | Login Obrigatório |
| Kanban Técnico | ❌ Não | ❌ Não | Login Obrigatório |
| Financeiro | ❌ Não | ❌ Não | Login Obrigatório |

### 4.4. URL Parameters AppSheet

Configure em: **App Settings > Deployment > Web App URL Parameters**

| Parâmetro | Tipo | Exemplo | Função |
|-----------|------|---------|--------|
| `slug` | Text | `salvador` | Identifica a unidade |
| `consulta` | Text | `OS-2026-0012` | Código O.S. ou WhatsApp |
| `mode` | Text | `coleta`, `rastrear` | Define qual view carregar |

### 4.5. Expressão de Redirecionamento (Initial View)

Na configuração de **Default View**, use a expressão:

```
IF(ISBLANK([_PARAM("mode")]),
   "Landing_Page",
   SWITCH([_PARAM("mode")],
     "coleta", "Solicitar_Coleta",
     "rastrear", IF(ISBLANK([_PARAM("consulta")]), "Form_Rastrear", "Resultado_Rastreamento"),
     "Landing_Page"))
```

### 4.6. URLs Amigáveis (Exemplos)

```
Landing:            https://app.appsheet.com/start/APP_ID?slug=salvador
Solicitar Coleta:   https://app.appsheet.com/start/APP_ID?slug=salvador&mode=coleta
Rastrear:           https://app.appsheet.com/start/APP_ID?slug=salvador&mode=rastrear
Resultado:          https://app.appsheet.com/start/APP_ID?slug=salvador&mode=rastrear&consulta=OS-2026-0012
```

Para URLs mais limpas, use um **Web App Wrapper** (Google Sites, ou redirecionador simples):

```
https://www.clickcell.com/salvador          → redireciona para AppSheet com ?slug=salvador
https://www.clickcell.com/salvador/coleta   → redireciona para AppSheet com ?slug=salvador&mode=coleta
```
