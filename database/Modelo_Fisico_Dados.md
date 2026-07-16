# 🗃️ Modelo Físico de Dados — Click Cell OS
## Google Sheets / Backend Relacional AppSheet

---

## 📌 Convenções

| Símbolo | Significado |
|---------|-------------|
| `🔑` | Primary Key |
| `🔗` | Foreign Key |
| `🧮` | Auto-increment / Row ID |
| `📋` | Enum (Data Validation) |
| `📐` | Fórmula AppSheet |
| `📸` | File / Image (AppSheet File type) |

---

## 1. Planilha: `Unidades_Franquias`

| # | Nome da Coluna | Tipo / Formato no Sheets | Restrições / Validação | Descrição |
|---|---------------|--------------------------|------------------------|-----------|
| 1 | **ID_Unidade** 🔑🧮 | `Number` | Key, Unique, Auto (RowID) | Identificador único numérico gerado pelo AppSheet |
| 2 | **Nome_Fantasia_Unidade** | `Text` | Obrigatório | Nome comercial exibido nas páginas públicas |
| 3 | **Slug_Subdominio** | `Text` | **Obrigatório, Unique** | Identificador URL: `salvador`, `lauro`, `piracicaba` |
| 4 | **WhatsApp_Contato** | `Text` | Obrigatório, formato `+5511999999999` | WhatsApp da unidade com DDI/DDD |
| 5 | **Chave_Pix_Padrao** | `Text` | Opcional | Chave PIX (CPF, CNPJ, email, celular, aleatória) |
| 6 | **Status_Contrato** 📋 | `Text` | Validação: `Ativo, Bloqueado` | Status da franquia; se `Bloqueado`, esconde portal público |
| 7 | **Endereco_Unidade** | `Text` | Opcional | Endereço físico completo da loja |
| 8 | **Data_Cadastro** | `DateTime` | `=NOW()` | Timestamp de criação |

---

## 2. Planilha: `Usuarios`

| # | Nome da Coluna | Tipo / Formato | Restrições | Descrição |
|---|---------------|----------------|------------|-----------|
| 1 | **ID_Usuario** 🔑🧮 | `Number` | Key, Unique, Auto | Identificador único |
| 2 | **ID_Unidade** 🔗 | `Number` | **Obrigatório** | FK → `[Unidades_Franquias].[ID_Unidade]` |
| 3 | **Nome** | `Text` | Obrigatório | Nome completo do usuário |
| 4 | **Email** | `Email` | **Obrigatório, Unique** | Usado como login no AppSheet |
| 5 | **Senha_Hash** | `Text` | Gerenciado pelo AppSheet Auth | Hash da senha (*AppSheet gerencia*) |
| 6 | **Role** 📋 | `Text` | Validação: `Master, Franqueado, Tecnico, Motoboy` | Nível de acesso RBAC |
| 7 | **Telefone** | `Text` | Opcional | Telefone de contato do colaborador |
| 8 | **Ativo** | `Yes/No` | `=TRUE` | Se `FALSE`, usuário não pode logar |

### Relacionamentos

```
Usuarios.ID_Unidade → Unidades_Franquias.ID_Unidade (N:1)
```

---

## 3. Planilha: `Clientes`

| # | Nome da Coluna | Tipo / Formato | Restrições | Descrição |
|---|---------------|----------------|------------|-----------|
| 1 | **ID_Cliente** 🔑🧮 | `Number` | Key, Unique, Auto | Identificador único |
| 2 | **ID_Unidade** 🔗 | `Number` | **Obrigatório** | FK → `[Unidades_Franquias].[ID_Unidade]` |
| 3 | **Nome_Completo** | `Text` | Obrigatório | Nome do cliente |
| 4 | **WhatsApp** | `Text` | Obrigatório, formato `+5511999999999` | WhatsApp do cliente com DDI/DDD |
| 5 | **Endereco_Rua** | `Text` | Opcional | Logradouro |
| 6 | **Endereco_Numero** | `Text` | Opcional | Número |
| 7 | **Endereco_Bairro** | `Text` | Opcional | Bairro |
| 8 | **Endereco_Cidade** | `Text` | Opcional | Cidade |
| 9 | **Endereco_Ponto_Referencia** | `Text` | Opcional | Ponto de referência |
| 10 | **Data_Aniversario** | `Date` | Opcional | `DD/MM/AAAA` |
| 11 | **Origem_Lead** 📋 | `Text` | Validação: `Instagram, Google Ads, Indicacao, Passagem na Loja` | Origem do lead |
| 12 | **Observacoes_Internas** | `Text` | Opcional (multiline) | Anotações internas da franquia |
| 13 | **Data_Cadastro** | `DateTime` | `=NOW()` | Timestamp de criação do registro |

