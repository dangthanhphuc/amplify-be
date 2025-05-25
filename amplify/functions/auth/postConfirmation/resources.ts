import type { PostConfirmationTriggerEvent, PostConfirmationTriggerHandler } from "aws-lambda";
// import { User } from "../../../interfaces/user";

export const handler: PostConfirmationTriggerHandler = async (event) => {
  
  
    console.log("PostConfirmation event:", event);
    // const userAttributes = event.request.userAttributes;
    // const { id ,email, password, name } = userAttributes;
    // console.log("User Attributes:", userAttributes);
    // // const rdsClient = getRdsClient();
    // const user: User = {
    //   id: id,
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
    // console.log("Secret Value:", secretValue);
    // if(secretValue.ARN)
    //   await saveUserToRds(rdsClient, env.RDS_ARN, secretValue.ARN, user);
    // else 
    //   console.log("Secret value is null or undefined");

    return event;
  // } catch (error) {
  //   console.error("Error processing post confirmation event:", error);
  //   return {
  //     statusCode: 500,
  //     body: JSON.stringify({
  //       message: "Error processing post confirmation event",
  //       error: error instanceof Error ? error.message : "Unknown error",
  //     }),
  //   };
  // }
};
