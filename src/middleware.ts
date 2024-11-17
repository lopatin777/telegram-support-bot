import cache from './cache';
import * as signal from './addons/signal';
import { Context } from './interfaces';

// Strict escape for MarkdownV2
const strictEscape = (str: string): string => {
  if (cache.config.parse_mode === 'MarkdownV2') {
    return str.replace(/([[\]()_*~`>#+\-=\|{}.!])/g, '\\$1'); // Escape all special MarkdownV2 characters
  } else if (cache.config.parse_mode === 'HTML') {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;'); // Added escape for single quotes
  } else if (cache.config.parse_mode === 'Markdown') {
    return str
      .replace(/([[\]_*`])/g, '\$1') // Escape all special Markdown characters
      .replace(/(\[|\])/g, '\$1'); // Escape square brackets separately for safety
  }
  return str.toString();
};

// General escape function for text based on parse mode
const escapeText = (str: string): string => {
  if (!str) return '';

  const parseMode = cache.config.parse_mode.toLowerCase();

  if (parseMode === 'html') {
    // HTML escape
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;'); // Added escape for single quotes
  } else if (parseMode === 'markdownv2') {
    // MarkdownV2 escape, includes all special characters
    // Handle URLs by not escaping inside parentheses
    return str
      .replace(/([[\]()_*~`>#+\-=\|{}.!])/g, '\\$1') // Escape MarkdownV2 characters
      .replace(/(\()/g, '\\(')
      .replace(/(\))/g, '\\)'); // Escape parentheses separately for safety
  } else if (parseMode === 'markdown') {
    // Regex to escape all special characters in Markdown
    return str
    .replace(/([[\]_*`])/g, '\\$1') // Escape all special Markdown characters
    .replace(/(\[|\])/g, '\\$1'); // Escape square brackets separately
  }

  return str.toString();
};

// Function to send a message
const msg = (
  id: string | number,
  msg: string,
  extra: any = { parse_mode: cache.config.parse_mode }
) => {
  msg = escapeText(msg);

  if (id.toString().includes('WEB') && id !== cache.config.staffchat_id) {
    const socketId = id.toString().split('WEB')[1];
    cache.io.to(socketId).emit('chat_staff', msg);
  } else if (id.toString().includes('SIGNAL') && id !== cache.config.staffchat_id) {
    const signalId = id.toString().split('SIGNAL')[1];
    signal.message(signalId, msg);
  } else {
    msg = msg.replace(/ {2,}/g, ' '); // Remove extra spaces
    cache.bot.sendMessage(id, msg, extra);
  }
};

// Function to reply in a context
const reply = (
  ctx: Context,
  msgText: string,
  extra: any = { parse_mode: cache.config.parse_mode }
) => {
  msg(ctx.message.chat.id, msgText, extra);
};

export { strictEscape, msg, reply };
