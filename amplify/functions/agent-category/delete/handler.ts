import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/deleteAgentCategoryFnc";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const { categoryId } = event.pathParameters || {};

    if (!categoryId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Agent category ID is required",
        }),
      };
    }

    const amplifyClient = await getAmplifyClient(env);

    const agentCategoryExist = await amplifyClient.models.AgentCategories.get({
      id: categoryId,
    });

    if (!agentCategoryExist.data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Agent category not found",
        }),
      };
    }

    // Delete the agent category
    const result = await amplifyClient.models.AgentCategories.delete({
      id: categoryId,
    });
    console.log("Delete result:", result);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Agent category deleted successfully",
        categoryId: categoryId,
      }),
    };
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Agent category not found",
        }),
      };
    }

    console.error("Error deleting agent category:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};
