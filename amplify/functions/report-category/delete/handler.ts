import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/deleteReportCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const { categoryId } = event.pathParameters || {};
    
    if (!categoryId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing required parameter: categoryId",
            }),
        };
    }

    const amplifyClient = await getAmplifyClient(env);

    try {
        const result = await amplifyClient.models.ReportCategories.delete({ id: categoryId });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Report category deleted successfully",
                data: result.data,
            })
        };

    } catch (error) {
        console.error("Error deleting report category:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error deleting report category",
                error: error,
            }),
        };
    }
};
