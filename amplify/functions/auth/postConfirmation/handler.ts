import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { env } from "$amplify/env/postConfirmationFnc";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { getCognitoClient } from "../../../utils/clients";
import { addUserToGroup } from "../../../services/cognitoService";

export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log("PostConfirmation event:", event);

  // Clients
  const amplifyClient = await getAmplifyClient(env);
  const cognitoIdentityProviderClient = getCognitoClient();

  const { sub, name, email } = event.request.userAttributes;

  // Không lưu password vì Cognito đã handle authentication
  try {
    // 1. Create user in Amplify DataStore
    await amplifyClient.models.Users.create({
          id: sub,
          email: email, 
          name: name,
          display_name: name,
          profile_image: "public-images/avatar.jpg",
          description: "",
          role_id: 1,
      }); 

      // 2. Add user to group
    await addUserToGroup(
      cognitoIdentityProviderClient,
      "USERS",
      event.userPoolId,
      event.userName
    );

    // 3. Log the event
    console.log("User added to Amplify DataStore and Cognito group successfully");
    
  } catch (error) {
    console.error("Error in PostConfirmation handler:", error);

  }
  return event;
};
