import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/listReportCategoriesFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const amplifyClient = await getAmplifyClient(env);

    try {
        const result = await amplifyClient.models.ReportCategories.list();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Report categories retrieved successfully",
                data: result.data,
                nextToken: result.nextToken,
            })
        };

    } catch (error) {
        console.error("Error listing report categories:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error listing report categories",
                error: error,
            }),
        };
    }
};
