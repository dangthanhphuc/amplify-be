import { defineAuth, secret } from '@aws-amplify/backend';
import { postConfirmationFnc } from '../functions/auth/postConfirmation/resources';
import { preTokenGeneration } from './pre-token-generation/resource';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        attributeMapping: {
          email: 'email',
          fullname: 'name',
          profilePicture: 'picture',
        },
        scopes: ['email', 'profile', 'openid'],
      },
      facebook: {
        clientId: secret('FACEBOOK_CLIENT_ID'),
        clientSecret: secret('FACEBOOK_CLIENT_SECRET'),
        attributeMapping: {
          email: 'email',
          fullname: 'name',
        },
        scopes: ['email', 'public_profile'],
        
      },
      callbackUrls: [
        'http://localhost:3000/auth', 
        'https://trangvang.ai/auth',
        'https://www.trangvang.ai/auth'
      ],
      logoutUrls: [
        'http://localhost:3000/logout',
        'https://trangvang.ai/logout',
        'https://www.trangvang.ai/logout'
      ]
    }
  },
  userAttributes: {
    fullname : {
      mutable: true,
      required: true
    },
    profilePicture: {
      mutable: true,
      required: false
    },
    "custom:display_name": {
      dataType: 'String',
      mutable: true,
      minLen: 1,
      maxLen: 50,
    },
    "custom:desc": {
      dataType: 'String',
      mutable: true,
      minLen: 1,
      maxLen: 256,
    }
  },
  accountRecovery: 'EMAIL_ONLY',
  groups: ["USERS", "EXPERTS", "ADMINS"],
  triggers: { 
    postConfirmation: postConfirmationFnc,
    preTokenGeneration: preTokenGeneration
  },
  access: (allow) => [
    allow.resource(postConfirmationFnc).to(["addUserToGroup"])
  ]
});
