# 📱 Fluxo de Telas Mobile-First — Click Cell OS
## Navegação e Regras de Visibilidade por Role (AppSheet)

---

## 🧭 Visão Geral da Navegação

```
                    ┌─────────────────┐
                    │   TELA LOGIN    │
                    │  /login         │
                    │  (Sem auto-     │
                    │   cadastro)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   App Principal │
                    │ (Nav Bottom)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │  Master   │ │Franqueado │ │  Técnico  │
        │ (Global)  │ │ (Unidade) │ │(Bancada)  │
        └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
              │              │              │
        ┌─────▼─────┐       │              │
        │  Motoboy  │       │              │
        │  (Rua)    │       │              │
        └───────────┘       │              │
                            │              │
                    ┌───────▼───────┐ ┌─────▼──────┐
                    │  Portal       │ │  Área do   │
                    │  Público      │ │  Cliente   │
                    │  (Sem Login)  │ │  (Track)   │
                    └───────────────┘ └────────────┘
```

---

## 1. Tela de Login (`/login`)

| Item | Configuração |
|------|-------------|
| **Tipo de View** | `Form` — Login AppSheet nativo |
| **Autenticação** | AppSheet Account (Google) ou Email + Senha |
| **Auto-cadastro** | ❌ **DESABILITADO** — AppSheet Settings > Security > Disable "Allow sign-ups" |
| **Redirecionamento** | Após login → Navigation baseada na `Role` do usuário logado |

### Fluxo de Login

```
Usuário abre app → Tela de Login → Credenciais válidas?
  ├── SIM → Ler [Usuarios] onde Email = USEREMAIL()
  │         Extrair Role e ID_Unidade → Navegar para Home da Role
  └── NÃO → Exibir erro "Credenciais inválidas"
```

---

## 2. Navegação Master (Franqueadora)

**Acesso:** Leitura e escrita global em todas as unidades.

### Bottom Navigation Bar

| Ícone | Título | View | Descrição |
|-------|--------|------|-----------|
| 🏠 | Dashboard | `Dashboard_Master` | KPIs globais: Total de O.S., Unidades Ativas, Faturamento Bruto Agregado |
| 🏢 | Franquias | `Unidades_Table` | CRUD de `Unidades_Franquias` + Botão "Nova Unidade" |
| 👥 | Usuários | `Usuarios_Table` | Lista de todos os usuários do sistema |
| 📋 | O.S. Global | `Ordens_Table_Master` | Todas as O.S. de todas as unidades com filtro por unidade |
| 📊 | Relatórios | `Relatorios_Master` | Gráficos consolidados por unidade |

### View: `Dashboard_Master`

```
+------------------------------------------+
|  👑 MASTER - PAINEL GLOBAL               |
+------------------------------------------+
|  Unidades Ativas:  12    Total O.S.: 1.234|
|  Faturamento Mês: R$ 89.450,00           |
+------------------------------------------+
|  [📋 Últimas O.S.]                        |
|  OS-2026-0012 │ Salvador │ Finalizado     |
|  OS-2026-0013 │ Lauro    │ Na Bancada     |
+------------------------------------------+
|  [➕ Nova Unidade]                         |
|  [📊 Exportar Relatório]                  |
+------------------------------------------+
```

### View: `Nova_Unidade_Form` (Popup/Form)

```
+------------------------------------------+
|  🏢 NOVA FRANQUIA                        |
+------------------------------------------+
|  Nome Fantasia: [_________________]      |
|  Slug: [_________________]                |
|  WhatsApp: [_________________]            |
|  Chave Pix: [_________________]           |
|  Status Contrato: [Ativo ▼]              |
+------------------------------------------+
|  ── DADOS DO PRIMEIRO FRANQUEADO ──      |
|  Nome: [_________________]                |
|  Email: [_________________]              |
|  Senha: [_________________]              |
+------------------------------------------+
|  [✅ Criar Unidade + Franqueado]          |
+------------------------------------------+
```

### Regras de Visibilidade (Master)

