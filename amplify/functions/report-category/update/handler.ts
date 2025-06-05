import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateReportCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
    const { id } = event.pathParameters || {};
    const requestBody = JSON.parse(event.body || '{}');
    
    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing required parameter: id",
            }),
        };
    }

    const { name, description } = requestBody;
    
    if (!name && !description) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "At least one field (name or description) is required for update",
            }),
        };
    }

    const amplifyClient = await getAmplifyClient(env);

    try {
        const updateData: any = {
            id: id,
            updated_at: new Date().toISOString().replace(/\.\d{3}Z$/, ""),
        };

        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;

        const result = await amplifyClient.models.ReportCategories.update(updateData);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Report category updated successfully",
                data: result.data,
            })
        };

    } catch (error) {
        console.error("Error updating report category:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error updating report category",
                error: error,
            }),
        };
    }
};
