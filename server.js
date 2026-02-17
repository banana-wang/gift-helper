import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/test", async (req, res) => {
  const { budget, target, hobby, scene } = req.body;

  const prompt = `
你是一名非常擅长送礼的生活方式编辑和消费顾问。

请根据用户信息，推荐 3 个【现实中非常常见、容易在淘宝买到】的礼物。

用户信息：
- 预算：${budget}
- 送礼对象：${target}
- 对方喜好：${hobby}
- 送礼场景：${scene}

要求：
1. 礼物必须具体（不能是泛泛而谈，如“电子产品”）
2. 优先选择不挑人、不踩雷的选项
3. 推荐理由要结合「对象 + 场景 + 情绪价值」
4. 价格区间必须符合预算
5. 只返回 JSON，不要任何多余说明

返回格式（必须严格遵守）：

[
  {
    "name": "礼物名称",
    "reason": "为什么适合这个对象和场景",
    "price": "价格区间（人民币）"
  }
]
`;


  try {
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }]
        })
      }
    );

    const result = await response.json();

    console.log("DeepSeek 原始返回：", JSON.stringify(result, null, 2));

    // 🔴 关键：这里先判断，再访问
    if (!result.choices || !result.choices[0]) {
      return res.status(500).json({
        error: "AI 返回结构异常",
        raw: result
      });
    }

    const text = result.choices[0].message.content;

    let gifts = [];
    try {
      gifts = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "AI 返回的不是 JSON",
        raw: text
      });
    }

    res.json({
      message: "为你精选了这些礼物",
      gifts
    });

  } catch (err) {
    console.error("接口调用失败：", err);
    res.status(500).json({ error: "AI 请求失败" });
  }
});

app.listen(3000, () => {
  console.log("服务器启动：http://localhost:3000");
});
