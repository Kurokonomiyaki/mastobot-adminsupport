'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startBot = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _mastodonApi = require('mastodon-api');

var _mastodonApi2 = _interopRequireDefault(_mastodonApi);

var _tootparser = require('./tootparser');

var _util = require('./util');

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sendMessageToCommunity = function sendMessageToCommunity(settings, instance, author, message) {
  var finalMessage = message + '\n\n--\n' + author;
  instance.post('statuses', (0, _assign2.default)({
    status: finalMessage
  }, settings.tootOptions));
};

var sendMessageToAdmins = function sendMessageToAdmins(settings, instance, originalTootId, from, message, originalVisibility) {
  var finalMessage = null;
  var finalVisibility = originalVisibility;

  if (originalVisibility === 'direct' || originalVisibility === 'private') {
    finalVisibility = 'direct';
    finalMessage = 'Hi ' + from + ',\n\n' + settings.answerMessage + '\n\ncc: ' + settings.adminAccountsString + '\n\n--\n' + message + '\n--';
  } else {
    finalMessage = 'Hi ' + from + ',\n\n' + settings.answerMessage + '\n\ncc: ' + settings.adminAccountsString;
  }

  instance.post('statuses', {
    in_reply_to_id: originalTootId,
    status: finalMessage,
    visibility: finalVisibility
  });
};

var onMessageReceived = function onMessageReceived(settings, instance, message) {
  var event = message.event,
      data = message.data;

  if (event === 'notification' && data.type === 'mention') {
    var toot = data.status;

    if (toot.in_reply_to_id != null) {
      return;
    }

    var author = data.account;
    var authorAccount = (0, _util.parseAccountUrl)(author.url);
    var admin = (0, _util.isAdmin)(settings, authorAccount);

    (0, _tootparser.parseToot)(settings, toot.content, admin, function (text) {
      if (admin) {
        // sent by admin
        console.log('Admin message received', authorAccount, text.replace(/[\n|\r]/gm, ''));
        sendMessageToCommunity(settings, instance, authorAccount, text);
      } else {
        // sent by regular user
        console.log('User message received', authorAccount, text.replace(/[\n|\r]/gm, ''));
        sendMessageToAdmins(settings, instance, toot.id, authorAccount, text, toot.visibility);
      }
    });
  }
};

var startBot = exports.startBot = function startBot() {
  var settings = (0, _settings.getSettings)(__dirname + '/../settings.json');

  var instance = new _mastodonApi2.default({
    access_token: settings.accessToken,
    api_url: settings.instanceUrl
  });

  var listener = instance.stream('streaming/user');
  listener.on('message', function (msg) {
    return onMessageReceived(settings, instance, msg);
  });
  listener.on('error', function (err) {
    return console.log(err);
  });
  // listener.on('heartbeat', msg => console.log('Dadoum.'));

  console.log('Listening...');
};

exports.default = startBot;