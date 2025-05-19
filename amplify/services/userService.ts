import { rdsClient } from "../utils/rdsClient";
import { getSecret } from "../utils/secretManager";

export async function addUserToRds(user: { email: string, name: string }) {
  const secret = await getSecret("prod/RDS_SECRET_ARN");
  
  // ... gọi rdsClient để insert user ...
}