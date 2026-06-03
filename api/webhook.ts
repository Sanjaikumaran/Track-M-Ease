import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    const VERIFY_TOKEN = "track_mease_verify_token";

    if (req.method === "GET") {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (
            mode === "subscribe" &&
            token === VERIFY_TOKEN
        ) {
            return res.status(200).send(challenge);
        }

        return res.status(403).send("Forbidden");
    }

    return res.status(200).json({ success: true });
}