import { defineStorage } from "@aws-amplify/backend";

export const storageForProject = defineStorage({
    name: "storageForProject",
    access: (allow) => ({
        'profile-pictures/{entity_id}/*': [
            allow.guest.to(['read']),
            allow.authenticated.to(['read']),
            allow.entity("identity").to(['read', 'write', 'delete'])
        ],
        'public-images/*': [
            allow.guest.to(['read']),
            allow.authenticated.to(['read']),
        ]
    }),
    
});