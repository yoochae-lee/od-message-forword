const { App } = require('@slack/bolt');
require('dotenv').config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const KEYWORDS = process.env.KEYWORDS.split(',');
const FORWARD_CHANNEL = process.env.FORWARD_CHANNEL_ID;

app.message(async ({ message, client }) => {
  if (message.subtype) return;

  const text = message.text || '';
  const matched = KEYWORDS.find(kw => text.includes(kw));

  if (matched) {
    const channelInfo = await client.conversations.info({
      channel: message.channel,
    });

    await client.chat.postMessage({
      channel: FORWARD_CHANNEL,
      text: `🚨 키워드 감지: *${matched}*`,
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `🚨 *키워드 감지:* \`${matched}\`` },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*채널:*\n#${channelInfo.channel.name}` },
            { type: 'mrkdwn', text: `*작성자:*\n<@${message.user}>` },
          ],
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*원본 메시지:*\n${text}` },
        },
      ],
    });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡ Slack 봇 서버 실행 중');
})();
