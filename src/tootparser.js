import HtmlParser from 'htmlparser';
import HtmlEntities from 'he';

import { parseAccountUrl, isBot } from './util';

const domNodeToText = (settings, node, text = [], isAdmin = false) => {
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

  if (name === 'a') {
    const { href } = attribs;
    // ignore mentionned users
    if (className != null && className.includes('mention')) {
      if (href != null) {
        const account = parseAccountUrl(href);
        if (account != null && isAdmin && isBot(settings, account) === false) {
          text.push(account);
        }
        return;
      }
    } else if (href != null) {
        text.push(href);
        return;
    }
  }
 

  // analyze children
  if (children != null && children.length > 0) {
    children.forEach((child) => {
      domNodeToText(settings, child, text, isAdmin);
    });
  }

  if (name === 'p') {
    text.push('\n\n');
  }
};

const analyzeTootDom = (settings, dom, isAdmin = false) => {
  // console.log('dom', JSON.stringify(dom, null, 2));

  const texts = [];
  if (dom.length > 0) {
    dom.forEach((child) => {
      domNodeToText(settings, child, texts, isAdmin);
    });
  }

  if (texts.length === 0) {
    return null;
  }

  const text = texts.reduce((result, current) => {
    if (current != null && current.trim().length != 0) {
      result = `${result}${current} `;
    } else {
      result = `${result}${current}`;
    }
    return result;
  }, '');
  return HtmlEntities.decode(text.trim());
};

export const parseToot = (settings, toot, isAdmin, onResult) => {
  const handler = new HtmlParser.DefaultHandler((error, dom) => {
    if (error != null) {
      console.log('Parse error', error);
      return;
    }

    onResult(analyzeTootDom(settings, dom, isAdmin));
  });

  const parser = new HtmlParser.Parser(handler);
  parser.parseComplete(toot);
};

export default parseToot;
