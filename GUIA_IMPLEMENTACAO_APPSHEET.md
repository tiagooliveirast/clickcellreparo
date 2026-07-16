# ⚡ Click Cell OS — Guia de Implementação AppSheet
## Roteiro Passo a Passo para Construção do Sistema

---

## 📋 Pré-requisitos

| Item | Detalhe |
|------|---------|
| Conta Google | Acesso ao Google Drive e AppSheet (recomendado: Google Workspace) |
| AppSheet Plan | **AppSheet Core Pro** ou superior (necessário para Security Filters e Slices) |
| Planilhas Google | 7 abas no mesmo arquivo (conforme `database/Modelo_Fisico_Dados.md`) |

---

## 🗂️ Passo 1: Criar o Banco de Dados (Google Sheets)

### 1.1. Criar uma nova planilha no Google Sheets

```
Nome: "ClickCellOS_Data"
```

### 1.2. Criar as 7 abas com os cabeçalhos exatos

| Aba | Origem do Schema |
|-----|-------------------|
| `Unidades_Franquias` | `database/Modelo_Fisico_Dados.md` → Tabela 1 |
| `Usuarios` | `database/Modelo_Fisico_Dados.md` → Tabela 2 |
| `Clientes` | `database/Modelo_Fisico_Dados.md` → Tabela 3 |
| `Aparelhos` | `database/Modelo_Fisico_Dados.md` → Tabela 4 |
| `Ordens_Servico` | `database/Modelo_Fisico_Dados.md` → Tabela 5 |
| `Status_Log` | `database/Modelo_Fisico_Dados.md` → Tabela 6 |
| `Assinaturas_Digitais` | `database/Modelo_Fisico_Dados.md` → Tabela 7 |

### 1.3. Configurar Data Validation nas células de cabeçalho (opcional mas recomendado)

Para colunas do tipo Enum, use **Data > Data Validation**:

| Aba | Coluna | Valores Permitidos |
|-----|--------|-------------------|
| `Unidades_Franquias` | Status_Contrato | `Ativo, Bloqueado` |
| `Usuarios` | Role | `Master, Franqueado, Tecnico, Motoboy` |
| `Ordens_Servico` | Status_OS | `Recebido, Triagem, Aguardando Orcamento, Aguardando Cliente, Aguardando Peca, Na Bancada, Em Testes, Higienizacao, Pronto para Entrega, Finalizado` |
| `Ordens_Servico` | Metodo_Pagamento_Registro | `Ainda nao Pago, PIX, Cartao de Credito, Cartao de Debito, Dinheiro, Link Externo` |
| `Clientes` | Origem_Lead | `Instagram, Google Ads, Indicacao, Passagem na Loja` |

---

## 📱 Passo 2: Criar o App no AppSheet

### 2.1. AppSheet Studio

