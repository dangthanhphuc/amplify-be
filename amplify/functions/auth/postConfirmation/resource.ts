import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { getRdsClient, getSecretManagerClient } from "../../../utils/clients";
import { User } from "../../../interfaces/user";
import { getSecret } from "../../../services/secretManagerService";
import { saveUserToRds } from "../../../services/rdsService";
import { env } from "$amplify/env/postConfirmationFnc";
import { stat } from "fs";

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log("PostConfirmation event:", event);
  try {
    // const requestBody = JSON.parse(event);
    // const { email, password, name } = requestBody;
    const rdsClient = getRdsClient();
    // const user: User = {
    //   id: resultSignUp.UserSub,
    //   email: email,
    //   password: password,
    //   name: name,
    //   displayName: "",
    //   profileImage: "",
    //   description: "",
    //   roleId: 1,
    // };
    // const secretManagerClient = getSecretManagerClient();
    // const secretValue = await getSecret(
    //   secretManagerClient,
    //   "prod/RDS_SECRET_ARN"
    // );
    
    // if(secretValue.ARN)
    //   await saveUserToRds(rdsClient, env.RDS_ARN, secretValue.ARN, user);
    // else 
    //   console.log("Secret value is null or undefined");
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "User post confirmation processed successfully",
            userId: event,
        }),
    }
  } catch (error) {
    console.error("Error processing post confirmation event:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing post confirmation event",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
