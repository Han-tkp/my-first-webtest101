// src/lib/line.ts
import crypto from "crypto";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

export async function sendLineMessage(to: string, text: string) {
    if (!LINE_CHANNEL_ACCESS_TOKEN || !to) return;

    try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                to,
                messages: [{ type: "text", text }],
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("LINE API Error:", error);
        }
    } catch (err) {
        console.error("Failed to send LINE message:", err);
    }
}

export function verifyLineSignature(body: string, signature: string): boolean {
    if (!LINE_CHANNEL_SECRET || !signature) return false;

    const hash = crypto
        .createHmac("SHA256", LINE_CHANNEL_SECRET)
        .update(body)
        .digest("base64");

    return hash === signature;
}

export async function getLineUserProfile(userId: string) {
    if (!LINE_CHANNEL_ACCESS_TOKEN) return null;

    try {
        const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
            headers: {
                "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.error("Failed to get LINE user profile:", err);
    }
    return null;
}
