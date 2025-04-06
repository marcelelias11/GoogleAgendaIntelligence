# Assistente de Agenda Inteligente

Este aplicativo integra o Google Calendar com a inteligência artificial da OpenAI para ajudar você a gerenciar sua agenda de forma mais eficiente.

## 📋 Funcionalidades

- **Autenticação Google OAuth**: Conecte-se facilmente com sua conta Google para acessar seu calendário.
- **Visualização de Agenda**: Veja seus eventos em formato de calendário mensal e lista de próximos eventos.
- **Criação de Eventos**: Adicione novos eventos diretamente na interface ou peça ao assistente para criar para você.
- **Assistente com IA**: Use linguagem natural para criar eventos, lembretes e buscar informações.
- **Sincronização com Google Calendar**: Todos os eventos são sincronizados automaticamente com sua Agenda Google.

## 🚀 Como Começar

### Pré-requisitos

- Uma conta Google com Google Calendar ativo
- Acesso à internet
- Navegador atualizado (Chrome, Firefox, Edge ou Safari)

### Primeiros Passos

1. **Acesse o Aplicativo**: Abra a aplicação em seu navegador.

2. **Faça Login**: Clique no botão "Entrar com Google" e autorize o acesso à sua conta.

3. **Explore a Interface**: Após o login, você verá:
   - O calendário mensal na página principal
   - Uma lista de próximos eventos
   - Um menu lateral para acessar diferentes funcionalidades

## 💡 Como Usar

### Navegando pelo Calendário

- Use as setas para navegar entre os meses
- Clique em uma data para ver os eventos daquele dia
- Os eventos são representados por cores diferentes conforme a categoria

### Criando Eventos Manualmente

1. Clique no botão "+" ou em um espaço no calendário
2. Preencha os detalhes do evento:
   - Título
   - Data e hora de início
   - Data e hora de término
   - Descrição (opcional)
   - Localização (opcional)
   - Lembretes (opcional)
3. Clique em "Salvar" para criar o evento

### Usando o Assistente IA

1. Acesse a aba "Assistente" no menu lateral
2. Digite sua solicitação em linguagem natural, por exemplo:
   - "Agendar reunião com João amanhã às 14h"
   - "Criar lembrete para comprar leite na sexta-feira"
   - "Quando é minha próxima reunião?"
3. O assistente irá:
   - Entender sua solicitação
   - Realizar a ação necessária
   - Confirmar quando a ação for concluída

### Exemplos de Comandos para o Assistente

- "Agendar reunião de equipe na próxima segunda às 10h"
- "Criar lembrete para ligar para o dentista amanhã às 9h"
- "Mostrar meus compromissos desta semana"
- "Reagendar a reunião com Maria de amanhã para sexta-feira"
- "Quais eventos tenho no próximo fim de semana?"

## ⚙️ Configurações

Na seção de configurações, você pode:

- Gerenciar quais calendários Google são exibidos
- Personalizar cores de calendários
- Configurar horário de trabalho
- Definir preferências de notificações

## 📱 Acesso em Dispositivos Móveis

O aplicativo é totalmente responsivo e pode ser acessado perfeitamente de qualquer dispositivo:

- Smartphones
- Tablets
- Computadores

## 🔒 Privacidade e Segurança

- Seus dados são sincronizados apenas com sua conta Google
- A aplicação solicita apenas as permissões necessárias para funcionar
- Conexão segura através de HTTPS
- Não compartilhamos seus dados com terceiros

## 🆘 Solução de Problemas

**Problema de conexão com Google Calendar:**
- Verifique sua conexão com a internet
- Tente fazer logout e login novamente
- Certifique-se de que permitiu as permissões necessárias

**Eventos não aparecem:**
- Verifique se o calendário está selecionado nas configurações
- Atualize a página
- Confirme se o evento está dentro do período visualizado

**Assistente não responde corretamente:**
- Seja mais específico em suas solicitações
- Use frases completas e claras
- Verifique se a solicitação está relacionada ao calendário

## 📞 Suporte

Se encontrar problemas ou tiver sugestões, entre em contato conosco através da aba "Ajuda" no aplicativo ou envie um e-mail para suporte@assistenteagenda.com.br.

---

Desenvolvido com ❤️ para tornar seu gerenciamento de tempo mais inteligente.

## 🛠️ Requisitos Técnicos

Este projeto foi desenvolvido utilizando:

- **Frontend**: React.js com TypeScript
- **Backend**: Node.js com Express
- **Estilização**: Tailwind CSS e componentes shadcn/ui
- **Banco de Dados**: Armazenamento em memória
- **Autenticação**: Google OAuth 2.0
- **API Externas**: 
  - Google Calendar API para gerenciamento de eventos
  - OpenAI API para o assistente inteligente

## 🔑 Configuração de Chaves API

Para executar o projeto localmente, você precisará:

1. **Conta Google Cloud Platform**:
   - Criar um projeto
   - Habilitar Google Calendar API
   - Configurar as credenciais OAuth

2. **Conta OpenAI**:
   - Obter uma chave de API da OpenAI
   - Configurar a chave no arquivo de ambiente (.env)

## 📦 Instalação e Execução

Para configurar o ambiente de execução:

1. Configure as variáveis de ambiente necessárias:
   - OPENAI_API_KEY: sua chave de API da OpenAI
   - GOOGLE_CLIENT_ID: seu ID de cliente do Google
   - GOOGLE_CLIENT_SECRET: seu segredo de cliente do Google
   - GOOGLE_REDIRECT_URI: URI de redirecionamento (ex: http://localhost:5000/api/auth/callback)

2. Inicie o workflow "Start application" para executar a aplicação

