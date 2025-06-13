import type { PreTokenGenerationTriggerHandler } from "aws-lambda";
import { env } from "$amplify/env/pre-token-generation";
import { getAmplifyClient } from "../../utils/clientUtil";
import { getCognitoClient } from "../../utils/clients";
import { addUserToGroup } from "../../services/cognitoService";
import { Schema } from "../../data/resource";
import { generateClient } from "aws-amplify/data";

export const handler: PreTokenGenerationTriggerHandler = async (event) => {
  console.log("Pre Token Generation Trigger Event: ", JSON.stringify(event, null, 2));
  console.log("User Attributes:", JSON.stringify(event.request.userAttributes));

  try {
    // Clients
    const s = generateClient<Schema>();
    const amplifyClient = await getAmplifyClient(env);
    const cognitoIdentityProviderClient = getCognitoClient();

    const { sub, name, email, email_verified } = event.request.userAttributes;
    
    // Check if user already exists in RDS
    const existingUser = await amplifyClient.models.Users.get({ id: sub });
    
    if (!existingUser.data) {
      console.log(`Creating new user in RDS for sub: ${sub}`);
      
      // Create user in RDS for both regular and federated sign-ins
      await amplifyClient.models.Users.create({
        id: sub,
        email: email,
        name: name || email, // Fallback to email if name not provided
        display_name: name || email?.split('@')[0] || 'User',
        profile_image: "public-images/avatar.jpg",
        description: "",
        role_groups: "USERS", // Default group for all users
      });

      // Add user to USERS group if not already in a group
      try {
        await addUserToGroup(
          cognitoIdentityProviderClient,
          "USERS",
          event.userPoolId,
          event.userName
        );
        console.log(`User ${event.userName} added to USERS group`);
      } catch (groupError) {
        console.log("User might already be in group or group assignment failed:", groupError);
      }

      console.log("User created successfully in RDS");
    } else {
      console.log(`User ${sub} already exists in RDS`);
    }

  } catch (error) {
    console.error("Error in PreTokenGeneration handler:", error);
    // Don't throw error to avoid blocking authentication
  }

  // Set response for token claims
  event.response = {
    claimsOverrideDetails: {
      groupOverrideDetails: {
        groupsToOverride: ["USERS"], // Add user to USERS group in token
      },
      claimsToAddOrOverride: {
        app_metadata: "amplify_v2",
      },
    },
  };
  
  return event;
};  