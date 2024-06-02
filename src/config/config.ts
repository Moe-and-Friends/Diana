// Discord bot token.
export const BOT_TOKEN = Bun.env.DISCORD_BOT_TOKEN

// Gateway URL bot token (optional)
export const GATEWAY_TOKEN = Bun.env.GATEWAY_TOKEN ?? null

// URL to send timeout event requests to.
// The method will be a `POST` event.
export const GATEWAY_URL = Bun.env.GATEWAY_URL 

// Regex expression to apply to each message.
// If the regex returns true, a notification event will be sent.
// Defaults to matching the empty string (an invalid message)
export const MATCH_PATTERN = new RegExp(Bun.env.MATCH_PATTERN ?? "")