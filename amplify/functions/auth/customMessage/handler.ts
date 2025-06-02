import type { CustomMessageTriggerHandler } from "aws-lambda";
import { getAmplifyClient } from "../../../utils/clientUtil";
import { env } from "$amplify/env/customMessageFnc";

export const handler : CustomMessageTriggerHandler  = async (event) => {
    console.log(" event:", event);

    // Clients
    const amplifyClient = await getAmplifyClient(env);

    try {
        // Trigger event 
        if (event.triggerSource === "CustomMessage_UpdateUserAttribute") {
            // Custom message for updating user attributes
            console.log("CustomMessage_UpdateUserAttribute event:", event);
        }

    } catch (error) {
        console.error("Error in custom message handler:", error);
    }
    return event;
}