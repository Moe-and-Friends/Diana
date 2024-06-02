import { Collection, Guild, GuildMember, Message } from "discord.js";
import {
  ADMINISTRATOR_USERS,
  MODERATOR_ROLES,
  PROTECTED_ROLES,
} from "../config";

const gamerWhen = "<:gamerwhen:651367432967159808>";
const timeoutMatcher = (msg: string) => msg.includes(gamerWhen);

interface UserRoles {
  readonly is_administrator: Boolean;
  readonly is_moderator: Boolean;
  readonly is_protected: Boolean;
}

export async function process_timeout(msg: Message) {
  if (msg.author.bot) {
    return;
  }

  if (!timeoutMatcher(msg.content)) {
    return;
  }

  console.log(
    `Found message containing trigger word from author ${msg.author.displayName}`
  );

  let member = msg.member;
  if (member == null) {
    return;
  }

  let memberRoles = getMemberRoles(member);

  // Determine the target(s) of this message.
  // By default, all events should target self.
  // Administrators and Moderators may target other users by @mentioning them.
  // - Note: Replies to messages also count as @mentioning.
  var targetMembers = [member];
  if ((msg.mentions.members?.size ?? 0 > 0) && memberRoles.is_moderator) {
    targetMembers =
      msg.mentions.members?.map((guildMember, _key) => guildMember) ??
      targetMembers; // This is bad, fix it later.
  }

  let reqBody = {
    discord: {
      message_id: msg.id,
      channel_id: msg.channelId,
      guild_id: msg.guildId,
      author: {
        user_id: member.id,
      },
      targets: targetMembers.map((targetMember) => ({
        user_id: targetMember.id,
        user_roles: getMemberRoles(targetMember),
      })),
    },
  };

  console.log(JSON.stringify(reqBody, null, 2));
}

function getMemberRoles(member: GuildMember): UserRoles {
  const is_administrator = ADMINISTRATOR_USERS.has(member?.id);
  // Fallthrough: All administrators are implicitly moderators
  const is_moderator =
    member.roles.cache.hasAny(...MODERATOR_ROLES) || is_administrator;
  // Fallthrough: All administrators and moderators are implicitly protected
  const is_protected =
    member.roles.cache.hasAny(...PROTECTED_ROLES) ||
    is_moderator ||
    is_administrator;

  return {
    is_administrator: is_administrator,
    is_moderator: is_moderator,
    is_protected: is_protected,
  };
}
