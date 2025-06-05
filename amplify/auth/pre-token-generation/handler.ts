import type { PreTokenGenerationTriggerHandler } from "aws-lambda";

export const handler: PreTokenGenerationTriggerHandler = async (event) => {

    console.log(JSON.stringify(event.request.userAttributes))

  event.response = {
    claimsOverrideDetails: {
      groupOverrideDetails: {
        // This will add the user to the cognito group "amplify_group_1" 
        groupsToOverride: ["amplify_group_1"],
      },
      claimsToAddOrOverride: {
        // This will add the custom claim "amplfy_attribute" to the id token
        amplfy_attribute: "amplify_gen_2",
      },
    },
  };
  return event;
};