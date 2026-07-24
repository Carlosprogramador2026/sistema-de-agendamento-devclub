# DEV-CLUB - Sistema de Agendamento Inteligente

Um sistema completo, moderno e inteligente de agendamento de serviços (barbearia, salão de beleza e estética), equipado com painel administrativo, inteligência artificial com Gemini AI para análise de sentimento e insights de negócios, mensagens humanizadas automáticas para WhatsApp e sincronização em tempo real via **Firebase Firestore** com fallback para **LocalStorage**.

---

## 📌 Sobre o Projeto

O **DEV-CLUB** foi criado para transformar a experiência de agendamento e gestão de clientes, unindo praticidade para o usuário final e inteligência operacional para a equipe administrativa.

### Principais Funcionalidades

- **Área do Cliente (Pública):**
  - Seleção intuitiva de serviços com valores e duração estimada.
  - Seleção interativa de data e horários disponíveis.
  - Formulário seguro com validação de dados em tempo real (Zod + React Hook Form).
  - Confirmação instantânea com geração de **link do WhatsApp humanizado**: envia mensagem formatada com saudação amigável pelo primeiro nome, data em formato brasileiro (`DD/MM/AAAA`) e emojis contextuais.

- **Painel Administrativo (Admin):**
  - Métricas e KPI's em tempo real (Total de Agendamentos, Receita Prevista, Clientes Atendidos e Agendamentos do Dia).
  - Tabela completa de agendamentos com avatares estilizados por iniciais e status coloridos.
  - **Reagendamento e Edição Completa:** Permite alterar data, horário, nome, telefone, preço, serviço, status e observações de qualquer agendamento.
  - Busca instantânea e filtros por nome, telefone ou serviço.
  - Atualização direta de status (*Agendado*, *Confirmado*, *Concluído*, *Cancelado*).

