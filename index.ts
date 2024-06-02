import { Client, Events, GatewayIntentBits } from "discord.js";
import { process_timeout } from "./events/timeout";

type Admin = {};
type Protected = {};


const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Scan message for potential timeout
client.on(Events.MessageCreate, async (msg) => {
  process_timeout(msg);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot has started! Logged in as ${readyClient.user.tag}`);
});

client.login(Bun.env.DISCORD_BOT_TOKEN)