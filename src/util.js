import Url from 'url';
import Path from 'path';


export const makeFullyQualifiedAccount = (account) => {
  let result = account.toLowerCase().trim();
  if (result.startsWith('@') === false) {
    result = `@${result}`;
  }
  return result;
};

export const isAdmin = ({ adminAccounts }, account) => {
  return adminAccounts.includes(account.toLowerCase().trim());
};

export const isBot = ({ botAccount }, account) => {
  return botAccount === account;
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
