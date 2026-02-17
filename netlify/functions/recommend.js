export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    const prompt = `
你是一个送礼推荐专家。
根据以下条件推荐3个具体淘宝礼物。

预算：${body.budget || "不限"}
送礼方向：${body.category || "不限"}
礼物质感：${body.style || "不限"}
送礼场景：${body.scene || "不限"}
朋友喜好：${body.preference || "无"}

请严格返回JSON数组格式：
[
  {
    "name": "商品名称",
    "price": "价格",
    "image": "商品图片URL",
    "link": "淘宝商品链接",
    "reason": "推荐理由"
  }
]
`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个礼物推荐助手" },
          { role: "user", content: prompt }
        ]
      })
    });

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "DeepSeek返回格式错误",
          raw: rawText
        })
      };
    }

    if (!data.choices || !data.choices[0]) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "DeepSeek返回内容异常",
          raw: data
        })
      };
    }

    const reply = data.choices[0].message.content;

    return {
  statusCode: 200,
  body: JSON.stringify({
    result: reply
  })
};


  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "推荐失败", detail: error.message })
    };
  }
}

