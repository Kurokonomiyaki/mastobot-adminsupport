'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSettings = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mergeOptions = require('merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** DEFAULT OPTIONS */
var TOOT_OPTIONS = {
  visibility: 'public',
  sensitive: false
};
/** */

var getSettings = exports.getSettings = function getSettings(file) {
  var data = _fs2.default.readFileSync(file);
  if (data == null) {
    throw new Error('Unable to load settings');
  }

  var customSettings = JSON.parse(data);
  var instanceUrl = customSettings.instanceUrl,
      adminAccounts = customSettings.adminAccounts,
      botAccount = customSettings.botAccount;
  var accessToken = customSettings.accessToken,
      answerMessage = customSettings.answerMessage;


  if (instanceUrl == null || accessToken == null || botAccount == null || answerMessage == null) {
    throw new Error('accessToken, instanceUrl, botAccount and answerMessage are mandatory');
  }
  if (instanceUrl.endsWith('/') === false) {
    instanceUrl = instanceUrl + '/';
  }

  var tootOptions = (0, _mergeOptions2.default)(TOOT_OPTIONS, customSettings.tootOptions || {});
  botAccount = (0, _util.makeFullyQualifiedAccount)(botAccount);
  adminAccounts = adminAccounts.map(function (admin) {
    return (0, _util.makeFullyQualifiedAccount)(admin);
  });

  if (Array.isArray(adminAccounts) === false) {
    throw new Error('admins must be an array');
  }

  return {
    instanceUrl: instanceUrl,
    accessToken: accessToken,
    tootOptions: tootOptions,
    botAccount: botAccount,
    answerMessage: answerMessage,
    adminAccounts: adminAccounts,
    adminAccountsString: adminAccounts.join(' ')
  };
};

exports.default = getSettings;