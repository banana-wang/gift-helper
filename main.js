console.log("main.js 已加载");

// =======================
// 选项单选逻辑
// =======================
document.querySelectorAll(".options").forEach(group => {
  const buttons = group.querySelectorAll("button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        return;
      }

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
});

// =======================
// 提交逻辑
// =======================
const submitBtn = document.querySelector(".submit-btn");
const resultDiv = document.querySelector(".result");

submitBtn.addEventListener("click", async () => {
  const result = {};

  // 收集选项
  document.querySelectorAll(".options").forEach(group => {
    const field = group.dataset.field;
    if (!field) return;

    const activeBtn = group.querySelector(".active");
    if (activeBtn) {
      result[field] = activeBtn.innerText;
    }
  });

  // 收集文本
  const textarea = document.querySelector("textarea");
  result.preference = textarea ? textarea.value : "";

  console.log("用户选择：", result);

  // 显示 loading
  resultDiv.innerHTML = "<p>🎁 正在为你生成礼物推荐...</p>";

  try {
    const response = await fetch("/.netlify/functions/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(result)
    });

    if (!response.ok) {
      throw new Error("服务器响应异常");
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error("后端返回异常");
    }

    let gifts;

    try {
      // 清理可能的 ```json 标记
      const cleaned = data.result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      gifts = JSON.parse(cleaned);

    } catch (err) {
      console.error("AI返回内容：", data.result);
      throw new Error("AI返回格式异常");
    }

    // =======================
    // 渲染卡片
    // =======================
    resultDiv.innerHTML = "";

    gifts.forEach(item => {
      const card = document.createElement("div");
      card.className = "gift-card";

      card.innerHTML = `
  <div class="gift-image">
    <img src="${item.image}" alt="${item.name}">
  </div>

  <div class="gift-content">
    <h3>${item.name}</h3>
    <p class="price">${item.price}</p>
    <p class="reason">${item.reason}</p>
  <a href="https://so.m.taobao.com/search?q=${encodeURIComponent(item.name)}"
   target="_blank"
   class="buy-btn">
 
      去淘宝看看 →
    </a>
  </div>
`;


      resultDiv.appendChild(card);
    });

  } catch (error) {
    console.error("请求失败：", error);
    resultDiv.innerHTML = `
      <p style="color:red;">
        请求出错：${error.message}
      </p>
    `;
  }
});
