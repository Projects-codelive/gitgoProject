/**
 * Amazon Bedrock Client — Claude 3.5 Haiku
 *
 * Drop-in replacement for Groq on AWS deployment.
 * Returns the exact same shape as Groq's chat.completions response:
 *   { choices: [{ message: { content: string } }] }
 *
 * Activated only when DATABASE_MODE=dynamodb (set in AWS .env).
 * On localhost (DATABASE_MODE=mongodb) this file is never called.
 *
 * Auth: Uses EC2 IAM Role automatically — no API keys needed.
 */

import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Claude 3.5 Haiku — cross-region inference profile (required by AWS since 2025)
// AWS no longer supports direct model IDs — must use inference profile with 'us.' prefix
const BEDROCK_MODEL_ID = "us.anthropic.claude-3-5-haiku-20241022-v1:0";
const ANTHROPIC_VERSION = "bedrock-2023-05-31";

// Single client — uses EC2 instance's IAM Role for auth (no keys needed)
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
});

export interface BedrockCallParams {
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    max_tokens?: number;
    temperature?: number;
}

/**
 * Calls Claude 3.5 Haiku via Amazon Bedrock and returns a Groq-compatible response shape.
 * System messages are extracted and passed as Bedrock's top-level `system` field.
 */
export async function callBedrock(params: BedrockCallParams): Promise<{
    choices: Array<{ message: { content: string } }>;
}> {
    // Separate system prompt from user messages (Bedrock API requirement)
    const systemMsg = params.messages.find((m) => m.role === "system");
    const userMessages = params.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const payload = {
        anthropic_version: ANTHROPIC_VERSION,
        max_tokens: params.max_tokens ?? 4096,
        temperature: params.temperature ?? 0.2,
        ...(systemMsg ? { system: systemMsg.content } : {}),
        messages: userMessages,
    };

    const command = new InvokeModelCommand({
        modelId: BEDROCK_MODEL_ID,
        body: JSON.stringify(payload),
        contentType: "application/json",
        accept: "application/json",
    });

    try {
        console.log(`[Bedrock] Invoking ${BEDROCK_MODEL_ID} (max_tokens=${payload.max_tokens})`);
        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        const content: string = responseBody?.content?.[0]?.text ?? "";
        console.log(`[Bedrock] Response received (${content.length} chars)`);

        // Return Groq-compatible shape so existing llm.ts call sites need no changes
        return {
            choices: [{ message: { content } }],
        };
    } catch (error: any) {
        console.error("[Bedrock] Error:", error?.message ?? error);
        throw new Error(`Bedrock call failed: ${error?.message ?? "Unknown error"}`);
    }
}
