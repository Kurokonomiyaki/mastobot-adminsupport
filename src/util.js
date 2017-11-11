import { ADMINS } from './settings';

export const makeMention = (account) => {
  let result = account.toLowerCase().trim();
  if (result.startsWith('@') === false) {
    result = `@${result}`;
  }
  return result;
};

export const isAdmin = (account) => {
  const mentionnedAccount = makeMention(account);
  return ADMINS.some(admin => makeMention(admin) === mentionnedAccount);
};
