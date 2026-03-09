import Recommendation from "@/models/Recommendation";
import { ddbDocClient } from "@/lib/dynamodb";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export class RecommendationRepository {
    static async save(data: any): Promise<void> {
        const isAwsMode = process.env.DATABASE_MODE === 'dynamodb';

        if (isAwsMode) {
            console.log(`[DB Layer] Using AWS DynamoDB to save recommendation`);
            // Fallback to a timestamp-based ID if userId is missing (like test profiles)
            const primaryId = data.userId ? String(data.userId) : `test-${Date.now()}`;

            const command = new PutCommand({
                TableName: process.env.AWS_DYNAMODB_RECS || "GitGo-Recommendations",
                Item: {
                    ...data,
                    userId: primaryId,          // Partition Key
                    createdAt: new Date().toISOString() // Sort Key
                }
            });

            try {
                await ddbDocClient.send(command);
            } catch (err) {
                console.error("[DB Layer] DynamoDB Error:", err);
                throw err;
            }
        } else {
            console.log(`[DB Layer] Using Local MongoDB to save recommendation`);
            try {
                await Recommendation.create(data);
            } catch (err) {
                console.error("[DB Layer] MongoDB Error:", err);
                throw err;
            }
        }
    }

    static async getLatest(userId: string, isTestProfile: boolean = false): Promise<any | null> {
        const isAwsMode = process.env.DATABASE_MODE === 'dynamodb';

        if (isAwsMode) {
            try {
                const command = new QueryCommand({
                    TableName: process.env.AWS_DYNAMODB_RECS || "GitGo-Recommendations",
                    KeyConditionExpression: "userId = :userId",
                    ExpressionAttributeValues: {
                        ":userId": userId
                    },
                    ScanIndexForward: false, // Descending by sort key (createdAt)
                    Limit: 1
                });
                const response = await ddbDocClient.send(command);
                return response.Items && response.Items.length > 0 ? response.Items[0] : null;
            } catch (err) {
                console.error("[DB Layer] DynamoDB GetLatest Error:", err);
                return null;
            }
        } else {
            try {
                const filter = isTestProfile ? { isTestProfile: true, testUsername: userId } : { userId };
                const doc = await Recommendation.findOne(filter).sort({ generatedAt: -1 }).lean();
                return doc;
            } catch (err) {
                console.error("[DB Layer] MongoDB GetLatest Error:", err);
                return null;
            }
        }
    }
}
