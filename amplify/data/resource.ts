import { a, defineData, type ClientSchema } from "@aws-amplify/backend";
import { schema as generatedSqlSchema } from "./schema.sql";
import { postConfirmationFnc } from "../functions/auth/postConfirmation/resources";

import { onUploadS3Fnc } from "../functions/s3/onUpload/resources";
import { getUserInfoFnc } from "../functions/users/getUserInfo/resource";
import { listAiReviewsFnc } from "../functions/ai-reviews/list/resources";
import { createAiReviewFnc } from "../functions/ai-reviews/create/resources";
import { updateAiReviewFnc } from "../functions/ai-reviews/update/resources";
import { deleteAiReviewFnc } from "../functions/ai-reviews/delete/resources";
import { listUserLikesFnc } from "../functions/user-like/list/resources";
import { updateUserLikeFnc } from "../functions/user-like/update/resources";
import { createUserLikeFnc } from "../functions/user-like/create/resources";
import { deleteUserLikeFnc } from "../functions/user-like/delete/resources";
import { getAiReviewFnc } from "../functions/ai-reviews/get/resources";
import { getReportCategoryFnc } from "../functions/report-category/get/resources";
import { listReportCategoriesFnc } from "../functions/report-category/list/resources";
import { createReportCategoryFnc } from "../functions/report-category/create/resources";
import { updateReportCategoryFnc } from "../functions/report-category/update/resources";
import { deleteReportCategoryFnc } from "../functions/report-category/delete/resources";
import { getAgentCategoryFnc } from "../functions/agent-category/get/resources";
import { listAgentCategoriesFnc } from "../functions/agent-category/list/resources";
import { createAgentCategoryFnc } from "../functions/agent-category/create/resources";
import { updateAgentCategoryFnc } from "../functions/agent-category/update/resources";
import { deleteAgentCategoryFnc } from "../functions/agent-category/delete/resources";
import { generateClient } from "aws-amplify/data";
import { updateUserAttributesFnc } from "../functions/users/updateUserAttributes/resources";
import { updateAgentFnc } from "../functions/ai-agent/update/resources";
import { deleteAgentFnc } from "../functions/ai-agent/delete/resources";
import { listAiCategoriesFnc } from "../functions/ai-category/list/resources";
import { createAiCategoryFnc } from "../functions/ai-category/create/resources";
import { updateAiCategoryFnc } from "../functions/ai-category/update/resources";
import { deleteAiCategoryFnc } from "../functions/ai-category/delete/resources";
import { getAgentsFnc } from "../functions/ai-agent/get/resources";
import { listAgentVersionFnc } from "../functions/agent-version/list/resources";
import { createAgentVersionFnc } from "../functions/agent-version/create/resources";
import { updateAgentVersionFnc } from "../functions/agent-version/update/resources";
import { deleteAgentVersionFnc } from "../functions/agent-version/delete/resources";
import { chatWithAgentFnc } from "../functions/ai-agent/chatWithAgent/resources";
import { likeFnc } from "../functions/user-like/like/resources";
import { testFnc } from "../functions/tests/resources";
import { createAgentOutsideFnc } from "../functions/ai-agent/create_agent_outside/resources";


