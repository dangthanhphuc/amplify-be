import { defineFunction } from '@aws-amplify/backend';

export const createAiCategoryFnc = defineFunction({
  name: 'createAiCategoryFnc',
  timeoutSeconds: 30,
});
