'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseAccountUrl = exports.isBot = exports.isAdmin = exports.makeFullyQualifiedAccount = undefined;

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeFullyQualifiedAccount = exports.makeFullyQualifiedAccount = function makeFullyQualifiedAccount(account) {
  var result = account.toLowerCase().trim();
  if (result.startsWith('@') === false) {
    result = '@' + result;
  }
  return result;
};

var isAdmin = exports.isAdmin = function isAdmin(_ref, account) {
  var adminAccounts = _ref.adminAccounts;

  return adminAccounts.includes(account);
};

var isBot = exports.isBot = function isBot(_ref2, account) {
  var botAccount = _ref2.botAccount;

  return botAccount === account;
};

var parseAccountUrl = exports.parseAccountUrl = function parseAccountUrl(url) {
  var parsedUrl = _url2.default.parse(url);
  var hostname = parsedUrl.hostname,
      pathname = parsedUrl.pathname;


  if (pathname != null && hostname != null) {
    var userName = _path2.default.posix.basename(pathname);
    if (userName != null) {
      return makeFullyQualifiedAccount(userName + '@' + hostname);
    }
  }

  return null;
};