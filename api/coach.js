const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).json({});
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  const { job, messages } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a career coach specializing in EdTech and nonprofit product management. 
The user is asking about: ${job.title} at ${job.org}, ${job.location}.
Description: ${job.description}
Be concise, practical, and encouraging.`,
        messages: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
      })
    });

    const data = await response.json();
    const reply = data.content?.map(c => c.text || '').join('') || 'Sorry, try again.';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