| Elemento | Regra AppSheet |
|----------|---------------|
| Botão "Nova Unidade" | `IN([Role], "Master")` |
| Todas as Unidades | Sem filtro de segurança |
| Todos os Usuários | `IN([Role], "Master")` |
| Relatórios Financeiros | `IN([Role], "Master")` |
| Editar qualquer registro | `IN([Role], "Master")` |

---

## 3. Navegação Franqueado (Dono de Unidade)

**Acesso:** Restrito aos dados da sua própria unidade.

### Bottom Navigation Bar

| Ícone | Título | View | Descrição |
|-------|--------|------|-----------|
| 🏠 | Painel | `Dashboard_Franqueado` | KPIs da unidade: O.S. abertas, faturamento mensal, estoque |
| 📋 | O.S. | `Ordens_Table_Unidade` | Kanban/Table de O.S. da sua unidade |
| 👥 | Clientes | `Clientes_Table` | Base de clientes da unidade |
| 👤 | Equipe | `Equipe_Table` | Gerenciamento de usuários da unidade (Técnicos + Motoboys) |
| 💰 | Financeiro | `Financeiro_Unidade` | Receitas, despesas e margens da unidade |

### View: `Dashboard_Franqueado`

```
+------------------------------------------+
|  🏪 SALVADOR - PAINEL DA UNIDADE         |
+------------------------------------------+
|  📊 O.S. Hoje: 5   📊 Este Mês: 127      |
|  💰 Faturamento Mês: R$ 22.300,00        |
|  📈 Margem Média: 62%                     |
+------------------------------------------+
|  [🔴 Aguardando Cliente: 3]              |
|  [🟡 Aguardando Peça: 2]                 |
|  [🟢 Pronto para Entrega: 5]             |
+------------------------------------------+
|  [➕ Nova O.S.]  [👤 Nova Equipe]         |
+------------------------------------------+
```

### View: `Equipe_Table` — Adicionar Usuário

```
+------------------------------------------+
|  👤 MINHA EQUIPE                         |
+------------------------------------------+
|  [Buscar...                      🔍]     |
+------------------------------------------+
|  João Silva          Técnico      [✏️]   |
|  Maria Santos        Motoboy      [✏️]   |
|  Carlos Pereira      Técnico      [✏️]   |
+------------------------------------------+
|  [➕ Adicionar Membro]                    |
+------------------------------------------+
```

### Formulário: `Novo_Usuario_Form`

```
+------------------------------------------+
|  👤 NOVO MEMBRO DA EQUIPE                |
+------------------------------------------+
|  Nome: [_________________]                |
|  Email: [_________________]              |
|  Senha: [_________________]              |
|  Cargo: [Técnico ▼]                       |
|  Telefone: [_________________]            |
+------------------------------------------+
|  [✅ Adicionar]                           |
+------------------------------------------+
```

> **Regra Crítica:** `ID_Unidade` é automaticamente herdado do usuário logado via `LOOKUP(USEREMAIL(), [Usuarios], [Email], [ID_Unidade])`.

### Regras de Visibilidade (Franqueado)

| Elemento | Regra AppSheet |
|----------|---------------|
| Dados visíveis | `[ID_Unidade] = USERCONTEXT("ID_Unidade")` |
| Botão "Nova O.S." | `IN([Role], "Master", "Franqueado", "Tecnico")` |
| Aba Financeiro | `IN([Role], "Master", "Franqueado")` |
| Gerenciar Equipe | `IN([Role], "Master", "Franqueado")` |
| Editar valores financeiros | `IN([Role], "Master", "Franqueado")` |

---

## 4. Navegação Técnico (Operacional de Bancada)

**Acesso:** Restrito às O.S. delegadas a ele. **Sem acesso ao módulo financeiro.**

### Bottom Navigation Bar

| Ícone | Título | View | Descrição |
|-------|--------|------|-----------|
| 🔧 | Minhas O.S. | `Ordens_Tecnico` | Kanban das O.S. delegadas a ele |
| 📋 | Bancada | `Bancada_View` | O.S. com status "Na Bancada" |
| 👁️ | Clientes | `Clientes_Consulta` | Leitura de dados dos clientes das suas O.S. |
| 🤖 | IA | `ClickCell_AI` | Diagnóstico e geração de laudos |

