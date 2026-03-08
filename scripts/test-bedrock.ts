/**
 * TEST: Amazon Bedrock (Claude 3.5 Haiku)
 *
 * Uses the EXACT same architecture analysis prompt as lib/llm.ts.
 * Run with: npx tsx scripts/test-bedrock.ts
 *
 * Requires:
 *   AWS_ACCESS_KEY_ID     in .env  (get from IAM console)
 *   AWS_SECRET_ACCESS_KEY in .env  (get from IAM console)
 *   AWS_REGION            in .env  (already set: us-east-1)
 *
 * Also requires Claude 3.5 Haiku to be enabled in Bedrock Model Access.
 * (Amazon Bedrock → Model access → Anthropic → Claude 3.5 Haiku → Request access)
 */

// Load .env using Node.js 20+ built-in (no dotenv package needed)
try { (process as any).loadEnvFile(".env"); } catch { }

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

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

// ─── Bedrock API Call ──────────────────────────────────────────────────────────
async function testBedrock() {
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || "us-east-1";

    if (!accessKey || !secretKey) {
        console.error("❌ AWS credentials not found in .env");
        console.error("   Add these to your .env file:");
        console.error("   AWS_ACCESS_KEY_ID=your_access_key");
        console.error("   AWS_SECRET_ACCESS_KEY=your_secret_key");
        console.error("");
        console.error("   See the credential setup guide for how to get them.");
        process.exit(1);
    }

    console.log("🟠 Testing Amazon Bedrock (Claude 3.5 Haiku)...");
    console.log(`   Region: ${region}`);
    console.log(`   Model : anthropic.claude-3-5-haiku-20241022-v1:0\n`);

    const client = new BedrockRuntimeClient({
        region,
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
    });

    const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: USER_PROMPT }],
    };

    const start = Date.now();

    let response: any;
    try {
        const command = new InvokeModelCommand({
            modelId: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
            body: JSON.stringify(payload),
            contentType: "application/json",
            accept: "application/json",
        });
        response = await client.send(command);
    } catch (err: any) {
        const elapsed = Date.now() - start;
        console.error(`❌ Bedrock call FAILED after ${elapsed}ms`);
        console.error(`   Error type   : ${err?.name}`);
        console.error(`   Error message: ${err?.message}`);

        if (err?.name === "AccessDeniedException") {
            console.error("\n   ⚠️  Fix: Go to Amazon Bedrock → Model access → Enable Claude 3.5 Haiku");
        } else if (err?.name === "UnrecognizedClientException") {
            console.error("\n   ⚠️  Fix: Check that AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct");
        } else if (err?.name === "ValidationException") {
            console.error("\n   ⚠️  Fix: Check that model ID is correct and available in your region");
        }
        process.exit(1);
    }

    const elapsed = Date.now() - start;
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content: string = responseBody?.content?.[0]?.text ?? "";
    const tokenUsage = responseBody?.usage;

    // Try to parse JSON response
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
    console.log("✅ BEDROCK (CLAUDE 3.5 HAIKU) RESULTS");
    console.log("═".repeat(60));
    console.log(`⏱  Latency       : ${elapsed}ms`);
    console.log(`📊 Tokens Used   : input=${tokenUsage?.input_tokens ?? "N/A"}, output=${tokenUsage?.output_tokens ?? "N/A"}`);
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
    console.log("\n✅ Bedrock integration is WORKING. Safe to proceed with AWS deployment!");
}

testBedrock().catch((err) => {
    console.error("❌ Unexpected error:", err.message);
    process.exit(1);
});