### Relacionamentos

```
Clientes.ID_Unidade → Unidades_Franquias.ID_Unidade (N:1)
```

---

## 4. Planilha: `Aparelhos`

| # | Nome da Coluna | Tipo / Formato | Restrições | Descrição |
|---|---------------|----------------|------------|-----------|
| 1 | **ID_Aparelho** 🔑🧮 | `Number` | Key, Unique, Auto | Identificador único |
| 2 | **ID_Cliente** 🔗 | `Number` | **Obrigatório** | FK → `[Clientes].[ID_Cliente]` |
| 3 | **Marca** | `Text` | Obrigatório | Ex: `Apple`, `Samsung`, `Xiaomi`, `Motorola` |
| 4 | **Modelo** | `Text` | Obrigatório | Ex: `iPhone 13 Pro Max`, `Galaxy S24` |
| 5 | **Cor** | `Text` | Opcional | Ex: `Preto`, `Branco`, `Azul-Sierra` |
| 6 | **IMEI_Serial** | `Text` | **Opcional, Unique** | IMEI ou número de série do aparelho |

### Relacionamentos

```
Aparelhos.ID_Cliente → Clientes.ID_Cliente (N:1)
```

---

## 5. Planilha: `Ordens_Servico`

| # | Nome da Coluna | Tipo / Formato | Restrições | Descrição |
|---|---------------|----------------|------------|-----------|
| 1 | **ID_OS** 🔑 | `Text` | **Obrigatório, Unique** | Padrão: `OS-{YYYY}-{XXXX}` — gerado por fórmula |
| 2 | **ID_Unidade** 🔗 | `Number` | **Obrigatório** | FK → `[Unidades_Franquias].[ID_Unidade]` |
| 3 | **ID_Aparelho** 🔗 | `Number` | **Obrigatório** | FK → `[Aparelhos].[ID_Aparelho]` |
| 4 | **ID_Tecnico_Responsavel** 🔗 | `Number` | Opcional | FK → `[Usuarios].[ID_Usuario]` (Role = Tecnico) |
| 5 | **ID_Motoboy_Responsavel** 🔗 | `Number` | Opcional | FK → `[Usuarios].[ID_Usuario]` (Role = Motoboy) |
| 6 | **Sintoma_Reclamado** | `Text` | Obrigatório (multiline) | Descrição do problema relatado |
| 7 | **Status_OS** 📋 | `Text` | Validação: `Recebido, Triagem, Aguardando Orcamento, Aguardando Cliente, Aguardando Peca, Na Bancada, Em Testes, Higienizacao, Pronto para Entrega, Finalizado` | Pipeline de 10 estágios |
| 8 | **Data_Abertura** | `DateTime` | `=NOW()` | Timestamp de abertura |
| 9 | **Data_Fechamento** | `DateTime` | Opcional | Timestamp de finalização |
| 10 | **Fotos_Checklist_Entrada** 📸 | `File` (Image List) | Mínimo 2 fotos obrigatórias na Triagem | Fotos do aparelho no momento da entrada |
| 11 | **Preco_Orcado_Cliente** | `Currency` | Decimal(10,2) | Valor orçado para o cliente |
| 12 | **Custo_Peca** | `Currency` | Decimal(10,2) | Custo da peça para a franquia |
| 13 | **Custo_Mao_Obra_Tecnico** | `Currency` | Decimal(10,2) | Custo da mão de obra |
| 14 | **Metodo_Pagamento_Registro** 📋 | `Text` | Validação: `Ainda nao Pago, PIX, Cartao de Credito, Cartao de Debito, Dinheiro, Link Externo` | Como o cliente pagou |
| 15 | **FaceID_Biometria** | `Yes/No` | Checkbox, obrigatório na saída | Check-list de CQ |
| 16 | **Touchscreen** | `Yes/No` | Checkbox, obrigatório na saída | Check-list de CQ |
| 17 | **Conexao_WiFi** | `Yes/No` | Checkbox, obrigatório na saída | Check-list de CQ |
| 18 | **Microfone** | `Yes/No` | Checkbox, obrigatório na saída | Check-list de CQ |
| 19 | **Alto_Falantes** | `Yes/No` | Checkbox, obrigatório na saída | Check-list de CQ |
| 20 | **Conector_Carga** | `Yes/No` | Checkbox, obrigatório na saída | Check-list de CQ |
| 21 | **Checklist_Saida_Verificado** | `Yes/No` | Fórmula: `AND({FaceID_Biometria}, {Touchscreen}, {Conexao_WiFi}, {Microfone}, {Alto_Falantes}, {Conector_Carga})` | True se todos os checkboxes forem true |
| 22 | **Laudo_Tecnico** | `Text` | Opcional (multiline) | Laudo gerado pelo técnico / IA |
| 23 | **Data_Previsao_Entrega** | `Date` | Opcional | Previsão de entrega combinada com cliente |
| 24 | **Ultima_Atualizacao_Status** | `DateTime` | `=NOW()` | Timestamp da última alteração de status |

