import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/updateReportCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event: any) => {
  const { categoryId } = event.pathParameters || {};
  const requestBody = JSON.parse(event.body || "{}");

  if (!categoryId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing required parameter: categoryId",
      }),
    };
  }

  const { name, severity } = requestBody;

  if (!name && !severity) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "At least one field (name or description) is required for update",
      }),
    };
  }

  const amplifyClient = await getAmplifyClient(env);

  try {
    const reportCategoryExits = await amplifyClient.models.ReportCategories.get(
      { id: categoryId }
    );

    if (!reportCategoryExits.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Report category not found",
        }),
      };
    }

    const updateData: any = {
      id: categoryId,
    };

    if (name) updateData.name = name;
    if (severity) updateData.severity = severity;

    const result =
      await amplifyClient.models.ReportCategories.update(updateData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Report category updated successfully",
        data: result.data,
      }),
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
