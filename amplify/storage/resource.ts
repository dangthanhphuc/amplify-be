import { defineStorage } from "@aws-amplify/backend";

export const storageForProject = defineStorage({
    name: "storageForProject",
    access: (allow) => ({
        'profile-pictures/{entity_id}/*': [
            allow.guest.to(['read']),
            allow.authenticated.to(['read']),
            allow.entity("identity").to(['read', 'write', 'delete']),
            allow.groups(["USERS"]).to(['read', 'write', 'delete']),
        ],
        'knowledge-base/{entity_id}/*': [
            allow.entity("identity").to(['read', 'write', 'delete']),
        ],
        'public-images/*': [
            allow.guest.to(['read']),
            allow.authenticated.to(['read']),
            allow.groups(["USERS"]).to(['read']),
        ]
    }),
}); 

 