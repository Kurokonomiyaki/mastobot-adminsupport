import HtmlParser from 'htmlparser';
import HtmlEntities from 'he';

import { parseAccountUrl, isBot } from './util';

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
      const account = parseAccountUrl(href);
      if (account != null && isAdmin && isBot(account) === false) {
        text.push(account);
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
