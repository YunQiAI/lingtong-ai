const fs = require('fs');
const path = require('path');
const axios = require('axios');
const configPath = path.join(__dirname, 'local_storage', 'config.json');

async function analyzeImage(imagePath) {
  const imageData = fs.readFileSync(imagePath, { encoding: 'base64' });
  let config = {};

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(raw);
  } catch (e) {
    console.error("读取 config.json 失败：", e);
    throw new Error("未配置 API 设置，请前往左侧填写 API 信息。");
  }

  const { apiBase, apiKey, deploymentName } = config;
  if (!apiBase || !apiKey || !deploymentName) {
    throw new Error("API 设置不完整，请填写完整信息后保存。");
  }

  const url = `${apiBase}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-12-01-preview`;

  const tool_def = [{
    type: "function",
    function: {
      name: "generate_battleground_strategy",
      description: "根据图像中的游戏局势生成结构化战术建议",
      parameters: {
        type: "object",
        properties: {
          threat_level: {
            type: "string",
            description: "当前对手威胁程度",
            enum: ["low", "medium", "high"]
          },
          opponent_minions: {
            type: "array",
            description: "对手随从名",
            items: { type: "string" }
          },
          suggested_action: {
            type: "string",
            description: "推荐战术动作"
          },
          kill_turn_possible: {
            type: "boolean",
            description: "是否可能本回合击杀"
          }
        },
        required: ["suggested_action"]
      }
    }
  }];

  try {
    const response = await axios.post(url, {
      messages: [
        { role: "system", content: "你是一个图像战术分析专家，请根据截图调用分析函数，返回结构化战术建议。" },
        {
          role: "user",
          content: [
            { type: "text", text: "请分析这张截图。" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageData}`
              }
            }
          ]
        }
      ],
      tools: tool_def,
      tool_choice: "auto",
      max_tokens: 1200
    }, {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      }
    });

    const toolCall = response.data.choices[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      const text = `战术建议：
- 威胁等级：${parsed.threat_level}
- 对手随从：${parsed.opponent_minions?.join('，') || '未知'}
- 推荐行动：${parsed.suggested_action}
- 本回合可能斩杀：${parsed.kill_turn_possible ? '是' : '否'}`;
      return text;
    }

    return "未能解析结构化战术结果。";
  } catch (error) {
    console.error("调用 Tool Use 接口失败：", error?.response?.data || error.message);
    throw new Error("Tool Use 调用失败，请检查模型支持与参数配置。");
  }
}

module.exports = { analyzeImage };
