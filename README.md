# Eliza

<img src="./docs/static/img/eliza_banner.jpg" alt="Eliza Banner" width="100%" />

_As seen powering [@DegenSpartanAI](https://x.com/degenspartanai) and [@MarcAIndreessen](https://x.com/pmairca)_

-   Multi-agent simulation framework /多模态agent框架
-   Add as many unique characters as you want with [characterfile](https://github.com/lalalune/characterfile/)/ 可添加任意你想要的独特角色
-   Full-featured Discord and Twitter connectors, with Discord voice channel support/ 100%支持discord/twitter连接，支持discord语音频道
-   Full conversational and document RAG memory / 支持完整对话文档
-   Can read links and PDFs, transcribe audio and videos, summarize conversations, and more /支持链接，pdf阅读，音视频转录、对话总结等功能
-   Highly extensible - create your own actions and clients to extend Eliza's capabilities /高拓展性-可以创建自己的客户端和工作流来对Eliza的功能进行拓展
-   Supports open source and local models (default configured with Nous Hermes Llama 3.1B) / 支持开源和本地模型 （默认配置为 Nous Hermes Llama 3.1B）
-   Supports OpenAI for cloud inference on a light-weight device /支持OpenAI，可在云端实现轻量级部署
-   "Ask Claude" mode for calling Claude on more complex queries /可通过“Ask Claude”模式实现复杂需求
-   100% Typescript / 100% Typescript 编写

# Getting Started/开始使用

**Prerequisites (MUST)/前置要求（必须）:**

-   [Node.js 22+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
-   Nodejs安装
-   [pnpm](https://pnpm.io/installation)
-   使用pnpm

### Edit the .env file/编辑.env文件

-   Copy .env.example to .env and fill in the appropriate values
-   - 将 .env.example 复制为 .env 并填写适当的值
-   Edit the TWITTER environment variables to add your bot's username and password
-   编辑推特环境并输入你的推特账号和密码

### Edit the character file/编辑角色文件

-   Check out the file `src/core/defaultCharacter.ts` - you can modify this
-   查看文件 `src/core/defaultCharacter.ts` - 您可以修改它
-   You can also load characters with the `pnpm start --characters="path/to/your/character.json"` and run multiple bots at the same time.
-   您也可以使用 `node --loader ts-node/esm src/index.ts --characters="path/to/your/character.json"` 加载角色并同时运行多个机器人。

After setting up the .env file and character file, you can start the bot with the following command:

在完成账号和角色文件的配置后，输入以下命令行启动你的bot：
```
pnpm i
pnpm start
```

# Customising Eliza 自定义Eliza

### Adding custom actions 添加常规行为

To avoid git clashes in the core directory, we recommend adding custom actions to a `custom_actions` directory and then adding them to the `elizaConfig.yaml` file. See the `elizaConfig.example.yaml` file for an example.

为避免在核心目录中的 Git 冲突，我们建议将自定义操作添加到 custom_actions 目录中，并在 elizaConfig.yaml 文件中配置这些操作。可以参考 elizaConfig.example.yaml 文件中的示例。

## Running with different models 配置不同的大模型

### Run with Llama

You can run Llama 70B or 405B models by setting the `XAI_MODEL` environment variable to `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` or `meta-llama/Meta-Llama-3.1-405B-Instruct`

您可以通过设置 `XAI_MODEL` 环境变量为 `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` 或 `meta-llama/Meta-Llama-3.1-405B-Instruct` 来运行 Llama 70B 或 405B 模型


### Run with Grok

You can run Grok models by setting the `XAI_MODEL` environment variable to `grok-beta`

您可以通过设置 `XAI_MODEL` 环境变量为 `grok-beta` 来运行 Grok 模型


### Run with OpenAI

You can run OpenAI models by setting the `XAI_MODEL` environment variable to `gpt-4o-mini` or `gpt-4o`
您可以通过设置 `XAI_MODEL` 环境变量为 `gpt-4o-mini` 或 `gpt-4o` 来运行 OpenAI 模型


## Additional Requirements

You may need to install Sharp. If you see an error when starting up, try installing it with the following command:
您可能需要安装 Sharp。如果在启动时看到错误，请尝试使用以下命令安装：


```
pnpm install --include=optional sharp
```

# Environment Setup 环境设置

You will need to add environment variables to your .env file to connect to various platforms:
您需要在 .env 文件中添加环境变量以连接到各种平台：

```
# Required environment variables
DISCORD_APPLICATION_ID=
DISCORD_API_TOKEN= # Bot token
OPENAI_API_KEY=sk-* # OpenAI API key, starting with sk-
ELEVENLABS_XI_API_KEY= # API key from elevenlabs

# ELEVENLABS SETTINGS
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_STABILITY=0.5
ELEVENLABS_VOICE_SIMILARITY_BOOST=0.9
ELEVENLABS_VOICE_STYLE=0.66
ELEVENLABS_VOICE_USE_SPEAKER_BOOST=false
ELEVENLABS_OPTIMIZE_STREAMING_LATENCY=4
ELEVENLABS_OUTPUT_FORMAT=pcm_16000

TWITTER_DRY_RUN=false
TWITTER_USERNAME= # Account username
TWITTER_PASSWORD= # Account password
TWITTER_EMAIL= # Account email
TWITTER_COOKIES= # Account cookies

X_SERVER_URL=
XAI_API_KEY=
XAI_MODEL=


# For asking Claude stuff
ANTHROPIC_API_KEY=

WALLET_PRIVATE_KEY=EXAMPLE_WALLET_PRIVATE_KEY
WALLET_PUBLIC_KEY=EXAMPLE_WALLET_PUBLIC_KEY

BIRDEYE_API_KEY=

SOL_ADDRESS=So11111111111111111111111111111111111111112
SLIPPAGE=1
RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=


## Telegram
TELEGRAM_BOT_TOKEN=

TOGETHER_API_KEY=
```

# Local Inference Setup 本地设置

### CUDA Setup CUDA设置

If you have an NVIDIA GPU, you can install CUDA to speed up local inference dramatically.
如果你有高性能的英伟达显卡，你可以以下命令行通过CUDA来做本地加速

```
pnpm install
npx --no node-llama-cpp source download --gpu cuda
```

Make sure that you've installed the CUDA Toolkit, including cuDNN and cuBLAS.
确保你安装了完整的CUDA工具包，包括cuDNN和cuBLAS

### Running locally 本地运行

Add XAI_MODEL and set it to one of the above options from [Run with
Llama](#run-with-llama) - you can leave X_SERVER_URL and XAI_API_KEY blank, it
downloads the model from huggingface and queries it locally

添加 XAI_MODEL 并将其设置为上述 [使用 Llama 运行](#run-with-llama) 中的选项之一 
您可以将 X_SERVER_URL 和 XAI_API_KEY 留空，它会从 huggingface 下载模型并在本地查询


# Clients 客户端

## Discord Bot

For help with setting up your Discord Bot, check out here: https://discordjs.guide/preparations/setting-up-a-bot-application.html
关于怎么设置discord bot，可以查看discord的官方文档

# Development 开发

## Testing 测试

To run the test suite:
几种测试方法的命令行：

```bash
pnpm test           # Run tests once
pnpm test:watch    # Run tests in watch mode
```

For database-specific tests:
```bash
pnpm test:sqlite   # Run tests with SQLite
pnpm test:sqljs    # Run tests with SQL.js
```

Tests are written using Jest and can be found in `src/**/*.test.ts` files. The test environment is configured to:
测试使用 Jest 编写，位于 src/**/*.test.ts 文件中。测试环境配置如下：
- Load environment variables from `.env.test`
- Use a 2-minute timeout for long-running tests
- Support ESM modules
- Run tests in sequence (--runInBand)

To create new tests, add a `.test.ts` file adjacent to the code you're testing.
要创建新测试，请在要测试的代码旁边添加一个 .test.ts 文件。
