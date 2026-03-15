const BOT_TOKEN        = '8512268158:AAHm5DmoejypFosrSmJNYlX-PnyYzRM_rio';
const CHAT_ID          = '891314';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || '';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Bad Request' };
  }

  const { name, contact, message, token } = body;

  if (TURNSTILE_SECRET) {
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token })
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Captcha не пройдена' }) };
    }
  }

  if (!name || !contact || !message) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  const text = [
    '📩 Новое сообщение с azamat.uz',
    '',
    `👤 Имя: ${name}`,
    `📬 Контакт: ${contact}`,
    '',
    '💬 Сообщение:',
    message
  ].join('\n');

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text })
  });

  const data = await res.json();

  if (data.ok) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } else {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: data.description }) };
  }
};
