import { CognitoIdentityServiceProvider } from "aws-sdk";

export async function signoutService(cognitoClient : CognitoIdentityServiceProvider, accessToken: string) {
    try {
        await cognitoClient.globalSignOut({
            AccessToken: accessToken
        }).promise();

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

export async function addUserToGroupService(cognitoClient : CognitoIdentityServiceProvider, groupName: string, userPoolId: string, userName: string) {
    try {

        await cognitoClient.adminAddUserToGroup({
            GroupName: groupName,
            UserPoolId: userPoolId,
            Username: userName,
        }).promise();

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