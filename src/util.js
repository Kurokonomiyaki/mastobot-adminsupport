import Url from 'url';
import Path from 'path';

import { ADMINS, BOT_ACCOUNT } from './settings';

export const makeFullyQualifiedAccount = (account) => {
  let result = account.toLowerCase().trim();
  if (result.startsWith('@') === false) {
    result = `@${result}`;
  }
  return result;
};

export const BOT_ACCOUNT_CLEANED = makeFullyQualifiedAccount(BOT_ACCOUNT);
export const ADMINS_CLEANED = ADMINS.map(admin => makeFullyQualifiedAccount(admin));

export const isAdmin = (account) => {
  return ADMINS_CLEANED.includes(account);
};

export const isBot = (account) => {
  return BOT_ACCOUNT_CLEANED === account;
};

export const parseAccountUrl = (url) => {
  const parsedUrl = Url.parse(url);
  const { hostname, pathname } = parsedUrl;

  if (pathname != null && hostname != null) {
    const userName = Path.posix.basename(pathname);
    if (userName != null) {
      return makeFullyQualifiedAccount(`${userName}@${hostname}`);
    }
  }

  return null;
};
