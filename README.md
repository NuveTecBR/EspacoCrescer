# 🎒 Espaço Crescer — Contraturno Escolar & Centro Pedagógico

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68A063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Storage-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase_Ready-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Security](https://img.shields.io/badge/Security-M%C3%A9todo_ENDS_100%25-blueviolet?style=for-the-badge&logo=shield)](https://github.com/NuveTecBR)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> 🌐 **Visualização Online (GitHub Pages):** [https://nuvetecbr.github.io/EspacoCrescer/](https://nuvetecbr.github.io/EspacoCrescer/)

---

## 📌 Visão Geral do Projeto

O **Espaço Crescer** é uma plataforma institucional e pedagógica voltada para o contraturno escolar, apoio pedagógico e oficinas integradas de desenvolvimento infantil. Desenvolvido sobre o **Método ENDS (Eficiência, Nível técnico, Defesa e Segurança)**, o projeto combina uma interface acolhedora, humana e elegante com o mais rigoroso padrão de proteção a dados pessoais de crianças e adolescentes (**Art. 14 da LGPD e Estatuto da Criança e do Adolescente - ECA**).

O layout adota a organização e clareza visual dos melhores modelos do ecossistema **Avada Prebuilt Websites**, transmitindo segurança, transparência e profissionalismo para famílias e educadores.

---

## 🌟 Principais Funcionalidades

- **Agendamento Online de Visitas Pedagógicas:**
  - Formulário intuitivo para famílias agendarem visitas ao espaço, conhecerem a equipe e alinharem expectativas pedagógicas.
  - Geração de protocolo único de confirmação e prevenção contra envio duplicado.
- **Linha do Tempo da Rotina Diária:**
  - Apresentação interativa da jornada da criança por turno (Manhã e Tarde), cobrindo momentos de acolhimento, apoio a deveres escolares, almoço/lanche, oficinas criativas e brincadeiras livres.
- **Catálogo de Oficinas Pedagógicas & Maker:**
  - Detalhamento de atividades: Robótica Educacional, Apoio Escolar, Arte & Expressão, Horta Pedagógica, Música e Leitura.
- **Simulador de Mensalidades com Desconto de Irmão:**
  - Cálculo transparente de valores de contraturno com base em dias por semana, período e desconto progressivo para irmãos.
- **Privacidade Infantil Reforçada (Art. 14 LGPD):**
  - Módulo específico para consentimento explícito do responsável legal e canal exclusivo para exercício de direitos do titular.

---

## 🎨 Design & Layout (Padrão Avada + Princípios PARC)

- **Trust Strip Avada da Educação:** Faixa de credibilidade e segurança familiar em posição de destaque:
  1. *Acompanhamento Diário de Lição de Casa & Apoio Escolar Especializado*
  2. *Cardápio Balanceado Supervisionado por Nutricionista Infantil*
  3. *Segurança com Acesso Biométrico & Monitoramento por CFTV Integrado*
  4. *Quintal Natural & Oficinas Livres Sem Telas para Desenvolvimento Real*
- **Paleta de Cores Acolhedora:** Tons suaves e naturais que transmitem serenidade, foco e acolhimento pedagógico.
- **Respiro & Legibilidade:** Espaçamento generoso entre sessões para facilitar a navegação em dispositivos móveis e desktops por pais e responsáveis.

---

## 🛡️ Arquitetura & Segurança (Método ENDS)

- **Blindagem de Dados de Menores (LGPD Art. 14):** Minimização rigorosa de coleta de dados, restringindo informações ao estritamente necessário para o agendamento da visita sob consentimento do responsável.
- **Proteção Anti-Spam (Honeypot):** Armadilha invisível em todos os formulários que bloqueia envios maliciosos e automações de robôs sem gerar atrito para os pais.
- **Sanitização Universal de Inputs:** Todas as entradas sofrem tratamento contra Cross-Site Scripting (XSS) e injeções de script.
- **Cabeçalhos de Segurança HTTP:** Configuração de Content Security Policy (CSP), bloqueio de Clickjacking (`X-Frame-Options: DENY`) e desativação de MIME sniffing.
- **Rate Limiting por Camada:** Proteção contra ataques de negação de serviço e sobrecarga de requisições nos formulários de visita e login.
- **Autenticação Administrativa:** Hash de senhas com **Bcrypt** e sessões protegidas por **JWT** para coordenadores e secretárias escolares.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5 Semântico, CSS3 Moderno (CSS Custom Properties, Flexbox, Bento Grid Educacional), JavaScript ES6+ Vanilla.
- **Backend:** Node.js (v20+), Express.js (v4.21).
- **Banco de Dados:** SQLite nativo para ambiente de desenvolvimento e compatibilidade nativa com PostgreSQL (Supabase Pooler).
- **Segurança:** Bcrypt.js, JsonWebToken, Dotenv, Middlewares customizados.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior).
- Gerenciador de pacotes `npm`.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/NuveTecBR/EspacoCrescer.git
   cd EspacoCrescer
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o modelo de ambiente para dentro de `backend`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *(No Windows PowerShell: `Copy-Item backend\.env.example backend\.env`)*