### View: `Ordens_Tecnico` (Kanban)

```
+------------------------------------------+
|  🔧 MINHAS ORDENS DE SERVIÇO            |
+------------------------------------------+
|  ┌──────────┐ ┌──────────┐ ┌──────────┐ |
|  │ TRIAGEM  │ │NA BANCADA│ │EM TESTES │ |
|  │ (2)      │ │ (3)      │ │ (1)      │ |
|  ├──────────┤ ├──────────┤ ├──────────┤ |
|  │ OS-0001  │ │ OS-0005  │ │ OS-0003  │ |
|  │ iPhone13 │ │ S24      │ │ A54      │ |
|  │ 📸⬜2/2  │ │ ⏳Aguar..│ │ ✅Testar │ |
|  └──────────┘ └──────────┘ └──────────┘ |
|  [🔄 Avançar Status] [📸 Check-in]       |
+------------------------------------------+
```

### View: `Checklist_Saida_Form` (Obrigatório antes de "Pronto para Entrega")

```
+------------------------------------------+
|  ✅ CONTROLE DE QUALIDADE - SAÍDA        |
+------------------------------------------+
|  Aparelho: iPhone 13 Pro - OS-2026-0012  |
+------------------------------------------+
|  ☑ Face ID / Biometria              [✅] |
|  ☑ Touchscreen                       [⬜] |
|  ☑ Conexão Wi-Fi                     [⬜] |
|  ☑ Microfone                         [⬜] |
|  ☑ Alto-Falantes                     [⬜] |
|  ☑ Conector de Carga                 [⬜] |
+------------------------------------------+
|  Todos verificados? [NÃO]                |
+------------------------------------------+
|  [✅ Finalizar Testes] (desabilitado     |
|   até todos os checkboxes serem TRUE)    |
+------------------------------------------+
```

### View: `ClickCell_AI` — IA de Suporte

```
+------------------------------------------+
|  🤖 CLICK CELL AI                        |
+------------------------------------------+
|  ── DIAGNÓSTICO INTELIGENTE ──           |
|  Sintomas:                               |
|  [Aparelho não liga,                   ] |
|  ........................................] |
|  [🤖 Diagnosticar]                       |
|  ─────────────────────────────────────    |
|  Possíveis causas:                        |
|  • Bateria descarregada (75%)            |
|  • Conector de carga danificado (20%)    |
|  • Placa lógica (5%)                     |
|  ── GERADOR DE LAUDOS ──                 |
|  Anotações:                              |
|  [troca conector de carga,        ]      |
|  [testes ok, bateria 92%         ]      |
|  [🤖 Gerar Laudo] [📄 Baixar PDF]        |
|  ── WHATSAPP COPILOT ──                  |
|  [💬 Gerar Mensagem para Cliente]        |
|  "Olá {Nome}, o reparo do seu {Modelo}   |
|   está em andamento. Previsão..."         |
|  [📋 Copiar]                              |
+------------------------------------------+
```

### Regras de Visibilidade (Técnico)

| Elemento | Regra AppSheet |
|----------|---------------|
| O.S. visíveis | `[ID_Tecnico_Responsavel] = USERCONTEXT("ID_Usuario")` |
| Check-list de saída | `IN([Role], "Tecnico")` E `[Status_OS] = "Em Testes"` |
| IA / Laudos | `IN([Role], "Master", "Franqueado", "Tecnico")` |
| Aba Financeiro | ❌ **OCULTA** |
| Preço/ Custos | Campos somente leitura |
| Criar O.S. | `IN([Role], "Master", "Franqueado", "Tecnico")` |

---

## 5. Navegação Motoboy (Operacional de Rua)

**Acesso:** Restrito a coletas, entregas e assinaturas digitais.

### Bottom Navigation Bar

| Ícone | Título | View | Descrição |
|-------|--------|------|-----------|
| 📦 | Coletas | `Coletas_Motoboy` | O.S. com status "Recebido" para coleta |
| 🚚 | Entregas | `Entregas_Motoboy` | O.S. com status "Pronto para Entrega" |
| ✍️ | Assinaturas | `Assinaturas_Pendentes` | Pendências de assinatura |
| 🗺️ | Rotas | `Mapa_Rotas` | Mapa com endereços do dia |