const sqlSchema = generatedSqlSchema
  .renameModels(() => [
    ["agent_categories", "AgentCategories"],
    ["ai_categories", "AiCategories"],
    ["ai_agents", "AiAgents"],
    ["ai_reviews", "AiReviews"],
    ["chats", "Chats"],
    ["report_categories", "ReportCategories"],
    ["agent_version", "AgentVersion"],
    ["user_likes", "UserLikes"],
    ["users", "Users"],
  ])
  .setRelationships((models) => [
    models.Users.relationships({
      creator: a.hasMany("AiAgents", "creator_id"),
      // chats: a.hasMany("Chats", "user_id"),
      // user_likes: a.hasMany("UserLikes", "user_id"),
      // ai_reviews: a.hasMany("AiReviews", "reporter_id"),
    }),
    models.AiAgents.relationships({
      created_agents: a.belongsTo("Users", "creator_id"),
      categories: a.hasMany("AiCategories", "ai_agent_id"),
      versions: a.hasMany("AgentVersion", "ai_agent_id"),
      chats: a.hasMany("Chats", "ai_agent_id"),
      // user_likes: a.hasMany("UserLikes", "ai_agent_id"),
      // ai_revirews: a.hasMany("AiReviews", "ai_agent_id"),
    }),
    models.AiCategories.relationships({
      agent: a.belongsTo("AiAgents", "ai_agent_id"),
      agent_category: a.belongsTo("AgentCategories", "agent_category_id"),
    }),
    models.AgentCategories.relationships({
      ai_categories: a.hasMany("AiCategories", "agent_category_id"),
    }),
    models.AgentVersion.relationships({
      ai_agent: a.belongsTo("AiAgents", "ai_agent_id"),
    }),
    // models.ReportCategories.relationships({
    //   ai_reviews: a.hasMany("AiReviews", "report_categories_id")
    // }),
    // models.AiReviews.relationships({
    //   report_category: a.belongsTo("ReportCategories", "report_categories_id"),
    //   agent: a.belongsTo("AiAgents", "ai_agent_id"),
    //   user: a.belongsTo("Users", "reporter_id"),
    // }),
    models.Chats.relationships({
      ai_agent: a.belongsTo("AiAgents", "ai_agent_id"),
      // user: a.belongsTo("Users", "user_id"),
    }),
    // models.UserLikes.relationships({
    //   // user: a.belongsTo("Users", "user_id"),
    //   ai_agent: a.belongsTo("AiAgents", "ai_agent_id"),
    // }),
  ])
  .authorization((allow) => [
    allow.resource(postConfirmationFnc),
    allow.resource(updateUserAttributesFnc),
    allow.resource(onUploadS3Fnc),
    allow.resource(getUserInfoFnc),
    allow.resource(chatWithAgentFnc),
    allow.resource(likeFnc),
    allow.resource(testFnc),

    // Ai Agents
    allow.resource(getAgentsFnc),
    allow.resource(createAgentOutsideFnc),
    allow.resource(updateAgentFnc),
    allow.resource(deleteAgentFnc),

    // Ai Category
    // allow.resource(getAiCategoryFnc),
    allow.resource(listAiCategoriesFnc),
    allow.resource(createAiCategoryFnc),
    allow.resource(updateAiCategoryFnc),
    allow.resource(deleteAiCategoryFnc),

    // Ai Reviews
    allow.resource(listAiReviewsFnc),
    allow.resource(getAiReviewFnc),
    allow.resource(createAiReviewFnc),
    allow.resource(updateAiReviewFnc),
    allow.resource(deleteAiReviewFnc),

    // User Likes
    // allow.resource(getUserLikeFnc),
    allow.resource(listUserLikesFnc),
    allow.resource(createUserLikeFnc),
    allow.resource(updateUserLikeFnc),
    allow.resource(deleteUserLikeFnc),

    // Report Category
    allow.resource(getReportCategoryFnc),
    allow.resource(listReportCategoriesFnc),
    allow.resource(createReportCategoryFnc),
    allow.resource(updateReportCategoryFnc),
    allow.resource(deleteReportCategoryFnc),

    // Agent Categoy
    allow.resource(getAgentCategoryFnc),
    allow.resource(listAgentCategoriesFnc),
    allow.resource(createAgentCategoryFnc),
    allow.resource(updateAgentCategoryFnc),
    allow.resource(deleteAgentCategoryFnc),

    // Agent Version
    allow.resource(listAgentVersionFnc),
    allow.resource(createAgentVersionFnc),
    allow.resource(updateAgentVersionFnc),
    allow.resource(deleteAgentVersionFnc),

  ])
  // .addToSchema({
  //   "s"
  // }); 

// const schema = a.schema({
//   Todo: a.model({
//     content: a.string(),
//   }).authorization((allow) => allow.guest())
// });

// const combinedSchema = a.combine([schema, sqlSchema]);

// Update client types
export type Schema = ClientSchema<typeof sqlSchema>;

export const data = defineData({
  schema: sqlSchema, 
  logging: {
    excludeVerboseContent: false,
    fieldLogLevel: "all",
    retention: "1 week" 
  }
  // authorizationModes:{
  //   defaultAuthorizationMode: "userPool"
  // }
});


// const amplifyClient = generateClient<Schema>();
// const aiCategoryUpdated =await amplifyClient.models.AiAgents.list({
//         filter: {
//           creator_id: {
//             eq: creatorId,
//           },
//         },
//         limit: parseInt(limit),
//         nextToken: nextToken || undefined,
//         selectionSet: selectionSet,
//       });