### Fórmula AppSheet para ID_OS

```
"OS-" & YEAR(Today()) & "-" & TEXT(COUNT(Filter([Ordens_Servico], YEAR([Data_Abertura]) = YEAR(Today()))) + 1, "0000")
```

### Relacionamentos

```
Ordens_Servico.ID_Unidade         → Unidades_Franquias.ID_Unidade (N:1)
Ordens_Servico.ID_Aparelho        → Aparelhos.ID_Aparelho        (N:1)
Ordens_Servico.ID_Tecnico_Resp.   → Usuarios.ID_Usuario          (N:1)
Ordens_Servico.ID_Motoboy_Resp.   → Usuarios.ID_Usuario          (N:1)
```

---

## 6. Planilha: `Status_Log` (Auditoria)

| # | Nome da Coluna | Tipo / Formato | Restrições | Descrição |
|---|---------------|----------------|------------|-----------|
| 1 | **ID_Log** 🔑🧮 | `Number` | Key, Unique, Auto | Identificador único |
| 2 | **ID_OS** 🔗 | `Text` | **Obrigatório** | FK → `[Ordens_Servico].[ID_OS]` |
| 3 | **Status_Anterior** 📋 | `Text` | Status antes da transição | |
| 4 | **Status_Novo** 📋 | `Text` | Status depois da transição | |
| 5 | **Alterado_Por** 🔗 | `Number` | FK → `[Usuarios].[ID_Usuario]` | Quem alterou |
| 6 | **Timestamp** | `DateTime` | `=NOW()` | Quando ocorreu |

---

## 7. Planilha: `Assinaturas_Digitais`

| # | Nome da Coluna | Tipo / Formato | Restrições | Descrição |
|---|---------------|----------------|------------|-----------|
| 1 | **ID_Assinatura** 🔑🧮 | `Number` | Key, Unique, Auto | Identificador único |
| 2 | **ID_OS** 🔗 | `Text` | **Obrigatório** | FK → `[Ordens_Servico].[ID_OS]` |
| 3 | **ID_Motoboy** 🔗 | `Number` | **Obrigatório** | FK → `[Usuarios].[ID_Usuario]` |
| 4 | **Assinatura_Base64** 📸 | `File` (Image) | **Obrigatório** | Imagem da assinatura do cliente |
| 5 | **GPS_Latitude** | `Number` | Capturado automaticamente | Coordenada GPS da coleta |
| 6 | **GPS_Longitude** | `Number` | Capturado automaticamente | Coordenada GPS da coleta |
| 7 | **IP_Conexao** | `Text` | Capturado automaticamente | Endereço IP no momento |
| 8 | **Modelo_Dispositivo** | `Text` | Capturado automaticamente | Modelo do aparelho que coletou |
| 9 | **Data_Hora** | `DateTime` | `=NOW()` | Timestamp da assinatura |

---

## 📊 Mapa de Relacionamentos (MER)

```
Unidades_Franquias (1) ──┬── (N) Usuarios
                         ├── (N) Clientes
                         └── (N) Ordens_Servico

Clientes (1) ── (N) Aparelhos

Aparelhos (1) ── (N) Ordens_Servico

Ordens_Servico (1) ── (N) Status_Log
Ordens_Servico (1) ── (N) Assinaturas_Digitais

Usuarios (1) ── (N) Ordens_Servico [Técnico]
Usuarios (1) ── (N) Ordens_Servico [Motoboy]
```

---

## 🔐 Segurança: Security Filters por Role (AppSheet)

| Tabela | Master | Franqueado | Tecnico | Motoboy |
|--------|--------|------------|---------|---------|
| **Unidades_Franquias** | Todas | Só sua unidade | Apenas leitura da sua unidade | Apenas leitura da sua unidade |
| **Usuarios** | Todos | Só da sua unidade | Só seu próprio | Só seu próprio |
| **Clientes** | Todos | Só da sua unidade | Só clientes com O.S. delegadas | Apenas leitura para entregas |
| **Aparelhos** | Todos | Só da sua unidade | Só aparelhos com O.S. delegadas | Apenas leitura |
| **Ordens_Servico** | Todas | Só da sua unidade | Só O.S. delegadas a ele | Só O.S. delegadas a ele |
| **Status_Log** | Todos | Só da sua unidade | Só O.S. delegadas | Só O.S. delegadas |
| **Assinaturas_Digitais** | Todas | Só da sua unidade | Nenhum | Só as que ele coletou |