- **Inteligência Artificial (Gemini AI):**
  - **Análise de Sentimento de Notas:** Avalia o tom e as observações deixadas pelo cliente no agendamento, classificando o sentimento e gerando recomendações para a equipe.
  - **Insights Executivos:** Geração de diagnósticos de negócios, estimativas de produtividade e sugestões estratégicas para aumento de ticket médio.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - [React 19](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
  - [Vite 6](https://vitejs.dev/)
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Lucide React](https://lucide.dev/) (Ícones vetoriais modernos)
  - [Motion](https://motion.dev/) (Animações e transições fluidas)
  - [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (Validação de formulários)
  - [Date-fns](https://date-fns.org/) (Manipulação e formatação de datas)

- **Backend & Servidor:**
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [TSX](https://github.com/privatenumber/tsx) & [ESBuild](https://esbuild.github.io/)

- **Inteligência Artificial:**
  - [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) — Modelo Gemini 3.6 Flash

- **Banco de Dados & Persistência:**
  - [Firebase Firestore](https://firebase.google.com/docs/firestore)
  - LocalStorage (Sistema resiliente com fallback automático caso o Firebase não esteja configurado)

---

## 🤖 Ferramentas de IA Utilizadas no Desenvolvimento

Este projeto foi construído com apoio de ferramentas de IA generativa ao longo do ciclo de desenvolvimento:

- **[Google AI Studio](https://aistudio.google.com/)** — Utilizado para a geração inicial do projeto (estrutura base, componentes e integração com a API Gemini).
- **[Claude Code](https://claude.com/claude-code)** (Anthropic) — Utilizado para refinamentos, correções de bugs, ajustes de UX (ex: mensagens de WhatsApp) e manutenção contínua do código.

> Essas ferramentas auxiliaram o processo de desenvolvimento. Já o **Gemini AI** (`@google/genai`) listado em Tecnologias Utilizadas é um recurso de IA embutido no próprio produto (análise de sentimento e insights executivos), e não uma ferramenta usada para desenvolver o projeto.

---

## 🔥 Dados e Estrutura do Firebase

O projeto utiliza o **Firebase Firestore** para persistência de dados em nuvem, garantindo sincronização imediata entre clientes e admin.

### Coleção: `agendamentos`

Cada documento na coleção `agendamentos` possui a seguinte estrutura de dados:

```typescript
interface Agendamento {
  id: string;            // Identificador único (gerado pelo Firestore ou UUID local)
  nome: string;          // Nome completo do cliente (ex: "Carlos Eduardo Santos")
  telefone: string;      // Número de telefone/WhatsApp (ex: "(73) 9 9988-1122")
  servico: string;       // Nome do serviço (ex: "Combo Corte + Barba")
  preco: number;         // Valor do serviço em R$ (ex: 55.00)
  duracao: string;       // Duração aproximada (ex: "50 min")
  data: string;          // Data do agendamento em formato ISO (YYYY-MM-DD)
  horario: string;       // Horário do atendimento (ex: "10:00")
  status: string;        // 'Agendado' | 'Confirmado' | 'Concluído' | 'Cancelado'
  observacao?: string;   // Preferências ou notas adicionais do cliente
  created_at: string;    // Data/hora de criação em formato ISO
}
```

### Variáveis de Ambiente (.env)

Para conectar ao seu próprio projeto Firebase, defina as variáveis no arquivo `.env`:

```env
VITE_FIREBASE_API_KEY="sua_api_key"
VITE_FIREBASE_AUTH_DOMAIN="seu_projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu_projeto_id"
VITE_FIREBASE_STORAGE_BUCKET="seu_projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu_sender_id"
VITE_FIREBASE_APP_ID="seu_app_id"

# Chave para integração da IA Gemini
GEMINI_API_KEY="sua_gemini_api_key"
```

> **Nota:** Caso as chaves do Firebase não estejam preenchidas, a aplicação ativa automaticamente o modo **Fallback LocalStorage**, permitindo utilizar todas as funcionalidades do sistema sem falhas.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passo a Passo

1. **Clonar ou baixar o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd react-example
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto (ou copie do `.env.example`) e insira suas credenciais do Firebase e Gemini API Key.

4. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acessar a Aplicação:**
   - **Interface do Cliente:** `http://localhost:3000/`
   - **Painel Administrativo:** `http://localhost:3000/admin`

---

## 🔑 Credenciais de Acesso Admin

Para acessar a área administrativa e visualizar o dashboard completo:

- **Email:** `admin@teste.com`
- **Senha:** `123456`

---

## 🧠 Decisões Técnicas Adotadas

- **Vite + Express integrados em um único processo (`server.ts`):** o servidor Express hospeda o middleware do Vite em modo dev e serve os arquivos estáticos gerados em produção, eliminando a necessidade de rodar dois processos separados (frontend/backend) durante o desenvolvimento.
- **Firebase Firestore com fallback automático para LocalStorage:** garante que a aplicação continue 100% funcional mesmo sem configuração de credenciais, facilitando testes, demonstrações e onboarding de novos desenvolvedores.
- **Validação de formulários com Zod + React Hook Form:** validação declarativa e tipada, reduzindo bugs de dados inconsistentes entre o formulário do cliente e o modelo `Agendamento`.
- **TypeScript em todo o projeto (frontend e backend):** tipagem compartilhada entre cliente e servidor reduz divergências de contrato de dados.
- **IA Gemini com fallback controlado no backend:** as rotas `/api/gemini/*` sempre retornam uma resposta válida (mockada) quando a `GEMINI_API_KEY` não está configurada ou a chamada falha, evitando quebra de UX por dependência externa.
- **Tailwind CSS v4 via plugin oficial do Vite:** menor configuração e build mais rápido em comparação com a integração anterior baseada em PostCSS puro.

---

## 👤 Criador & Créditos

- **Desenvolvido por:** Carlos Alberto
(carlosfotoarte88@gmail.com)
- **Projeto:** DEV-CLUB — Sistema de Agendamentos Inteligente
