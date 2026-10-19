# Nexcan

**Leitor de QR Codes web desenvolvido com React e TypeScript.**

O Nexcan é uma aplicação web que permite identificar e interpretar QR Codes utilizando a câmera do dispositivo ou imagens enviadas pelo usuário.

Seu objetivo é oferecer uma experiência simples, rápida e controlada: após identificar um QR Code, o sistema encerra automaticamente a câmera e apresenta o conteúdo para que o usuário decida o que fazer.

**[Repositório no GitHub](https://github.com/GuiBragz/Nexcan)** · **[Portfólio do desenvolvedor](https://guibraga.com.br)**## Acesse o Nexcan

**Aplicação online:** https://nexcan.vercel.app/

O Nexcan funciona diretamente no navegador, sem necessidade de instalação.

[Experimentar Nexcan](https://nexcan.vercel.app/)

---

## Funcionalidades

- **Leitura pela câmera:** identificação de QR Codes diretamente pelo navegador.
- **Leitura por imagem:** envio de imagens contendo QR Codes, sem necessidade de ativar a câmera.
- **Desligamento automático:** encerramento da captura de vídeo após uma leitura bem-sucedida.
- **Identificação de conteúdo:** classificação de URLs HTTP/HTTPS, links de arquivos conhecidos e textos.
- **Informações do resultado:** exibição do domínio de origem e do tipo de arquivo quando identificável.
- **Abertura controlada:** o usuário decide quando acessar o endereço identificado.
- **Cópia do conteúdo:** transferência rápida do resultado para a área de transferência.
- **Download de arquivos:** opção de solicitar o download quando o navegador e o servidor de origem permitirem.
- **Leituras consecutivas:** possibilidade de iniciar uma nova leitura sem atualizar a página.
- **Interface responsiva:** adaptação para computadores, tablets e smartphones.

## Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| React | Construção da interface |
| TypeScript | Tipagem e organização da aplicação |
| Vite | Desenvolvimento e build |
| HTML5 QR Code | Leitura de QR Codes por câmera e imagem |
| CSS3 | Estilização e responsividade |
| Web APIs | Acesso à câmera, seleção de arquivos e área de transferência |

## Como funciona

### Leitura pela câmera

1. O usuário seleciona **Ativar câmera**.
2. O navegador solicita a autorização necessária.
3. A aplicação inicia a captura e procura um QR Code.
4. Ao identificar o código, o Nexcan encerra a captura da câmera.
5. O conteúdo é analisado e apresentado na interface.
6. O usuário pode abrir, copiar ou iniciar outra leitura.

### Leitura por imagem

1. O usuário seleciona **Enviar imagem com QR Code**.
2. Escolhe uma imagem armazenada no dispositivo.
3. A aplicação tenta localizar e interpretar o QR Code.
4. O conteúdo identificado é apresentado sem ativar a câmera.

## Privacidade e comportamento

O Nexcan realiza a leitura no navegador e não necessita de um backend para suas funcionalidades atuais.

A câmera somente é ativada após uma ação do usuário. Durante uma leitura bem-sucedida, a aplicação encerra a captura antes de apresentar o resultado.

Os endereços identificados não são abertos automaticamente. O usuário pode verificar o conteúdo antes de decidir acessá-lo.

A aplicação não mantém um histórico persistente dos QR Codes lidos.

## Como executar localmente

### Pré-requisitos

- Node.js compatível com a versão do Vite utilizada pelo projeto.
- npm.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/GuiBragz/Nexcan.git
```

Acesse a pasta:

```bash
cd Nexcan
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra no navegador o endereço informado pelo Vite, normalmente:

```text
http://localhost:5173
```

### Build de produção

```bash
npm run build
```

Os arquivos gerados ficam na pasta `dist/`.

## Limitações conhecidas

- A identificação de arquivos é baseada principalmente nas extensões presentes nas URLs. Links sem extensão podem ser classificados como links comuns.
- O botão de download depende das permissões do servidor de origem e das restrições do navegador.
- O Nexcan não verifica automaticamente se os endereços identificados são seguros.
- O acesso à câmera depende das permissões do navegador e de um contexto seguro, como HTTPS ou localhost.
- A leitura de imagens depende da qualidade, resolução e legibilidade do QR Code.

## Estrutura do projeto

```text
nexcan/
├── public/
│   └── nexcan-icon.png
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── README.md
└── LICENSE
```

*Estrutura resumida com os principais arquivos.*

## Licença

Distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais informações.

## Desenvolvedor

**Guilherme Braga Ferreira**

Desenvolvedor de software, com atuação em aplicações web, sistemas e soluções voltadas à resolução de problemas.

[Portfólio](https://guibraga.com.br) · [GitHub](https://github.com/GuiBragz)

---

Desenvolvido com React, TypeScript e foco em simplicidade, usabilidade e controle do usuário.
