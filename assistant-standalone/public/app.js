const messages = document.querySelector("#messages");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#questionInput");
const sendButton = document.querySelector("#sendButton");
const statusBadge = document.querySelector("#status");
const quickButtons = document.querySelectorAll("[data-question]");
const wechatTemplate = document.querySelector("#wechatTemplate");

const welcomeText = `您好，我是AI升学助手。

我可以帮助解答：

• AEIS
• O-Level
• WACE
• 新加坡学校
• 新加坡大学
• 香港大学

请直接输入您的问题。`;

let config = {
  wechatId: "请配置顾问微信号",
  wechatQrUrl: "",
};
let loading = false;
let pendingRow = null;

init();

async function init() {
  try {
    const response = await fetch("/api/config");
    if (response.ok) config = await response.json();
  } catch {}

  addMessage("assistant", welcomeText);
  updateSendState();
  input.focus();
}

function addMessage(role, content, options = {}) {
  const row = document.createElement("div");
  row.className = `message-row ${role}${options.pending ? " pending" : ""}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (options.pending) {
    bubble.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
  } else {
    bubble.textContent = content;
  }

  row.appendChild(bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
  return row;
}

function updateSendState() {
  const hasText = input.value.trim().length > 0;
  sendButton.disabled = !hasText || loading;
  sendButton.textContent = loading ? "发送中" : "发送";
  statusBadge.textContent = loading ? "思考中" : "在线";
  statusBadge.classList.toggle("thinking", loading);
}

function setQuickButtonsDisabled(disabled) {
  quickButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

function showWechatCard() {
  const card = wechatTemplate.content.cloneNode(true);
  const qrBox = card.querySelector("#qrBox");
  const wechatId = card.querySelector("#wechatId");
  const button = card.querySelector("#wechatButton");

  wechatId.textContent = config.wechatId;

  if (config.wechatQrUrl) {
    qrBox.textContent = "";
    const image = document.createElement("img");
    image.src = config.wechatQrUrl;
    image.alt = "顾问微信二维码";
    qrBox.appendChild(image);
  }

  button.addEventListener("click", async () => {
    fetch("/api/wechat-click", { method: "POST" });
    button.classList.add("clicked");
    try {
      await navigator.clipboard.writeText(config.wechatId);
      button.textContent = "已复制微信号";
      window.setTimeout(() => {
        button.textContent = "立即咨询";
        button.classList.remove("clicked");
      }, 1600);
    } catch {
      button.textContent = "请手动复制微信号";
      window.setTimeout(() => {
        button.textContent = "立即咨询";
        button.classList.remove("clicked");
      }, 1600);
    }
  });

  messages.appendChild(card);
  requestAnimationFrame(() => {
    messages.lastElementChild?.classList.add("visible");
  });
  messages.scrollTop = messages.scrollHeight;
}

async function ask(question) {
  const trimmed = question.trim();
  if (!trimmed || loading) return;

  loading = true;
  input.value = "";
  updateSendState();
  setQuickButtonsDisabled(true);
  addMessage("user", trimmed);
  pendingRow = addMessage("assistant", "", { pending: true });

  const pendingBubble = pendingRow?.querySelector(".bubble");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: trimmed }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "请求失败");
    }

    pendingRow?.classList.remove("pending");
    pendingBubble.textContent = data.answer || "抱歉，暂时没有获得有效回答。";
    showWechatCard();
  } catch (error) {
    pendingRow?.classList.remove("pending");
    pendingBubble.textContent =
      error instanceof Error
        ? error.message
        : "抱歉，AI助手暂时无法连接。您可以先添加顾问微信，由老师为您解答。";
    showWechatCard();
  } finally {
    loading = false;
    pendingRow = null;
    setQuickButtonsDisabled(false);
    updateSendState();
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  ask(input.value);
});

quickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.add("selected");
    window.setTimeout(() => button.classList.remove("selected"), 350);
    ask(button.dataset.question || "");
  });
});

input.addEventListener("input", updateSendState);
