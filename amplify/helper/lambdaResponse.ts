import {
  LambdaIntegration,
} from "aws-cdk-lib/aws-apigateway";

export function createLambdaIntegrationResponse(lambda: any) {
  return new LambdaIntegration(lambda, {
    proxy: true,
    // integrationResponses: [
    //   {
    //     statusCode: '200',
    //       responseParameters: {
    //         'method.response.header.Access-Control-Allow-Origin': "'*'",
    //         'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
    //         'method.response.header.Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
    //       }
    //   }
    // ]
  });
}
