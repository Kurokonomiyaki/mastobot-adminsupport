import Mastodon from 'mastodon-api';

import { parseToot } from './tootparser';
import { isAdmin, parseAccountUrl } from './util';
import { getSettings } from './settings';


const sendMessageToCommunity = (settings, instance, author, message) => {
  const finalMessage = `${message}\n\n--\n${author}`;
  instance.post('statuses', Object.assign({
    status: finalMessage,
  }, settings.tootOptions));
};

const sendMessageToAdmins = (settings, instance, originalTootId, from, message, originalVisibility) => {
  let finalMessage = null;
  let finalVisibility = originalVisibility;

  if (originalVisibility === 'direct' || originalVisibility === 'private') {
    finalVisibility = 'direct';
    finalMessage = `Hi ${from},\n\n${settings.answerMessage}\n\ncc: ${settings.adminAccountsString}\n\n--\n${message}\n--`;
  } else {
    finalMessage = `Hi ${from},\n\n${settings.answerMessage}\n\ncc: ${settings.adminAccountsString}`;
  }

  instance.post('statuses', {
    in_reply_to_id: originalTootId,
    status: finalMessage,
    visibility: finalVisibility,
  });
};

const onMessageReceived = (settings, instance, message) => {
  const { event, data } = message;
  if (event === 'notification' && data.type === 'mention') {
    const toot = data.status;

    if (toot.in_reply_to_id != null) {
      return;
    }

    const author = data.account;
    const authorAccount = parseAccountUrl(author.url);
    const admin = isAdmin(settings, authorAccount);

    parseToot(settings, toot.content, admin, (text) => {
      if (admin) { // sent by admin
        console.log('Admin message received', authorAccount, text.replace(/[\n|\r]/gm, ''));
        sendMessageToCommunity(settings, instance, authorAccount, text);
      } else { // sent by regular user
        console.log('User message received', authorAccount, text.replace(/[\n|\r]/gm, ''));
        sendMessageToAdmins(settings, instance, toot.id, authorAccount, text, toot.visibility);
      }
    });
  }
};

export const startBot = () => {
  const settings = getSettings(`${__dirname}/../settings.json`);

  const instance = new Mastodon({
    access_token: settings.accessToken,
    api_url: settings.instanceUrl,
  });

  const listener = instance.stream('streaming/user');
  listener.on('message', (msg) => onMessageReceived(settings, instance, msg));
  listener.on('error', (err) => console.log(err));
  // listener.on('heartbeat', msg => console.log('Dadoum.'));

  console.log('Listening...');
};

export default startBot;
