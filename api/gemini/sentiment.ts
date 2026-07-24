import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sentimentHandler } from "../_lib/gemini";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return sentimentHandler(req, res);
}
