import { AdminAddUserToGroupCommand, CognitoIdentityProviderClient, GlobalSignOutCommand } from "@aws-sdk/client-cognito-identity-provider";

export async function signoutService(cognitoClient : CognitoIdentityProviderClient, accessToken: string) {
    try {
        await cognitoClient.send(new GlobalSignOutCommand({
            AccessToken: accessToken
        }));

        return {
            success: true,
            body: JSON.stringify({
                message: "Signout function executed successfully",
            }),
        }
        
    } catch (error : any) {
        console.error("Error during sign out:", error);
        throw error;
    }
}

export async function addUserToGroupService(cognitoClient : CognitoIdentityProviderClient, groupName: string, userPoolId: string, userName: string) {
    try {

        await cognitoClient.send(new AdminAddUserToGroupCommand({
            GroupName: groupName,
            UserPoolId: userPoolId,
            Username: userName,
        }));

        return {
            success: true,
            body: JSON.stringify({
                message: "User added to group successfully",
            }),
        };
    } catch (error : any) {
        console.error("Error adding user to group:", error);
        throw error;
    }
}