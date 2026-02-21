const BOT_TOKEN = "8460425220:AAFDw77XNssBuHAIqj2yJ2TnYEfkV9uxhN4";
const WORKER_URL = "https://jhnbqw.dpdns.org";
// 要验证的频道
const REQUIRED_CHANNEL = "@jhnb789113";

export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      try {
        const update = await request.json();
        const msg = update.message;
        if (!msg) return new Response('OK');

        const chatId = msg.chat.id;
        const text = msg.text || '';
        let reply = '';

        // 1. 先检查用户是否加入频道
        const isMember = await checkMember(chatId);

        if (!isMember) {
          reply = `⚠️ 请先关注频道再使用本机器人！\n👉 ${REQUIRED_CHANNEL}`;
        } else {
          // 已关注，正常使用
          if (text === '/start') {
            reply = "✅ 验证通过！机器人已启动\n运行环境：Cloudflare Workers";
          } else if (text === '/id') {
            reply = `🆔 你的ID：${chatId}`;
          } else {
            reply = "你好！请使用指令：/start /id";
          }
        }

        // 回复消息
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply
          })
        });
      } catch (e) {}
      return new Response('OK');
    }

    // 网页访问自动设置webhook
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WORKER_URL}`);
    return new Response('✅ Cloudflare Telegram Bot 运行正常', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// 检查是否加入频道
async function checkMember(userId) {
  const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${REQUIRED_CHANNEL}&user_id=${userId}`;
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data.ok) {
      const status = data.result.status;
      // 不是被踢出、限制的，都算有效成员
      return status !== "left" && status !== "kicked";
    }
  } catch (e) {}
  return false;
}
