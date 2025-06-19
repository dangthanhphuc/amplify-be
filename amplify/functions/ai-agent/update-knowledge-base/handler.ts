import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { getBedrockClient } from "../../../utils/clients";

export const handler : APIGatewayProxyHandlerV2 = async (event) => {
    
    // Clients
    const bedrockAgentClient = getBedrockClient();

    try {

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "This function is deprecated. Please use the new updateKnowledgeBaseFnc function instead."
            })
        }

    } catch(error : any) {
        console.error("Error in updateKnowledgeBase handler:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error",
                error: error.message || "An unexpected error occurred"
            })
        };
    }
}