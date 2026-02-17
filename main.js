console.log("main.js 已加载");
// 给所有 .options 里的按钮加点选逻辑
document.querySelectorAll(".options").forEach(group => {
  const buttons = group.querySelectorAll("button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // 如果已经选中 → 再点就取消
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        return;
      }

      // 同一组选项里只能有一个 active
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
});
const submitBtn = document.querySelector(".submit-btn");

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

  // 收集喜好
  const preference = document.querySelector("textarea").value;
  result.preference = preference;

  console.log("用户选择：", result);

  try {
    const response = await fetch("/.netlify/functions/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(result)
    });

    const data = await response.json();

    console.log("推荐结果：", data);

  } catch (error) {
    console.error("请求失败：", error);
  }
});

console.log("提交按钮：", document.querySelector(".submit-btn"));
