# 🚀 n8n - Dashboard de Analytics

## Visão Geral

Este projeto é um dashboard de analytics de código aberto, projetado para monitorar a saúde e o desempenho de fluxos de trabalho (workflows) em plataformas como o **n8n** e a **Evolution**, além de rastrear o consumo de tokens e custos da API da **OpenAI** por projeto.

O dashboard é um frontend que se comunica com webhooks do n8n, garantindo que a lógica de backend e as chaves de API sensíveis permaneçam seguras.

## ⚙️ Configuração de Ambiente (Variáveis de Ambiente)

Para garantir a máxima segurança e portabilidade, todas as configurações sensíveis e variáveis de ambiente são lidas durante o processo de *build* do frontend.

### 1. Arquivo `.env.example`

O projeto utiliza um arquivo `.env.example` para listar todas as variáveis necessárias.

**Passos:**

1.  Crie uma cópia do arquivo `.env.example` e renomeie-a para `.env`.
2.  Preencha as variáveis com seus respectivos valores.

### 2. Variáveis de Ambiente Necessárias

As variáveis devem ser configuradas no seu ambiente de hospedagem (ex: Dokploy, Vercel, Netlify) e devem usar o prefixo `VITE_PUBLIC_` para serem expostas ao frontend.

| Variável | Descrição | Exemplo de Valor |
| :--- | :--- | :--- |
| `VITE_PUBLIC_DASHBOARD_WEBHOOK_URL` | URL do webhook do fluxo que coleta dados do n8n e Evolution. | `https://n8n.seuservidor.com/webhook/evolution-data` |
| `VITE_PUBLIC_TOKEN_USAGE_WEBHOOK_URL` | URL do webhook do fluxo que coleta dados de consumo da OpenAI. | `https://n8n.seuservidor.com/webhook/openai-costs` |
| `VITE_PUBLIC_USD_TO_BRL` | Taxa de câmbio média do dólar para conversão de custos. | `5.55` |
| `VITE_PUBLIC_REFRESH_INTERVAL_MS` | Intervalo de tempo (em milissegundos) para a atualização automática dos dados. | `30000` |
| `VITE_PUBLIC_DEFAULT_THEME` | Tema padrão ao carregar o app. | `"dark"` |
| *Outras variáveis* | *Configurações de notificação, PWA, etc.* | *Consulte o `.env.example`* |

---

## 🛠️ Configuração dos Fluxos (Backend n8n)

O dashboard depende de dois fluxos de trabalho (workflows) no n8n para buscar e processar os dados.

### 1. Fluxo de Dados n8n e Evolution

Este fluxo é responsável por coletar informações abrangentes sobre a sua operação (logs de execução, status de workflows, instâncias da Evolution, RabbitMQ, etc.).

**Passos de Configuração:**

1.  Crie o fluxo no seu n8n. O nó inicial deve ser um **Webhook**.
2.  Após ativar o fluxo, copie a **URL do Webhook** gerada.
3.  Cole esta URL na variável `VITE_PUBLIC_DASHBOARD_WEBHOOK_URL` no seu `.env` e no seu ambiente de hospedagem.

### 2. Fluxo de Consumo e Custos da OpenAI

Este fluxo busca o consumo de tokens e os custos associados por projeto, nos últimos 30 dias.

#### 2.1. Configuração da API Key da OpenAI (Admin Key)

Para acessar os dados de consumo e custo por projeto, é necessário gerar uma **Admin Key** com permissões específicas.

**Passos para Geração da Chave:**

1.  Acesse a página de criação de chaves de organização da OpenAI: [https://platform.openai.com/settings/organization/admin-keys](https://platform.openai.com/settings/organization/admin-keys)
2.  Crie uma nova chave.
3.  Em **Permissões**, ative as **Permissões Restritas**.
4.  Defina as permissões seguindo a regra:
    *   Para todas as opções que possuírem a opção **Write (Escrita)**, selecione-a.
    *   Para as opções que não possuírem a opção **Write**, selecione **Read (Leitura)**.
5.  Salve a chave gerada e utilize-a no seu fluxo n8n para autenticar as requisições à API de uso.

#### 2.2. Mapeamento Manual de Projetos

A API da OpenAI retorna os dados de consumo e custo usando os IDs internos dos projetos. Para que o dashboard exiba nomes amigáveis, você deve criar um mapeamento manual dentro do seu fluxo n8n.

**Passos para Obter os IDs dos Projetos:**

1.  Acesse a página de projetos da sua organização na OpenAI: [https://platform.openai.com/settings/organization/projects](https://platform.openai.com/settings/organization/projects)
2.  Copie o **ID** de cada projeto que você deseja monitorar.
3.  No seu fluxo n8n, utilize um nó `Set` ou similar para mapear o ID do projeto (ex: `proj_xxxxxxxx`) para o nome amigável (ex: `MURILO`).

**Conclusão do Fluxo:**

Após a conclusão e ativação do fluxo, copie a **URL do Webhook** gerada e cole-a na variável `VITE_PUBLIC_TOKEN_USAGE_WEBHOOK_URL`.

---
## 🚀 Implantação do Frontend

O projeto é um frontend que se comunica com os webhooks do n8n. A implantação pode ser feita em qualquer serviço de hospedagem estática ou que suporte Node.js, como **Dokploy**, Vercel ou Netlify.

**Passos Recomendados:**

1.  **Commit e Push:** Suba o código do seu projeto (incluindo o `README.md` e o `.env.example`) para um repositório no GitHub.
2.  **Conexão com Serviço de Implantação:** Conecte o seu repositório GitHub ao serviço de implantação (ex: Dokploy).
3.  **Configuração de Variáveis:** Antes do primeiro *deploy*, configure todas as variáveis de ambiente listadas na Seção 1 no painel de controle do seu serviço de hospedagem.
4.  **Build e Deploy:** Inicie o processo de *build* e *deploy*.

## 🔒 Segurança (Recomendado)

Embora as URLs dos webhooks não estejam mais expostas no código-fonte, o acesso ao dashboard ainda é público. Para proteger seus dados, é **altamente recomendado** que você adicione uma camada de segurança ao frontend.

**Sugestões de Segurança:**

*   **Autenticação Simples:** Utilize recursos de autenticação nativos do seu serviço de hospedagem (ex: *Basic Auth* ou proteção por senha) para restringir o acesso à página.
*   **Restrição de IP:** Se o acesso for estritamente interno, configure a restrição de acesso por faixa de IP no seu serviço de hospedagem.

---

## 🤝 Contribuição

Sinta-se à vontade para contribuir com melhorias de código, design ou documentação.

**Whatsapp:** (63) 9237-5491

**[INSERIR INFORMAÇÕES DE CONTATO OU REPOSITÓRIO AQUI]**
