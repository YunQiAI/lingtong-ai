### 📘 `README.md`

```markdown
# 灵瞳助手（LingTong AI）

> 一款通用截图 + GPT Vision + Tool Use + 多轮语音交互的 AI 桌面助手。

---

## ✨ 项目简介

灵瞳助手是一款运行于 macOS 的轻量桌面应用，可实现：

- 任意窗口或区域截图
- 自动上传至 Azure GPT Vision 模型
- 调用 Tool Use 函数自动生成结构化战术建议
- 支持语音朗读、语音输入、聊天历史记录
- 可作为游戏对局分析、图像总结、战术建议、学习辅助等用途

---

## 🧠 主要功能

- 🖼️ **截图分析**：框选任意屏幕区域并上传给 GPT-4 Vision
- 🤖 **Tool Use 函数调用**：结构化输出战术建议（JSON → 文字）
- 🎙️ **语音输入 / 输出**：可语音提问，也可将 AI 回答朗读
- 🧾 **聊天历史保存**：自动记录每次对话并可加载回顾
- ⚙️ **API 图形配置界面**：配置 Azure Endpoint / Key / 部署名称

---

## 🖥️ 快速启动

1. 安装依赖：

```bash
npm install
```

2. 启动应用：

```bash
npm start
```

---

## 🧪 快捷键支持

| 快捷键 | 功能 |
|--------|------|
| `Cmd + Shift + H` | 自动截图并上传 GPT 分析 |
| 点击按钮 | 首次截图并记忆区域 |

---

## 📦 打包为 macOS `.dmg` 安装包

```bash
npm run build
```

生成路径为 `dist/灵瞳助手.dmg`

---

## 🔐 API 配置说明

应用启动后在左侧侧栏中填写：

- Azure Endpoint: `https://xxx.openai.azure.com`
- 部署名称：您创建的 GPT 模型名称（如 `gpt-4-vision`）
- API Key: Azure OpenAI 密钥

填写后点击“保存设置”即可。

---

## 🧩 文件结构

```
lingtong-ai/
├── main.js               # Electron 主进程
├── renderer.js           # 渲染逻辑 + 快捷键 + 语音
├── vision-api.js         # 调用 Azure GPT 接口（Tool Use）
├── index.html            # 前端页面结构
├── .gitignore            # 忽略提交文件配置
├── package.json          # 运行与打包配置
├── local_storage/        # 聊天历史与设置存储
└── README.md
```

---

## 🙌 致谢

本项目由李博士构思，由 ChatGPT 协助开发完成。  
灵瞳助手致力于构建一款真正通用、实用、优雅的 AI 桌面平台。

---

## 🧠 联系与支持

如您希望扩展功能、参与贡献，欢迎联系或 Fork 本项目。

