# EventFlow

O **EventFlow** resolve o problema de empresas que enfrentam dificuldades em organizar e gerenciar eventos de forma eficiente, seja webinars, workshops ou conferências.  

O sistema automatiza inscrições, controle de participantes e envio de notificações, eliminando processos manuais e centralizando informações críticas.  

O diferencial está na **integração com calendário**, **emissão de ingressos digitais** e **dashboard intuitivo** para monitoramento de inscritos e feedbacks.  

Isso resulta em **maior produtividade, controle e engajamento dos participantes**.

---

## 📋 Fluxo do Sistema

### 🏠 Tela Inicial (`/`)
- Lista de eventos públicos (EventsList.js).  
- Header com botões **Login** e **Registrar**.  

### 👤 Usuário Participante
- **Registrar-se:** `/register` → cria conta com `role: participant`.  
- **Login:** `/login` → valida e guarda sessão.  
- **Explorar eventos:** Ver eventos públicos na tela inicial.  
- **Inscrever-se:** Botão em cada evento abre `RegistrationForm.js`.  
- **Minhas inscrições:** Visualizar no `RegistrationsTable.js`.  
- **Feedbacks:** Enviar pelo `FeedbacksModal.js`.  

### 🎟️ Organizador
- **Solicitar conta:** `/organizer-request` → `role` vira `pending_organizer`.  
- **Confirmar pagamento (mock):** Atualiza role para `organizer`.  
- **Dashboard:** `/dashboard` → criar e gerenciar eventos.  

### 🛠️ Admin
- **Admin Panel:** `/admin/users`, `/admin/logs`, `/admin/analytics`.  
- Permite promover usuários, ver logs e métricas de eventos.  

---

## 🔑 Resumo de Acesso
| Tipo de Usuário | Rotas Importantes |
|-----------------|------------------|
| **Participant** | `/register`, `/login`, `/` |
| **Organizer**   | `/dashboard`, `/organizer-request` |
| **Admin**       | `/admin/users`, `/admin/logs`, `/admin/analytics` |

---

## 📊 Pesquisa de Mercado

### Sebrae
- **Descrição:** Instituição que oferece consultorias e eventos para empreendedores.  
- **Necessidade:** Dificuldade na gestão de inscrições e comunicação.  
- **Como ajudaria:** Centraliza inscrições e notificações, reduzindo falhas e otimizando tempo.  

### ABRACOM
- **Descrição:** Associação que promove eventos para profissionais de comunicação.  
- **Necessidade:** Grandes eventos demandam gestão automatizada para melhor experiência.  
- **Como ajudaria:** Gerencia inscrições digitais e envia lembretes automatizados.  

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React + Vite + TypeScript  
- **UI:** shadcn-ui + Tailwind CSS  
- **Backend:** Supabase (Auth, Database)  
- **Banco de Dados:** PostgreSQL (Supabase)  
- **Estilização extra:** CSS + estilos inspirados em Bootstrap  

---

## 📥 Instalação e Execução

### Usando sua IDE
```bash
# Clonar repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Instalar dependências
npm install

# Rodar app
npm run dev
```

### Usando Lovable
1. Acesse o [Lovable Project](https://lovable.dev/projects/f4ef832b-70c5-46e4-ad33-8cdda7cf8c01).  
2. Faça as alterações diretamente, commits automáticos serão gerados.  

### Editando no GitHub
1. Navegue até o arquivo.  
2. Clique no botão **Edit (lápis)**.  
3. Faça alterações e commit.  

### Usando GitHub Codespaces
1. Vá até o repositório.  
2. Clique em **Code → Codespaces**.  
3. Abra um **New codespace**.  

---

## 🌐 Publicação e Domínio

- Para publicar, no Lovable clique em **Share → Publish**.  
- Para conectar domínio personalizado:  
  - Vá em **Project → Settings → Domains → Connect Domain**.  
  - Consulte a documentação de *custom domains*.  

---

## 👥 Equipe

- **Kleber** → [Kleberapenas](https://github.com/Kleberapenas)  
- **Alisson** → [AlissonGaldino22](https://github.com/AlissonGaldino22)  
- **Caique** → [kiqrr](https://github.com/kiqrr)  
- **Bruno** → [br7trindade](https://github.com/br7trindade)  
- **Juan** → [juanpfr](https://github.com/juanpfr)  
