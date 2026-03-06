const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).json({});
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  const { query = 'product manager education', page = 1 } = req.query;
  const ADZUNA_ID  = process.env.ADZUNA_APP_ID;
  const ADZUNA_KEY = process.env.ADZUNA_APP_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  try {
    // ── 1. Adzuna — fetch 3 pages in parallel for more results ───────────────
    const adzunaPages = [1, 2, 3].map(p =>
      fetch(`https://api.adzuna.com/v1/api/jobs/us/search/${p}?app_id=${ADZUNA_ID}&app_key=${ADZUNA_KEY}&results_per_page=50&what=${encodeURIComponent(query)}&what_or=education+nonprofit+edtech+learning&content-type=application/json`)
        .then(r => r.json()).catch(() => ({ results: [] }))
    );
    const adzunaResults = await Promise.all(adzunaPages);
    const adzunaJobs = adzunaResults.flatMap(data =>
      (data.results || []).map(j => ({
        id: j.id,
        title: j.title,
        org: j.company?.display_name || 'Unknown',
        location: j.location?.display_name || 'Remote',
        url: j.redirect_url,
        description: j.description?.slice(0, 300) || '',
        posted: j.created,
        salary: j.salary_min ? `$${Math.round(j.salary_min/1000)}k–$${Math.round(j.salary_max/1000)}k` : 'Competitive',
        source: 'Adzuna',
      }))
    );

    // ── 2. RSS Feeds ─────────────────────────────────────────────────────────
    const RSS_FEEDS = [
      { url: `https://www.idealist.org/en/jobs/rss?q=${encodeURIComponent(query)}`, source: 'Idealist' },
      { url: 'https://jobs.edsurge.com/jobs.rss', source: 'EdSurge' },
      { url: `https://jobs.philanthropy.com/rss/jobs/?q=${encodeURIComponent(query)}`, source: 'Chronicle' },
      { url: `https://edtechjobs.io/jobs/rss?search=${encodeURIComponent(query)}`, source: 'EdTechJobs' },
      { url: 'https://www.higheredjobs.com/rss/articleFeed.cfm', source: 'HigherEdJobs' },
    ];

    const rssResults = await Promise.allSettled(
      RSS_FEEDS.map(async ({ url, source }) => {
        const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
        const xml = await r.text();
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
        return items.slice(0, 25).map(m => {
          const get = (tag) => {
            const match = m[1].match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
            return match ? (match[1] || match[2] || '').trim() : '';
          };
          return {
            id: get('guid') || get('link'),
            title: get('title'),
            org: get('author') || source,
            location: 'See listing',
            url: get('link'),
            description: get('description').replace(/<[^>]+>/g, '').slice(0, 300),
            posted: get('pubDate'),
            salary: 'See listing',
            source,
          };
        });
      })
    );

    const rssJobs = rssResults
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .filter(j => j.title);

    // ── 3. Combine all sources ───────────────────────────────────────────────
    const allJobs = [...adzunaJobs, ...rssJobs];

    // ── 4. Claude filter & enrich ────────────────────────────────────────────
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: `You are filtering job listings for an EdTech and nonprofit PM job board.
Given a list of jobs, return the ones relevant to product management in EdTech or nonprofit sectors.
Be inclusive — keep any PM, product, or product-adjacent roles at education or mission-driven orgs.
For each relevant job add: type ("edtech" or "nonprofit"), tags (array of 3 short strings), logo (2 letter abbreviation of org name).
Return a JSON array of up to 50 of the most relevant jobs. Raw JSON only, no markdown, no backticks.`,
        messages: [{
          role: 'user',
          content: `Filter these ${allJobs.length} jobs for EdTech/nonprofit PM relevance. User searched: "${query}"\n\nJobs:\n${JSON.stringify(allJobs.slice(0, 100), null, 2)}`
        }]
      })
    });

    const claudeData = await claudeRes.json();
    const claudeText = claudeData.content?.map(c => c.text || '').join('') || '[]';
    const filtered = JSON.parse(claudeText.replace(/```json|```/g, '').trim());

    res.status(200).json({ jobs: filtered, total: filtered.length, raw: allJobs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
