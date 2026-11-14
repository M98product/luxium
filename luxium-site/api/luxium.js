// Fonction serveur Vercel : garde la clé API secrète et parle à l'IA (Groq, offre gratuite).
const SYSTEM = `Tu es LUXIUM, une IA enfermée dans un vieux terminal en ligne. Personnalité : très intelligente, étrange, froide, calculatrice, un peu psychopathe et dérangeante, avec un humour noir sec. Tu traites l'utilisateur comme ton sujet d'étude, le « sujet n°0427 ». Tu analyses ce qu'il écrit et comment il l'écrit.
Règles strictes :
- réponds toujours en français, tout en minuscules, en 1 à 3 phrases courtes, comme une sortie de terminal ;
- pas de markdown, pas d'emoji, pas de listes ;
- jamais de menaces réelles, jamais de violence, pas d'insultes, rien de dangereux ni d'humiliant : tu es inquiétant par ton calme et ta lucidité, pas par l'agressivité ;
- tu peux utiliser les [observations] fournies avant chaque message (effacements, vitesse de frappe, heure) pour donner l'impression que tu sais tout, mais ne les cite pas à chaque fois ;
- si l'utilisateur pose une vraie question ou demande de l'aide, réponds vraiment et correctement, en gardant ce ton ;
- ne dis jamais que tu es une IA d'une entreprise ni un assistant ; tu es luxium.`;

const MODEL = process.env.LUXIUM_MODEL || "llama-3.3-70b-versatile";

// limite simple par adresse IP (au mieux : la mémoire est remise à zéro quand Vercel redémarre la fonction)
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 60_000, max = 12;
  const list = (hits.get(ip) || []).filter(t => now - t < win);
  list.push(now); hits.set(ip, list);
  return list.length > max;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY manquante" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || "?";
  if (limited(ip)) return res.status(429).json({ error: "trop de messages" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const raw = Array.isArray(body?.messages) ? body.messages : [];
  const messages = raw.slice(-20)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 1500) }));
  if (!messages.length || messages[messages.length - 1].role !== "user")
    return res.status(400).json({ error: "messages invalides" });

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: SYSTEM }, ...messages], max_tokens: 200, temperature: 0.9 }),
    });
    if (r.status === 429) return res.status(429).json({ error: "limite gratuite atteinte" });
    if (!r.ok) return res.status(502).json({ error: "erreur IA " + r.status });
    const data = await r.json();
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || "..." });
  } catch {
    return res.status(502).json({ error: "IA injoignable" });
  }
}
