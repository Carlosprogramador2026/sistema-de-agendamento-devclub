import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminAssistantHandler } from "../_lib/gemini";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return adminAssistantHandler(req, res);
}
