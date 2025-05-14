import { a, defineData, type ClientSchema } from "@aws-amplify/backend";
import { schema as generatedSqlSchema } from "./schema.sql";
import { aiAgentGetMethodFnc } from "../functions/agents/resources";

const sqlSchema = generatedSqlSchema
  .renameModels(() => [
    ["agent_categories", "AgentCategories"],
    ["ai_agents", "AiAgents"],
    ["ai_reviews", "AiReviews"],
    ["chats", "Chats"],
    ["report_categories", "ReportCategories"],
    ["roles", "Roles"],
    ["user_likes", "UserLikes"],
    ["users", "Users"],
  ])
  .setRelationships((models) => [
    models.AgentCategories.relationships({
      ai_agents: a.hasMany("AiAgents", "agent_category_id"),
    }),
    models.AiReviews.relationships({
      ai_agents: a.belongsTo("AiAgents", "ai_agent_id"),
      users: a.belongsTo("Users", "reporter_id"),
      report_categories: a.belongsTo("ReportCategories", "report_categories_id"),
    }),
    models.AiAgents.relationships({
      agent_categories: a.belongsTo("AgentCategories", "agent_category_id"),
      chats: a.hasMany("Chats", "ai_agent_id"),
      user_likes: a.hasMany("UserLikes", "ai_agent_id"),
      ai_reviews: a.hasMany("AiReviews", "ai_agent_id"),
      users: a.belongsTo("Users", "creator_id"),
    }),
    models.Chats.relationships({
      ai_agents: a.belongsTo("AiAgents", "ai_agent_id"),
      users: a.belongsTo("Users", "user_id"),
    }),
    models.ReportCategories.relationships({
      ai_reviews: a.hasMany("AiReviews", "report_categories_id"),
    }),
    models.Roles.relationships({
      users: a.hasMany("Users", "role_id"),
    }),
    models.UserLikes.relationships({
      ai_agents: a.belongsTo("AiAgents", "ai_agent_id"),
      users: a.belongsTo("Users", "user_id"),
    }),
    models.Users.relationships({
      chats: a.hasMany("Chats", "user_id"),
      user_likes: a.hasMany("UserLikes", "user_id"),
      ai_reviews: a.hasMany("AiReviews", "reporter_id"),
      roles: a.belongsTo("Roles", "role_id"),
      ai_agents: a.hasMany("AiAgents", "creator_id"),
    }),
  ]).authorization((allow) => allow.resource(aiAgentGetMethodFnc).to(["query", "listen"]));

const schema = a.schema({
  Todo: a.model({
    content: a.string(),
  }).authorization((allow) => allow.guest())
});

const combinedSchema = a.combine([schema, sqlSchema]);

// Update client types
export type Schema = ClientSchema<typeof combinedSchema>;

export const data = defineData({
  schema: combinedSchema,
  // authorizationModes:{
  //   defaultAuthorizationMode: "lambda"
  // }
});