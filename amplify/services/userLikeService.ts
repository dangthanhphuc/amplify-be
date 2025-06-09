import { generateClient } from "aws-amplify/data";
import { Schema } from "../data/resource";
import { getVietnamTimestamp } from "../utils/transform";

export interface UserLikeDTO {
  userId: string;
  aiAgentId: string;
  isLiked: number;
}

export async function likeAiAgent(
  amplifyClient: any,
  userLikeDTO: UserLikeDTO
) {
  const se = generateClient<Schema>();

  // Get Ai Agent
  const exixtsAgent = await amplifyClient.models.AiAgents.get({
    id: userLikeDTO.aiAgentId,
  });
  const exixtsUser = await amplifyClient.models.Users.get({
    id: userLikeDTO.userId
  });
  
  if (!exixtsAgent.data || !exixtsUser.data) {
    console.error("Ai Agent or User not found");
    throw new Error("Ai Agent or User  not found");
  }

  const exixtsUserLike = await amplifyClient.models.UserLikes.get({
    user_id: userLikeDTO.userId,
    ai_agent_id: userLikeDTO.aiAgentId,
  });

  let userLikeResult ;
  if(exixtsUserLike.data) {
    userLikeResult = await amplifyClient.models.UserLikes.update({
        user_id: userLikeDTO.userId,
        ai_agent_id: userLikeDTO.aiAgentId,
        liked: userLikeDTO.isLiked,
    });
    console.log("User like updated: ", JSON.stringify(userLikeResult));
  } else {
    userLikeResult = await amplifyClient.models.UserLikes.create({
      user_id: userLikeDTO.userId,
      ai_agent_id: userLikeDTO.aiAgentId,
      liked: userLikeDTO.isLiked,
      create_at: getVietnamTimestamp().toISOString(),
    });
  }
  console.log("User like result: ", JSON.stringify(userLikeResult));

  let likeCountUpdate = exixtsAgent.data?.like_count || 0;
  if(userLikeDTO.isLiked == 1) {
    likeCountUpdate++;
  } else if(userLikeDTO.isLiked == 0) {
    likeCountUpdate--;
  }
  console.log("Like count new: ", likeCountUpdate);

  // Update like_count for Ai Agent
  const updateAiAgentResult = await amplifyClient.models.AiAgents.update({
    id: userLikeDTO.aiAgentId,
    like_count: likeCountUpdate,
  });
  console.log("Update Ai Agent result: ", JSON.stringify(updateAiAgentResult));

  return userLikeResult;
}