1. Acesse [https://www.appsheet.com](https://www.appsheet.com)
2. Clique em **"Create" → "App" → "New App from Sheets"**
3. Selecione a planilha `ClickCellOS_Data`
4. Selecione **TODAS as 7 abas**
5. Nomeie o app: **"Click Cell OS"**

### 2.2. Configurar Primary Keys

Para cada tabela, configure a Primary Key automaticamente:

| Tabela | Key |
|--------|-----|
| Unidades_Franquias | `ID_Unidade` ✅ (AppSheet detecta) |
| Usuarios | `ID_Usuario` ✅ |
| Clientes | `ID_Cliente` ✅ |
| Aparelhos | `ID_Aparelho` ✅ |
| Ordens_Servico | `ID_OS` ⚠️ **Marcar manualmente como Key** |
| Status_Log | `ID_Log` ✅ |
| Assinaturas_Digitais | `ID_Assinatura` ✅ |

### 2.3. Configurar Ref (Relacionamentos)

Vá em **Data > Columns** para cada tabela e configure os Ref:

| Tabela | Coluna | Referencia | Tipo |
|--------|--------|-----------|------|
| Usuarios | `ID_Unidade` | `Unidades_Franquias.ID_Unidade` | Ref |
| Clientes | `ID_Unidade` | `Unidades_Franquias.ID_Unidade` | Ref |
| Aparelhos | `ID_Cliente` | `Clientes.ID_Cliente` | Ref |
| Ordens_Servico | `ID_Unidade` | `Unidades_Franquias.ID_Unidade` | Ref |
| Ordens_Servico | `ID_Aparelho` | `Aparelhos.ID_Aparelho` | Ref |
| Ordens_Servico | `ID_Tecnico_Responsavel` | `Usuarios.ID_Usuario` | Ref |
| Ordens_Servico | `ID_Motoboy_Responsavel` | `Usuarios.ID_Usuario` | Ref |
| Status_Log | `ID_OS` | `Ordens_Servico.ID_OS` | Ref |
| Status_Log | `Alterado_Por` | `Usuarios.ID_Usuario` | Ref |
| Assinaturas_Digitais | `ID_OS` | `Ordens_Servico.ID_OS` | Ref |
| Assinaturas_Digitais | `ID_Motoboy` | `Usuarios.ID_Usuario` | Ref |

### 2.4. Virtual Columns

Adicione Virtual Columns conforme especificado:

**Tabela: Ordens_Servico**

| Virtual Column | Expressão | Tipo |
|---------------|-----------|------|
| `Lucro_Liquido_Servico` | `[Preco_Orcado_Cliente] - ([Custo_Peca] + [Custo_Mao_Obra_Tecnico])` | Currency |
| `Margem_Percentual` | `IF([Preco_Orcado_Cliente] > 0, ROUND(([Lucro_Liquido_Servico] / [Preco_Orcado_Cliente]) * 100, 1), 0)` | Number |
| `Progresso_Num` | `SWITCH([Status_OS], "Recebido", 1, "Triagem", 2, "Aguardando Orcamento", 3, "Aguardando Cliente", 4, "Aguardando Peca", 5, "Na Bancada", 6, "Em Testes", 7, "Higienizacao", 8, "Pronto para Entrega", 9, "Finalizado", 10)` | Number |
| `Progresso_Pct` | `([Progresso_Num] / 10) * 100` | Percent |
| `Checklist_Saida_Verificado` | `AND([FaceID_Biometria], [Touchscreen], [Conexao_WiFi], [Microfone], [Alto_Falantes], [Conector_Carga])` | Yes/No |

---

## 🔐 Passo 3: Configurar Segurança e Autenticação

### 3.1. App Security Settings

```
Settings > Security > Authentication:
  → App Access: "All signed-in users" (padrão)
  → Allow sign-ups: ❌ DESABILITADO (UNCHECK)
  → App Email column for users: [Usuarios].[Email]
  → Allow anonymous access: ✅ HABILITADO (para views públicas)
```

### 3.2. Configurar User Context (App Expressions)

Vá em **Settings > Security > App Expressions**:

| Nome | Expressão |
|------|-----------|
| `UserRole` | `LOOKUP(USEREMAIL(), [Usuarios], [Email], [Role])` |
| `UserID_Unidade` | `LOOKUP(USEREMAIL(), [Usuarios], [Email], [ID_Unidade])` |
| `UserID_Usuario` | `LOOKUP(USEREMAIL(), [Usuarios], [Email], [ID_Usuario])` |

> ⚠️ Certifique-se de que `USERCONTEXT("UserRole")` está configurado em **Settings > Security > App Email > User Context**.

### 3.3. Criar Slice de Segurança por Role

**Slice: `Ordens_Visiveis_Tecnico`**
- Base: `Ordens_Servico`
- Filtro: `[ID_Tecnico_Responsavel] = USERCONTEXT("UserID_Usuario")`

**Slice: `Ordens_Visiveis_Motoboy`**
- Base: `Ordens_Servico`
- Filtro: `[ID_Motoboy_Responsavel] = USERCONTEXT("UserID_Usuario")`

**Slice: `Ordens_Visiveis_Franqueado`**
- Base: `Ordens_Servico`
- Filtro: `[ID_Unidade] = USERCONTEXT("UserID_Unidade")`

**Slice: `Clientes_Visiveis`**
- Base: `Clientes`
- Filtro: `OR(IN(USERCONTEXT("UserRole"), "Master"), [ID_Unidade] = USERCONTEXT("UserID_Unidade"))`

> Aplique os slices nas views correspondentes conforme `appsheet/Fluxo_Telas_Regras_Visibilidade.md`.

---

## 🖼️ Passo 4: Criar as Views (Telas)

### 4.1. Group Views by Role

Crie grupos de views no AppSheet:

```
UX > Views:
  ├── 📱 Grupo: "Master" (Show if: USERCONTEXT("UserRole") = "Master")
  │   ├── Dashboard_Master (Dashboard)
  │   ├── Franquias_Table (Table)
  │   ├── Nova_Unidade_Form (Form)
  │   ├── Usuarios_Table (Table)
  │   ├── Ordens_Table_Master (Table)
  │   └── Relatorios_Master (Dashboard)
  │
  ├── 📱 Grupo: "Franqueado" (Show if: USERCONTEXT("UserRole") = "Franqueado")
  │   ├── Dashboard_Franqueado (Dashboard)
  │   ├── Ordens_Table_Unidade (Table)
  │   ├── Clientes_Table (Table)
  │   ├── Equipe_Table (Table)
  │   └── Financeiro_Unidade (Dashboard)
  │
  ├── 📱 Grupo: "Tecnico" (Show if: USERCONTEXT("UserRole") = "Tecnico")
  │   ├── Ordens_Tecnico (Kanban/Deck)
  │   ├── Bancada_View (Table)
  │   ├── Clientes_Consulta (Table)
  │   └── ClickCell_AI (Dashboard)
  │
  ├── 📱 Grupo: "Motoboy" (Show if: USERCONTEXT("UserRole") = "Motoboy")
  │   ├── Coletas_Motoboy (Table)
  │   ├── Entregas_Motoboy (Table)
  │   ├── Assinaturas_Pendentes (Table)
  │   └── Mapa_Rotas (Map)
  │
  └── 🌐 Grupo: "Publico" (Show if: ISBLANK(USEREMAIL()) — acesso anônimo)
      ├── Landing_Page (Dashboard)
      ├── Solicitar_Coleta (Form)
      ├── Form_Rastrear (Form)
      └── Resultado_Rastreamento (Dashboard)
```

### 4.2. Configurar UX por View

Siga o layout especificado em:
- `appsheet/Fluxo_Telas_Regras_Visibilidade.md` → Design de cada view com formatação
- `appsheet/Telas_Publicas_Portal.md` → Views públicas
- `appsheet/Financeiro_Registro_Pagamentos.md` → Views financeiras

Para **formatação**, use:
- **View > Options > Style**: "Card" para Kanban, "Table" para listas, "Dashboard" para KPIs
- **View > Columns > Display**: Configure quais colunas aparecem em cada view
- **View > Positions**: Header com ícone e subtítulo

---

## ⚡ Passo 5: Criar Actions (Ações e Botões)

### 5.1. Actions de Transição de Status

Crie as actions baseadas no diagrama de fluxo em `appsheet/Fluxo_Telas_Regras_Visibilidade.md` → Seção 7.

| Action Name | Table | Data Action | Expressão (Set Columns Values) | Exibir Botão Quando |
|-------------|-------|-------------|-------------------------------|---------------------|
| `Avancar_Triagem` | Ordens_Servico | `Set Columns Values` | `{Status_OS: "Triagem", Ultima_Atualizacao_Status: NOW()}` | `[Status_OS] = "Recebido"` |
| `Avancar_Orcamento` | Ordens_Servico | `Set Columns Values` | `{Status_OS: "Aguardando Orcamento", Ultima_Atualizacao_Status: NOW()}` | `[Status_OS] = "Triagem"` |
| `Enviar_Orcamento_Cliente` | Ordens_Servico | `Set Columns Values` | `{Status_OS: "Aguardando Cliente", Ultima_Atualizacao_Status: NOW()}` | `[Status_OS] = "Aguardando Orcamento"` |
| `Aprovar_Reparo` | Ordens_Servico | `Set Columns Values` | `{Status_OS: "Na Bancada", Ultima_Atualizacao_Status: NOW()}` | `[Status_OS] = "Aguardando Cliente"` |
| `Iniciar_Reparo` | Ordens_Servico | `Set Columns Values` | `{Status_OS: "Na Bancada", Ultima_Atualizacao_Status: NOW()}` | `[Status_OS] = "Aguardando Peca"` |
| `Finalizar_Reparo` | Ordens_Servico | `Set Columns Values` | `{Status_OS: "Em Testes", Ultima_Atualizacao_Status: NOW()}` | `[Status_OS] = "Na Bancada"` |
| `Aprovar_CQ` | Ordens_Servico | `Set Columns Values` | `{Status_OS: "Higienizacao", Ultima_Atualizacao_Status: NOW()}` | `[Status_OS] = "Em Testes" AND [Checklist_Saida_Verificado] = TRUE` |
| `Pronto_Entrega` | Ordens_Servico | `Set Columns Values` | `{Status_OS: "Pronto para Entrega", Ultima_Atualizacao_Status: NOW()}` | `[Status_OS] = "Higienizacao"` |
| `Finalizar_OS` | Ordens_Servico | Multi-step | 1. `SetColumnsValues: {Status_OS: "Finalizado", Data_Fechamento: NOW(), Ultima_Atualizacao_Status: NOW()}`<br>2. `ShowMessage: "OS finalizada"` | `[Status_OS] = "Pronto para Entrega"` |

### 5.2. Actions de Criação

| Action Name | Tabela | Tipo | Expressão / Config |
|-------------|--------|------|-------------------|
| `Criar_Cliente_Aparelho_OS` | Clientes | Multi-step | Ver Seção 2 do arquivo `Telas_Publicas_Portal.md` (3 AddOrCreateRow) |
| `Nova_Unidade` | Unidades_Franquias | Multi-step | 1. AddRow → Unidades_Franquias<br>2. AddRow → Usuarios (primeiro Franqueado) |
| `Novo_Usuario_Equipe` | Usuarios | AddRow | `{ID_Unidade: USERCONTEXT("UserID_Unidade"), [campos do form]}` |
| `Registrar_Pagamento` | Ordens_Servico | `Set Columns Values` | `{Preco_Orcado_Cliente: [form], Custo_Peca: [form], Custo_Mao_Obra_Tecnico: [form], Metodo_Pagamento_Registro: [form]}` |

### 5.3. Actions Públicas

| Action Name | Visível Quando | Expressão |
|-------------|----------------|-----------|
| `Aprovar_Reparo_Publico` | `[Status_OS] = "Aguardando Cliente"` | `{Status_OS: "Na Bancada", Ultima_Atualizacao_Status: NOW()}` |
| `Solicitar_Coleta_Publica` | Sempre (público) | Ver multi-step em `Telas_Publicas_Portal.md` |

---

## 🎨 Passo 6: Personalização e Branding

### 6.1. Brand Config

```
UX > Brand:
  → App Name: "Click Cell OS"
  → Primary Color: #1E88E5 (azul Click Cell)
  → Secondary Color: #FFC107 (dourado)
  → Logo: [Upload da logo Click Cell]
  → Small Logo: [Upload do ícone]
  → Dark Mode: Optional
```

### 6.2. App Icon

```
Settings > App Info:
  → App Icon: [Upload ícone 512x512px]
  → App Description: "Sistema de Gestão para Franquias Click Cell"
```

---

## 📤 Passo 7: Deploy

### 7.1. Testar no AppSheet Preview

1. Use o **App Preview** para testar cada Role
2. Simule login como:
   - `master@clickcell.com` (Master)
   - `franqueado.salvador@clickcell.com` (Franqueado)
   - `tecnico.salvador@clickcell.com` (Técnico)
   - `motoboy.salvador@clickcell.com` (Motoboy)
3. Teste o fluxo público sem login

### 7.2. Deploy como Web App

```
Manage > Deployment > Web App
  → Enable Web App: ✅
  → Web App URL: [gerado automaticamente pelo AppSheet]
  → URL Parameters: slug, consulta, mode (conforme Telas_Publicas_Portal.md)
```

### 7.3. Deploy Mobile (Android/iOS)

```
Manage > Deployment > Mobile App
  → Android: Generate APK / Play Store
  → iOS: Generate iOS App / App Store
```

---

## 📁 Índice de Artefatos Gerados

| Arquivo | Conteúdo |
|---------|----------|
| `database/Modelo_Fisico_Dados.md` | Schemas completos de todas as 7 tabelas, relacionamentos, chaves e security filters |
| `appsheet/Fluxo_Telas_Regras_Visibilidade.md` | Navegação Mobile-First, views por Role, botões, transições de status |
| `appsheet/Telas_Publicas_Portal.md` | Telas públicas: Landing, Solicitação de Coleta, Track & Trace |
| `appsheet/Financeiro_Registro_Pagamentos.md` | Registro manual de pagamentos, dashboards financeiros, regras de visibilidade |
| `GUIA_IMPLEMENTACAO_APPSHEET.md` | **(Este arquivo)** Guia passo a passo para construir tudo no AppSheet |

---

## ✅ Checklist de Verificação Final

- [ ] Google Sheets com 7 abas e cabeçalhos configurados
- [ ] App criado no AppSheet com todas as tabelas
- [ ] Relacionamentos (Ref) configurados entre tabelas
- [ ] Virtual Columns criadas (Lucro, Margem, Progresso, CQ)
- [ ] Autenticação configurada (sem auto-cadastro)
- [ ] Slices de segurança por Role criados
- [ ] Views configuradas para cada Role
- [ ] Views públicas configuradas (acesso anônimo)
- [ ] Actions de transição de status criadas
- [ ] Action de criação de O.S. pública (multi-step) configurada
- [ ] Ação "Aprovar Reparo" na view pública
- [ ] Formulário de pagamento manual (sem gateway)
- [ ] Dashboard financeiro com KPIs e gráficos
- [ ] Teste com 4 usuários de Roles diferentes + acesso público
- [ ] Deploy como Web App + Mobile App