4. **Inicie a aplicação:**
   ```bash
   npm start
   ```
   O servidor estará ativo na porta **3337**:
   - **Ambiente Web:** [http://localhost:3337](http://localhost:3337)
   - **Health Check:** [http://localhost:3337/api/health](http://localhost:3337/api/health)

5. **Execute os Testes Automatizados:**
   ```bash
   npm test
   ```

---

## 🧪 Suíte de Testes Automatizados

O sistema conta com testes de ponta a ponta (`backend/test_suite.js`) com 100% de sucesso nas asserções:

- [x] Verificação de integridade do Health Check e Security Headers.
- [x] Listagem de oficinas e blocos da linha do tempo da rotina por turno.
- [x] Simulação matemática de mensalidade com desconto progressivo para irmãos.
- [x] Agendamento de visita pedagógica com respeito ao Art. 14 da LGPD e Honeypot anti-bot.
- [x] Autenticação da coordenação pedagógica via JWT e atualização de status de visitas.

---

## 📡 Endpoints da API REST

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/health` | Público | Telemetria e disponibilidade da plataforma |
| `GET` | `/api/oficinas` | Público | Catálogo de oficinas pedagógicas e horários |
| `GET` | `/api/rotina` | Público | Rotina diária detalhada por turno escolar |
| `POST` | `/api/planos/simular` | Público | Cálculo server-side de mensalidade e descontos |
| `POST` | `/api/visitas` | Público (Rate-Limited) | Agendamento online de visita pedagógica |
| `POST` | `/api/lgpd` | Público (Rate-Limited) | Canal de privacidade e proteção ao titular/menor |
| `POST` | `/api/auth/login` | Público (Rate-Limited) | Autenticação técnica de coordenação e secretaria |
| `GET` | `/api/visitas` | Privado (JWT) | Painel geral de agendamentos para a coordenação |

---

## 📂 Estrutura de Pastas

```
EspacoCrescer/
├── backend/
│   ├── controllers/      # Regras de negócio, visitas e oficinas
│   ├── database/         # Schemas e conexões SQLite/Postgres
│   ├── middlewares/      # Rate limits, autenticação JWT, sanitização
│   ├── routes/           # Definição dos endpoints REST
│   ├── services/         # Cálculo de planos e regras pedagógicas
│   ├── validators/       # Validação rigorosa de esquemas de dados
│   ├── .env.example      # Variáveis de ambiente modelo
│   ├── package.json      # Dependências e scripts
│   ├── server.js         # Entrada do servidor Express
│   └── test_suite.js     # Suíte de testes automatizados
├── frontend/
│   ├── css/              # Estilos modulares e design system pedagógico
│   ├── js/               # Scripts client-side e integração
│   └── index.html        # Página institucional do Espaço Crescer
├── sql/
│   └── schema.sql        # Esquema SQL do banco de dados
├── .gitignore            # Exclusões do Git
├── iniciar.ps1           # Script PowerShell de inicialização
├── package.json          # Orquestrador de scripts npm
└── README.md             # Esta documentação
```

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE). Desenvolvido por **NuveTec** ([@NuveTecBR](https://github.com/NuveTecBR)) como parte do portfólio de engenharia de software da Nuvetec.
