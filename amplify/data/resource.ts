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
import { createAgentFnc } from "../functions/ai-agent/create/resources";
import { updateAgentFnc } from "../functions/ai-agent/update/resources";
import { deleteAgentFnc } from "../functions/ai-agent/delete/resources";
import { listAiCategoriesFnc } from "../functions/ai-category/list/resources";
import { createAiCategoryFnc } from "../functions/ai-category/create/resources";
import { updateAiCategoryFnc } from "../functions/ai-category/update/resources";
import { deleteAiCategoryFnc } from "../functions/ai-category/delete/resources";
import { getAgentsFnc } from "../functions/ai-agent/get/resources";


const sqlSchema = generatedSqlSchema
  .renameModels(() => [
    ["agent_categories", "AgentCategories"],
    ["ai_categories", "AiCategories"],
    ["ai_agents", "AiAgents"],
    ["ai_reviews", "AiReviews"],
    ["chats", "Chats"],
    ["report_categories", "ReportCategories"],
    ["roles", "Roles"],
    ["user_likes", "UserLikes"],
    ["users", "Users"],
  ])
  .setRelationships((models) => [
    models.Users.relationships({
      creator: a.hasMany("AiAgents", "creator_id"),
    }),
    models.AiAgents.relationships({
      created_agents: a.belongsTo("Users", "creator_id"),
      categories: a.hasMany("AiCategories", "ai_agent_id"),
    }),
    models.AiCategories.relationships({
      agent: a.belongsTo("AiAgents", "ai_agent_id"),
      agent_category: a.belongsTo("AgentCategories", "agent_category_id"),
    }),
    models.AgentCategories.relationships({
      ai_categories: a.hasMany("AiCategories", "agent_category_id"),
    }),
  ])
  // .setRelationships((models) => [
  //   models.AgentCategories.relationships({
  //     ai_categories: a.hasMany("AiCategories", "agent_category_id"),
  //   }),
  //   models.AiCategories.relationships({
  //     ai_agents: a.belongsTo("AiAgents", "ai_agent_id"),
  //     agent_categories: a.belongsTo("AgentCategories", "agent_category_id"),
  //   }),
  //   models.AiReviews.relationships({
  //     ai_agents: a.belongsTo("AiAgents", "ai_agent_id"),
  //     users: a.belongsTo("Users", "reporter_id"),
  //     report_categories: a.belongsTo("ReportCategories", "report_categories_id"),
  //   }),
  //   models.AiAgents.relationships({
  //     ai_categories: a.hasMany("AiCategories", "ai_agent_id"),
  //     chats: a.hasMany("Chats", "ai_agent_id"),
  //     user_likes: a.hasMany("UserLikes", "ai_agent_id"),
  //     ai_reviews: a.hasMany("AiReviews", "ai_agent_id"),
  //     creator: a.belongsTo("Users", "creator_id"),
  //   }),
  //   models.Chats.relationships({
  //     ai_agents: a.belongsTo("AiAgents", "ai_agent_id"),
  //     users: a.belongsTo("Users", "user_id"),
  //   }),
  //   models.ReportCategories.relationships({
  //     ai_reviews: a.hasMany("AiReviews", "report_categories_id"),
  //   }),
  //   models.Roles.relationships({
  //     users: a.hasMany("Users", "role_id"),
  //   }),
  //   models.UserLikes.relationships({
  //     ai_agents: a.belongsTo("AiAgents", "ai_agent_id"),
  //     users: a.belongsTo("Users", "user_id"),
  //   }),
  //   models.Users.relationships({
  //     chats: a.hasMany("Chats", "user_id"),
  //     user_likes: a.hasMany("UserLikes", "user_id"),
  //     ai_reviews: a.hasMany("AiReviews", "reporter_id"),
  //     roles: a.belongsTo("Roles", "role_id"),
  //     created_agents: a.hasMany("AiAgents", "creator_id"),
  //   }),])
  .authorization((allow) => [
    allow.resource(postConfirmationFnc),
    allow.resource(updateUserAttributesFnc),
    allow.resource(onUploadS3Fnc),
    allow.resource(getUserInfoFnc),

    // Ai Agents
    allow.resource(getAgentsFnc),
    allow.resource(createAgentFnc),
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
  ]); // Cấp quyền truy cập cho lambda để thao tác trên lược đồ 

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
// const aiCategoryUpdated = await amplifyClient.models.AiCategories.update({
//       agent_category_id: agentCategoryId,
//       ai_agent_id: aiAgentId,
//     });
