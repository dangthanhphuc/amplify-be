import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../data/resource";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";

let cachedClient : any = null;
let isConfigured = false;

export async function getAmplifyClient(env : any) {

    // console.info("Fetching Amplify Data Client configuration...");
    // console.info("Environment AMPLIFY_DATA_DEFAULT_NAME:", env.AMPLIFY_DATA_DEFAULT_NAME);
    // console.info("Cached Client:", cachedClient);
    // console.info("Is Configured:", isConfigured);

    if( cachedClient && isConfigured) {
        return cachedClient;
    }

    try {
   const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
    
    if (!isConfigured) {
      Amplify.configure(resourceConfig, libraryOptions);
      isConfigured = true;
    }
    
    cachedClient = generateClient<Schema>();
    
    console.log("Amplify client initialized successfully");
    return cachedClient;
    
  } catch (error : any) {
    console.error("Error initializing Amplify client:", error);
    throw new Error(`Failed to initialize Amplify client: ${error.message}`);
  }
}