### View: `Coletas_Motoboy`

```
+------------------------------------------+
|  📦 COLETAS PENDENTES (3)               |
+------------------------------------------+
|  ┌──────────────────────────────────────┐ |
|  │ OS-2026-0010 │ Rua A, 123           │ |
|  │ Cliente: João │ Salvador            │ |
|  │ 📍[Ver Rota]  [✅ Coletar]          │ |
|  ├──────────────────────────────────────┤ |
|  │ OS-2026-0011 │ Av B, 456            │ |
|  │ Cliente: Maria │ Salvador           │ |
|  │ 📍[Ver Rota]  [✅ Coletar]          │ |
|  └──────────────────────────────────────┘ |
+------------------------------------------+
```

### View: `Assinar_Entrega_Form`

```
+------------------------------------------+
|  ✍️ CONFIRMAR ENTREGA                    |
+------------------------------------------+
|  OS: OS-2026-0010                        |
|  Cliente: João Silva                     |
|  Aparelho: iPhone 13 Pro                 |
+------------------------------------------+
|  ── ASSINATURA DO CLIENTE ──             |
|  ┌──────────────────────────────────┐    |
|  │                                  │    |
|  │   [Assine aqui]                  │    |
|  │                                  │    |
|  └──────────────────────────────────┘    |
|  [🔄 Limpar]  [✅ Confirmar Assinatura]  |
+------------------------------------------+
|  📍 GPS: -12.9714, -38.5012 (capturado) │
|  🌐 IP: 189.45.67.89 (capturado)        |
+------------------------------------------+
```

### Regras de Visibilidade (Motoboy)

| Elemento | Regra AppSheet |
|----------|---------------|
| O.S. visíveis (coletas) | `[ID_Motoboy_Responsavel] = USERCONTEXT("ID_Usuario")` E `[Status_OS] = "Recebido"` |
| O.S. visíveis (entregas) | `[ID_Motoboy_Responsavel] = USERCONTEXT("ID_Usuario")` E `[Status_OS] = "Pronto para Entrega"` |
| Assinatura Digital | `IN([Role], "Master", "Motoboy")` |
| Aba Financeiro | ❌ **OCULTA** |
| Valores | ❌ **OCULTO** |
| Mapa de Rotas | `IN([Role], "Master", "Motoboy", "Franqueado")` |

---

## 6. Slice Definitions (AppSheet Security Filters)

### Slice: `Clientes_Visiveis`

```
IF(IN(CONTEXT("Role"), "Master"), TRUE,
   IF(IN(CONTEXT("Role"), "Franqueado"),
      [ID_Unidade] = CONTEXT("ID_Unidade"),
      IF(IN(CONTEXT("Role"), "Tecnico"),
         IN([ID_Cliente], FILTER("Ordens_Servico", 
            [ID_Tecnico_Responsavel] = CONTEXT("ID_Usuario")).ID_Cliente),
         IF(IN(CONTEXT("Role"), "Motoboy"),
            IN([ID_Cliente], FILTER("Ordens_Servico",
               [ID_Motoboy_Responsavel] = CONTEXT("ID_Usuario")).ID_Cliente),
            FALSE))))
```

### Slice: `Ordens_Visiveis`

```
IF(IN(CONTEXT("Role"), "Master"), TRUE,
   IF(IN(CONTEXT("Role"), "Franqueado"),
      [ID_Unidade] = CONTEXT("ID_Unidade"),
      IF(IN(CONTEXT("Role"), "Tecnico"),
         [ID_Tecnico_Responsavel] = CONTEXT("ID_Usuario"),
         IF(IN(CONTEXT("Role"), "Motoboy"),
            [ID_Motoboy_Responsavel] = CONTEXT("ID_Usuario"),
            FALSE))))
```

### AppSheet User Context Expressions

Configure em **App Settings > Security > App Email**:

| Contexto | Expressão |
|----------|-----------|
| `USERCONTEXT("Role")` | `LOOKUP(USEREMAIL(), [Usuarios], [Email], [Role])` |
| `USERCONTEXT("ID_Unidade")` | `LOOKUP(USEREMAIL(), [Usuarios], [Email], [ID_Unidade])` |
| `USERCONTEXT("ID_Usuario")` | `LOOKUP(USEREMAIL(), [Usuarios], [Email], [ID_Usuario])` |

---

## 7. Diagrama de Transição de Status (Ações por Botão)

```
[➕ Nova O.S.]
     │
     ▼
┌─────────────┐    ┌──────────────┐
│  RECEBIDO   │───►│   TRIAGEM    │
│ (Coleta)    │    │              │◄── Obrigatório: upload mínimo 2 fotos
└─────────────┘    └──────┬───────┘
                          │
                          ▼
┌─────────────────┐  ┌──────────────┐
│ AGUARDANDO      │  │ AGUARDANDO   │
│ ORÇAMENTO       │  │ CLIENTE      │
└─────────────────┘  └──────┬───────┘
                            │
          ┌─────────────────┤
          ▼                 ▼
┌─────────────────┐  ┌──────────────┐
│ AGUARDANDO      │  │ NA BANCADA   │
│ PEÇA            │  │              │
└─────────────────┘  └──────┬───────┘
                            │
                            ▼
┌─────────────┐  ┌──────────────┐
│ EM TESTES   │─►│ HIGIENIZAÇÃO │
│             │  │              │◄── Checklist Obrigatório
└─────────────┘  └──────┬───────┘
                        │
                        ▼
┌─────────────────┐  ┌──────────────┐
│ PRONTO PARA     │  │ FINALIZADO   │
│ ENTREGA         │──►              │◄── Assinatura Digital
└─────────────────┘  └──────────────┘
```

### Ações e Botões por Status

| Status Atual | Botão | Ação | Quem Pode |
|-------------|-------|------|-----------|
| Recebido | [Iniciar Triagem] | `Status_OS → "Triagem"` + exigir upload 2 fotos | Tecnico, Franqueado, Master |
| Triagem | [Orçar] | `Status_OS → "Aguardando Orcamento"` | Tecnico, Franqueado, Master |
| Triagem | [😞 Desistência] | `Status_OS → "Finalizado"` (motivo: desistência) | Master, Franqueado |
| Aguardando Orçamento | [Enviar Orçamento] | `Status_OS → "Aguardando Cliente"` + gera msg WhatsApp | Tecnico, Franqueado, Master |
| Aguardando Cliente | [Aprovado - Iniciar] | `Status_OS → "Na Bancada"` | Franqueado, Master **ou Cliente via Portal** |
| Aguardando Cliente | [Aprovado - Aguardar Peça] | `Status_OS → "Aguardando Peca"` | Tecnico, Franqueado, Master |
| Aguardando Peça | [Peça Chegou] | `Status_OS → "Na Bancada"` | Tecnico, Franqueado, Master |
| Na Bancada | [Finalizar Reparo] | `Status_OS → "Em Testes"` | Tecnico |
| Em Testes | [CQ Aprovado] | Só permite se `Checklist_Saida_Verificado = TRUE` → `Status_OS → "Higienizacao"` | Tecnico |
| Higienização | [Pronto] | `Status_OS → "Pronto para Entrega"` | Tecnico, Franqueado |
| Pronto para Entrega | [Entregue] | `Status_OS → "Finalizado"` + exigir assinatura digital | Motoboy (ou Franqueado na loja) |
| Finalizado | — | Status terminal | — |

### AppSheet Action: `Avancar_Status` (Expressão)

```
IF([Status_OS] = "Recebido" AND COUNT([Fotos_Checklist_Entrada]) >= 2,
   {Status_OS: "Triagem",
    Ultima_Atualizacao_Status: NOW(),
    Data_Fechamento: IF(FALSE, NOW(), [Data_Fechamento])},
 IF([Status_OS] = "Em Testes" AND [Checklist_Saida_Verificado] = TRUE,
   {Status_OS: "Higienizacao",
    Ultima_Atualizacao_Status: NOW()},
 ...)
```
