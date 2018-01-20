import Fs from 'fs';
import mergeOptions from 'merge-options';

import { makeFullyQualifiedAccount } from './util';


/** DEFAULT OPTIONS */
const TOOT_OPTIONS = {
  visibility: 'public',
  sensitive: false,
};
/** */

export const getSettings = (file) => {
  const data = Fs.readFileSync(file);
  if (data == null) {
    throw new Error('Unable to load settings');
  }

  const customSettings = JSON.parse(data);
  let { instanceUrl, adminAccounts, botAccount } = customSettings;
  const { accessToken, answerMessage } = customSettings;

  if (instanceUrl == null || accessToken == null || botAccount == null || answerMessage == null) {
    throw new Error('accessToken, instanceUrl, botAccount and answerMessage are mandatory');
  }
  if (instanceUrl.endsWith('/') === false) {
    instanceUrl = `${instanceUrl}/`;
  }

  const tootOptions = mergeOptions(TOOT_OPTIONS, customSettings.tootOptions || {});
  botAccount = makeFullyQualifiedAccount(botAccount);
  adminAccounts = adminAccounts.map(admin => makeFullyQualifiedAccount(admin));

  if (Array.isArray(adminAccounts) === false) {
    throw new Error('admins must be an array');
  }

  return {
    instanceUrl,
    accessToken,
    tootOptions,
    botAccount,
    answerMessage,
    adminAccounts,
    adminAccountsString: adminAccounts.join(' '),
  };
};

export default getSettings;
