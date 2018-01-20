'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseToot = undefined;

var _htmlparser = require('htmlparser');

var _htmlparser2 = _interopRequireDefault(_htmlparser);

var _he = require('he');

var _he2 = _interopRequireDefault(_he);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var domNodeToText = function domNodeToText(settings, node) {
  var text = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var isAdmin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var name = node.name,
      type = node.type,
      children = node.children;

  var attribs = node.attribs || {};
  var className = attribs.class;


  if (name === 'br') {
    text.push('\n');
    return;
  }

  // regular text
  if (type === 'text') {
    text.push(node.data);
    return;
  }

  // ignore invisible content (cw)
  if (className != null && className.includes('invisible')) {
    return;
  }

  // ignore mentionned users
  if (name === 'a' && className != null && className.includes('mention')) {
    var href = attribs.href;

    if (href != null) {
      var account = (0, _util.parseAccountUrl)(href);
      if (account != null && isAdmin && (0, _util.isBot)(settings, account) === false) {
        text.push(account);
      }
      return;
    }
  }

  // analyze children
  if (children != null && children.length > 0) {
    children.forEach(function (child) {
      domNodeToText(settings, child, text, isAdmin);
    });
  }

  if (name === 'p') {
    text.push('\n\n');
  }
};

var analyzeTootDom = function analyzeTootDom(settings, dom) {
  var isAdmin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  // console.log('dom', JSON.stringify(dom, null, 2));

  var texts = [];
  if (dom.length > 0) {
    dom.forEach(function (child) {
      domNodeToText(settings, child, texts, isAdmin);
    });
  }

  if (texts.length === 0) {
    return null;
  }

  return _he2.default.decode(texts.join(' ').trim());
};

var parseToot = exports.parseToot = function parseToot(settings, toot, isAdmin, onResult) {
  var handler = new _htmlparser2.default.DefaultHandler(function (error, dom) {
    if (error != null) {
      console.log('Parse error', error);
      return;
    }

    onResult(analyzeTootDom(settings, dom, isAdmin));
  });

  var parser = new _htmlparser2.default.Parser(handler);
  parser.parseComplete(toot);
};

exports.default = parseToot;