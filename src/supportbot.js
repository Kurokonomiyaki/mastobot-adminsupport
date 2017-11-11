import Mastodon from 'mastodon-api';

import { parseToot } from './tootparser';

import { isAdmin, parseAccountUrl, ADMINS_CLEANED } from './util';

import {
  INSTANCE_URL,
  ACCESS_TOKEN,
  TOOT_OPTIONS,
  ANSWER_MESSAGE,
} from './settings';


const ADMINS_LIST_STRING = ADMINS_CLEANED.join(' ');


const sendMessageToCommunity = (instance, author, message) => {
  const finalMessage = `${message}\n\n--\n${author}`;
  instance.post('statuses', Object.assign({
    status: finalMessage,
  }, TOOT_OPTIONS));
};

const sendMessageToAdmins = (instance, originalTootId, from, message, originalVisibility) => {
  let finalMessage = null;
  let finalVisibility = originalVisibility;

  if (originalVisibility === 'direct' || originalVisibility === 'private') {
    finalVisibility = 'direct';
    finalMessage = `Hi ${from},\n\n${ANSWER_MESSAGE}\n\ncc: ${ADMINS_LIST_STRING}\n\n--\n${message}\n--`;
  } else {
    finalMessage = `Hi ${from},\n\n${ANSWER_MESSAGE}\n\ncc: ${ADMINS_LIST_STRING}`;
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

    console.log(toot);
    if (toot.in_reply_to_id != null) {
      return;
    }

    const author = data.account;
    const authorAccount = parseAccountUrl(author.url);
    const admin = isAdmin(authorAccount);

    parseToot(toot.content, admin, (text) => {
      if (admin) { // sent by admin
        console.log('Admin message received', authorAccount, text.replace(/[\n|\r]/gm, ''));
        sendMessageToCommunity(instance, author.username, text);
      } else { // sent by regular user
        console.log('User message received', authorAccount, text.replace(/[\n|\r]/gm, ''));
        sendMessageToAdmins(instance, toot.id, authorAccount, text, toot.visibility);
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
