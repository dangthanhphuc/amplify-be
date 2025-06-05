import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/getReportCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const { id } = event.pathParameters || {};
    
    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing required parameter: id",
            }),
        };
    }

    const amplifyClient = await getAmplifyClient(env);

    try {
        const result = await amplifyClient.models.ReportCategories.get({ id });
        
        if (!result.data) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Report category not found",
                }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Report category retrieved successfully",
                data: result.data,
            })
        };

    } catch (error) {
        console.error("Error getting report category:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error getting report category",
                error: error,
            }),
        };
    }
};
