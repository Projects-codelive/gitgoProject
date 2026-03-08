/**
 * TEST: Groq API (llama-3.3-70b-versatile)
 *
 * Uses the EXACT same architecture analysis prompt as lib/llm.ts.
 * Run with: npx tsx scripts/test-groq.ts
 *
 * Requires: GROQ_API_KEY in .env (already set)
 */

// Load .env using Node.js 20+ built-in (no dotenv package needed)
try { (process as any).loadEnvFile(".env"); } catch { }

// ─── Prompt (same as analyzeArchitecture in lib/llm.ts) ───────────────────────
const SYSTEM_PROMPT = `You are a senior software architect specializing in analyzing codebases and creating accurate visual representations of their architecture.

Your job is to analyze a GitHub repository and produce a clear, accurate architecture diagram based on what you actually find in the code.

CRITICAL RULES:
- NEVER hallucinate files, services, or infrastructure that don't exist
- Only describe what is evident from the provided code and file structure
- Prefer clarity over completeness
- Be honest about what you don't know

Return ONLY valid JSON — no markdown, no commentary, no explanation outside the JSON.`;

const USER_PROMPT = `Analyze this sample Next.js repository and return a JSON architecture diagram.

## Project File Tree
\`\`\`
app/
  page.tsx
  layout.tsx
  api/
    auth/[...nextauth]/route.ts
    analyze/route.ts
    recommendations/route.ts
lib/
  mongodb.ts
  github.ts
  llm.ts
models/
  User.ts
  RepositoryAnalysis.ts
\`\`\`

## Tech Stack
Frontend: React 19, Next.js 16, TailwindCSS
Backend: Node.js, MongoDB, Mongoose, NextAuth

Return ONLY this JSON structure:
{
  "overallFlow": "paragraph describing the architecture",
  "architectureJson": {
    "nodes": [ { "id": "string", "label": "string", "type": "frontend|backend|service|database|external" } ],
    "edges": [ { "from": "string", "to": "string", "label": "string" } ],
    "notes": ["string"]
  }
}`;

// ─── Groq API Call ─────────────────────────────────────────────────────────────
async function testGroq() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("❌ GROQ_API_KEY not found in .env");
        process.exit(1);
    }

    console.log("🔵 Testing Groq (llama-3.3-70b-versatile)...\n");
    const start = Date.now();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 2000,
            temperature: 0.2,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: USER_PROMPT },
            ],
        }),
    });

    const elapsed = Date.now() - start;

    if (!response.ok) {
        const err = await response.text();
        console.error(`❌ Groq API error (${response.status}):`, err);
        process.exit(1);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content ?? "";
    const tokenUsage = result.usage;

    // Try to parse the JSON response
    let parsed: any = null;
    try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
        parsed = JSON.parse(jsonStr);
    } catch {
        console.warn("⚠️  Response is not valid JSON (checking raw text anyway)");
    }

    // ─── Results ───────────────────────────────────────────────────────────────
    console.log("═".repeat(60));
    console.log("✅ GROQ RESULTS");
    console.log("═".repeat(60));
    console.log(`⏱  Latency       : ${elapsed}ms`);
    console.log(`📊 Tokens Used   : ${tokenUsage?.total_tokens ?? "N/A"} (prompt: ${tokenUsage?.prompt_tokens}, completion: ${tokenUsage?.completion_tokens})`);
    console.log(`📝 Response size : ${content.length} chars`);
    console.log(`✅ Valid JSON    : ${parsed !== null}`);

    if (parsed) {
        console.log(`\n📐 Architecture nodes   : ${parsed.architectureJson?.nodes?.length ?? 0}`);
        console.log(`🔗 Architecture edges   : ${parsed.architectureJson?.edges?.length ?? 0}`);
        console.log(`📝 Notes count          : ${parsed.architectureJson?.notes?.length ?? 0}`);
        console.log(`\n📖 Overall Flow Preview :\n${parsed.overallFlow?.slice(0, 300)}...`);
        console.log("\n🗂  Nodes:");
        parsed.architectureJson?.nodes?.slice(0, 5).forEach((n: any) =>
            console.log(`   [${n.type}] ${n.label}`)
        );
    } else {
        console.log("\n📄 Raw Response (first 500 chars):");
        console.log(content.slice(0, 500));
    }
    console.log("═".repeat(60));
}

testGroq().catch((err) => {
    console.error("❌ Unexpected error:", err.message);
    process.exit(1);
});
