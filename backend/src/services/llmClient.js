const config = require('../config');
const fetch = require('node-fetch');

async function callLLM(prompt, opts = {}) {
  if (!config.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');

  // OpenAI Chat Completions API (gpt-4o-mini, gpt-3.5-turbo, etc)
  const body = {
    model: config.LLM_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: opts.maxTokens || 512,
    temperature: opts.temperature || 0.2,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`LLM error: ${res.status} ${txt}`);
  }

  const data = await res.json();
  const out = data.choices?.[0]?.message?.content || data.choices?.[0]?.text;
  return typeof out === 'string' ? out : JSON.stringify(out);
}

module.exports = { callLLM };
