import { GuildMember, Message } from "discord.js";
import { GATEWAY_TOKEN, GATEWAY_URL, MATCH_PATTERN } from "../config/config";

// snake_case is expected for all requests.

interface GatewayMemberRequest {
  username: string;
  user_id: string;
  user_nickname: string | null;
  user_display_name: string; // Nickname if exists, otherwise global name
  user_global_name: string | null; // This is a global-level display (non-unique) name
  user_roles: string[];
}

interface GatewayDiscordRequest {
  message_id: string;
  channel_id: string;
  guild_id: string;
  author: GatewayMemberRequest;
  targets: GatewayMemberRequest[];
}

interface GatewayMetadataRequest {
  timestamp: string;
}

interface GatewayEventRequest {
  discord: GatewayDiscordRequest;
  metadata: GatewayMetadataRequest;
}

export async function process_timeout(msg: Message) {
  if (msg.author.bot) {
    return;
  }

  if (msg.content.match(MATCH_PATTERN) == null) {
    return;
  }

  console.info(`Matched message from author ${msg.author.displayName}.`);

  let member = msg.member;
  if (member == null) {
    return;
  }

  // Determine the target(s) of this message.
  // By default, all events should target self.
  // If other users are @mentioned, they are the explicit targets instead.
  // TODO: Verify if @replies are included in mentions, or if they need to be explicitly added.
  var targetMembers = [member];
  if (msg.mentions.members?.size ?? 0 > 0) {
    targetMembers =
      msg.mentions.members?.map((guildMember, _key) => guildMember) ??
      targetMembers; // This is bad, fix it later.
  }

  // Assume the URL is nonnull.
  // TODO: :)
  await fetch(GATEWAY_URL!!, {
    method: "POST",
    body: JSON.stringify(createGatewayEventRequest(msg, member, targetMembers)),
    headers: {
      Authorization: GATEWAY_TOKEN ?? "",
      "Content-Type": "application/json",
    },
  });
}

function createGatewayDiscordRequest(
  message: Message,
  member: GuildMember,
  targetMembers: GuildMember[]
): GatewayDiscordRequest {
  function createGatewayMemberRequest(
    member: GuildMember
  ): GatewayMemberRequest {
    return {
      username: member.user.username,
      user_id: member.id,
      user_nickname: member.nickname,
      user_display_name: member.displayName,
      user_global_name: member.user.globalName,
      user_roles: member.roles.cache.map((role) => role.id),
    };
  }

  return {
    message_id: message.id,
    channel_id: message.channelId,
    guild_id: message.guildId ?? "", // Only expect messages from guilds, not DMs
    author: createGatewayMemberRequest(member),
    targets: targetMembers.map((targetMember) =>
      createGatewayMemberRequest(targetMember)
    ),
  };
}

function createGatewayMetadataRequest(): GatewayMetadataRequest {
  return {
    timestamp: new Date(Date.now()).toISOString(),
  };
}

function createGatewayEventRequest(
  message: Message,
  member: GuildMember,
  targetMembers: GuildMember[]
): GatewayEventRequest {
  return {
    discord: createGatewayDiscordRequest(message, member, targetMembers),
    metadata: createGatewayMetadataRequest(),
  };
}
