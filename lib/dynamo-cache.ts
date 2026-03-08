/**
 * DynamoDB Cache Adapter
 *
 * Mirrors the SmartCache interface (MongoDB) but stores data in DynamoDB.
 * Used when DATABASE_MODE=dynamodb (AWS deployment).
 * On localhost, this file is never called — SmartCache uses MongoDB.
 *
 * Tables (created in AWS console):
 *   GitGo-RepoAnalysis  — partition key: repoUrl (String)
 *   GitGo-RouteCache    — partition key: repoUrl (String), sort key: route (String)
 *
 * TTL: Both tables use a `ttl` attribute (Unix epoch seconds) for auto-expiry.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const TTL_7_DAYS_SECONDS = 7 * 24 * 60 * 60;

const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
        convertClassInstanceToMap: true,
    }
});

const ANALYSIS_TABLE = process.env.AWS_DYNAMODB_ANALYSIS || "GitGo-RepoAnalysis";
const ROUTE_TABLE = process.env.AWS_DYNAMODB_ROUTE_CACHE || "GitGo-RouteCache";

// ─── Repo Analysis Cache ──────────────────────────────────────────────────────

export async function dynamoGetRepoAnalysis(repoUrl: string): Promise<any | null> {
    try {
        const result = await docClient.send(
            new GetCommand({
                TableName: ANALYSIS_TABLE,
                Key: { repoUrl },
            })
        );

        if (!result.Item) {
            console.log(`[DynamoCache] MISS for repo: ${repoUrl}`);
            return null;
        }

        console.log(`[DynamoCache] HIT for repo: ${repoUrl}`);
        return result.Item;
    } catch (err: any) {
        console.error("[DynamoCache] getRepoAnalysis error:", err?.message);
        return null;
    }
}

export async function dynamoSaveRepoAnalysis(repoUrl: string, data: any): Promise<void> {
    try {
        const ttlEpoch = Math.floor(Date.now() / 1000) + TTL_7_DAYS_SECONDS;
        await docClient.send(
            new PutCommand({
                TableName: ANALYSIS_TABLE,
                Item: {
                    repoUrl,
                    ...data,
                    ttl: ttlEpoch,
                    cachedAt: new Date().toISOString(),
                },
            })
        );
        console.log(`[DynamoCache] Saved repo analysis for: ${repoUrl}`);
    } catch (err: any) {
        console.error("[DynamoCache] saveRepoAnalysis error:", err?.message);
    }
}

// ─── Route Cache ──────────────────────────────────────────────────────────────

export async function dynamoGetRouteAnalysis(
    repoUrl: string,
    route: string
): Promise<{ flowVisualization: string; executionTrace: string } | null> {
    try {
        const result = await docClient.send(
            new GetCommand({
                TableName: ROUTE_TABLE,
                Key: { repoUrl, route },
            })
        );

        if (!result.Item) {
            console.log(`[DynamoCache] Route MISS: ${route}`);
            return null;
        }

        console.log(`[DynamoCache] Route HIT: ${route}`);
        return {
            flowVisualization: result.Item.flowVisualization,
            executionTrace: result.Item.executionTrace,
        };
    } catch (err: any) {
        console.error("[DynamoCache] getRouteAnalysis error:", err?.message);
        return null;
    }
}

export async function dynamoSaveRouteAnalysis(
    repoUrl: string,
    route: string,
    data: { flowVisualization: string; executionTrace: string }
): Promise<void> {
    try {
        const ttlEpoch = Math.floor(Date.now() / 1000) + TTL_7_DAYS_SECONDS;
        await docClient.send(
            new PutCommand({
                TableName: ROUTE_TABLE,
                Item: {
                    repoUrl,
                    route,
                    flowVisualization: data.flowVisualization,
                    executionTrace: data.executionTrace,
                    ttl: ttlEpoch,
                    cachedAt: new Date().toISOString(),
                },
            })
        );
        console.log(`[DynamoCache] Saved route analysis: ${route}`);
    } catch (err: any) {
        console.error("[DynamoCache] saveRouteAnalysis error:", err?.message);
    }
}
