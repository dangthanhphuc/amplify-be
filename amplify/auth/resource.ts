import { defineAuth, secret } from '@aws-amplify/backend';
import { postConfirmationFnc } from '../functions/auth/postConfirmation/handler';

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
        'http://localhost:3000/callback', // Local development for web
        'https://main.d2zn9ox6azoj1b.amplifyapp.com/home',
        // 'https://merge-branch.d2zn9ox6azoj1b.amplifyapp.com/callback', // Local development for web
        // 'https://5d6vfgww47.execute-api.us-east-1.amazonaws.com/dev/auth/getTokenByCode', // Production

      ],
      logoutUrls: [
        'http://localhost:3000/auth',
        'https://main.d2zn9ox6azoj1b.amplifyapp.com/auth'
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
  // triggers: { 
  //   postConfirmation: postConfirmationFnc,
    
  // }
});
