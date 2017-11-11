import Mastodon from 'mastodon-api';

import { parseToot } from './tootparser';

import { isAdmin, makeMention } from './util';

import {
  INSTANCE_URL,
  ACCESS_TOKEN,
  TOOT_OPTIONS,
  ADMINS,
  ANSWER_MESSAGE,
} from './settings';

const MENTIONNED_ADMINS = ADMINS.map(admin => makeMention(admin));

const sendMessageToCommunity = (instance, author, message) => {
  const finalMessage = `${message}\n\n--\n${author}`;
  instance.post('statuses', Object.assign({
    status: finalMessage,
  }, TOOT_OPTIONS));
};

const sendMessageToAdmins = (instance, originalTootId, from, message, originalVisibility) => {
  const finalMessage = `Hi ${makeMention(from)},\n\n${ANSWER_MESSAGE}\n\ncc: ${MENTIONNED_ADMINS.join(' ')}\n\n--\n${message}\n--`;
  let finalVisibility = originalVisibility;
  if (originalVisibility === 'direct' || originalVisibility === 'private') {
    finalVisibility = 'direct';
  }

  instance.post('statuses', {
    in_reply_to_id: originalTootId,
    status: finalMessage,
    visibility: finalVisibility,
  });
};

const onMessageReceived = (instance, message) => {
  const { event, data } = message;
  if (event === 'notification' && data.type === 'mention') {
    const toot = data.status;
    const author = data.account;
    const admin = isAdmin(author.acct);

    parseToot(toot.content, admin, (text) => {
      if (admin) { // sent by admin
        console.log('Admin message received', author.acct, text.replace(/[\n|\r]/gm, ''));
        sendMessageToCommunity(instance, author.username, text);
      } else { // sent by regular user
        console.log('User message received', author.acct, text.replace(/[\n|\r]/gm, ''));
        sendMessageToAdmins(instance, toot.id, author.acct, text, toot.visibility);
      }
    });
  }
};

export const startBot = () => {
  const instance = new Mastodon({
    access_token: ACCESS_TOKEN,
    api_url: `${INSTANCE_URL}/`,
  });

  const listener = instance.stream('streaming/user');
  listener.on('message', (msg) => onMessageReceived(instance, msg));
  listener.on('error', (err) => console.log(err));
  // listener.on('heartbeat', msg => console.log('Dadoum.'));

  console.log('Listening...');
};

export default startBot;
