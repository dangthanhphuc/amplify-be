import { defineAuth, secret } from '@aws-amplify/backend';

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
        scopes: ['email', 'profile'],
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
        'http://localhost:3000',
        'https://5d6vfgww47.execute-api.us-east-1.amazonaws.com/dev/auth/getTokenByCode', // Production
      ],
      logoutUrls: ['http://localhost:3000/logout']
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
});
