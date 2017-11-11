import HtmlParser from 'htmlparser';
import Url from 'url';
import Path from 'path';
import HtmlEntities from 'he';

import { makeMention } from './util';

import { BOT_ACCOUNT } from './settings';

const domNodeToText = (node, text = [], isAdmin = false) => {
  const { name, type, children } = node;
  const attribs = node.attribs || {};
  const { class: className } = attribs;

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
    const { href } = attribs;
    if (href != null) {
      const url = Url.parse(href);
      const { hostname, pathname } = url;

      if (isAdmin && pathname != null && hostname != null) {
        const userName = Path.posix.basename(pathname);
        if (userName != null) {
          const account = makeMention(`${userName}@${hostname}`);
          if (account !== makeMention(BOT_ACCOUNT)) {
            text.push(account);
          }
        }
      }
      return;
    }
  }

  // analyze children
  if (children != null && children.length > 0) {
    children.forEach((child) => {
      domNodeToText(child, text, isAdmin);
    });
  }

  if (name === 'p') {
    text.push('\n\n');
  }
};

const analyzeTootDom = (dom, isAdmin = false) => {
  // console.log('dom', JSON.stringify(dom, null, 2));

  const texts = [];
  if (dom.length > 0) {
    dom.forEach((child) => {
      domNodeToText(child, texts, isAdmin);
    });
  }

  if (texts.length === 0) {
    return null;
  }

  return HtmlEntities.decode(texts.join(' ').trim());
};

export const parseToot = (toot, isAdmin, onResult) => {
  const handler = new HtmlParser.DefaultHandler((error, dom) => {
    if (error != null) {
      console.log('Parse error', error);
      return;
    }

    onResult(analyzeTootDom(dom, isAdmin));
  });

  const parser = new HtmlParser.Parser(handler);
  parser.parseComplete(toot);
};

export default parseToot;
