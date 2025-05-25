
import type { APIGatewayProxyHandler } from "aws-lambda";
import { env } from "$amplify/env/signUpPostMethodFnc";
import { SignUpRequest } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { getCognitoClient, getRdsClient, getSecretManagerClient } from "../../../utils/clients";
import { addUserToGroupService } from "../../../services/cognitoService";
import { saveUserToRds } from "../../../services/rdsService";
import { User } from "../../../interfaces/user";
import { secret } from '@aws-amplify/backend';
import { getSecret } from "../../../services/secretManagerService";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";


export const handler: APIGatewayProxyHandler = async (event) => {
  try { 
    if (event.body == null) {
        return {
            statusCode: 404,
            body: JSON.stringify({  
                message: "No request body", 
            }),
        };
    }

    const cognitoClient = getCognitoClient();

    const requestBody = JSON.parse(event.body);
    const { email, password, name } = requestBody;

    const params : SignUpRequest = {
        ClientId: env.USER_POOL_CLIENT_ID,
        Username: email,  
        Password: password,
        UserAttributes: [
            {
                Name: "name",
                Value: name
            }
        ]
    };

    // 1. Signup user
    const resultSignUp = await cognitoClient.send(new SignUpCommand(params));
    console.log("User signed up successfully:", resultSignUp);

    // 2. Add user to group
    const resultAddUserToGroup = await addUserToGroupService(cognitoClient, "USERS", env.USER_POOL_ID, email);
    console.log("User added to group successfully:", resultAddUserToGroup);

    // 3. Save user to RDS
    const rdsClient = getRdsClient();
    const user : User = {
      id: String(resultSignUp.UserSub),
      email: email,
      password: password,
      name: name,
      displayName: "",
      profileImage: "",
      description: "",
      roleId: 1
    };
    const secretManagerClient = getSecretManagerClient();
    const secretValue = await getSecret(
      secretManagerClient,
      "prod/RDS_SECRET_ARN"
    );
    
    console.log("Secret value:", secretValue);
    if(secretValue.ARN)
      await saveUserToRds(rdsClient, env.RDS_ARN, secretValue.ARN, user);
    else 
      console.log("Secret value is null or undefined");

    return {
      statusCode: 200,
      body: JSON.stringify({
        resultSignUp
      })
    };
  } catch (error : any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error signing up",
        error: error.message,
      }),
    };
  }
};
