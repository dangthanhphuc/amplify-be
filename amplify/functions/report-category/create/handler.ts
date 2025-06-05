import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/createReportCategoryFnc";
import { randomUUID } from "crypto";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const requestBody = JSON.parse(event.body || '{}');
    console.log("Received request body:", JSON.stringify(requestBody, null, 2));
    const { name, severity } = requestBody;
    
    if (!name || !severity) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing required field: name, severity",
            }),
        };
    }

    const amplifyClient = await getAmplifyClient(env);

    try {
        const result = await amplifyClient.models.ReportCategories.create({
            id: randomUUID().toString(),
            name: name,
            severity: severity,
        });
        
        console.log("Report Category result:", JSON.stringify(result, null, 2));

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Report category created successfully",
                data: result.data,
            })
        };

    } catch (error) {
        console.error("Error creating report category:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error creating report category",
                error: error,
            }),
        };
    }
};
