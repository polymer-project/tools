/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {ChildNode, CommentNode, Document, DocumentFragment, Element, Node, ParentNode, TextNode} from 'parse5';

import {getAttribute, getAttributeIndex, getTextContent} from './util';

export {Node};


/**
 * Match the text inside an element, textnode, or comment
 *
 * Note: nodeWalkAll with hasTextValue may return an textnode and its parent if
 * the textnode is the only child in that parent.
 */
function hasTextValue(value: string): Predicate {
  return function(node) {
    return getTextContent(node) === value;
  };
}

export type Predicate = (node: Node) => boolean;

/**
 * OR an array of predicates
 */
function OR(...predicates: Predicate[]): Predicate;
function OR(/* ...rules */): Predicate {
  const rules = new Array<Predicate>(arguments.length);
  for (let i = 0; i < arguments.length; i++) {
    rules[i] = arguments[i];
  }
  return function(node) {
    for (let i = 0; i < rules.length; i++) {
      if (rules[i](node)) {
        return true;
      }
    }
    return false;
  };
}

/**
 * AND an array of predicates
 */
function AND(...predicates: Predicate[]): Predicate;
function AND(/* ...rules */): Predicate {
  const rules = new Array<Predicate>(arguments.length);
  for (let i = 0; i < arguments.length; i++) {
    rules[i] = arguments[i];
  }
  return function(node) {
    for (let i = 0; i < rules.length; i++) {
      if (!rules[i](node)) {
        return false;
      }
    }
    return true;
  };
}

/**
 * negate an individual predicate, or a group with AND or OR
 */
function NOT(predicateFn: Predicate): Predicate {
  return function(node) {
    return !predicateFn(node);
  };
}

/**
 * Returns a predicate that matches any node with a parent matching
 * `predicateFn`.
 */
function parentMatches(predicateFn: Predicate): Predicate {
  return function(node) {
    if (!isChildNode(node)) {
      return false;
    }
    let parent = node.parentNode;
    while (parent !== undefined) {
      if (predicateFn(parent)) {
        return true;
      }
      if (!isChildNode(parent)) {
        return false;
      }
      parent = parent.parentNode;
    }
    return false;
  };
}

function hasAttr(attr: string): Predicate {
  return function(node) {
    if (!isElement(node)) {
      return false;
    }
    return getAttributeIndex(node, attr) > -1;
  };
}

function hasAttrValue(attr: string, value: string): Predicate {
  return function(node) {
    if (!isElement(node)) {
      return false;
    }
    return getAttribute(node, attr) === value;
  };
}

function hasClass(name: string): Predicate {
  return hasSpaceSeparatedAttrValue('class', name);
}

function hasTagName(name: string): Predicate {
  const n = name.toLowerCase();
  return function(node) {
    if (!isElement(node) || !node.tagName) {
      return false;
    }
    return node.tagName.toLowerCase() === n;
  };
}

/**
 * Returns true if `regex.match(tagName)` finds a match.
 *
 * This will use the lowercased tagName for comparison.
 */
function hasMatchingTagName(regex: RegExp): Predicate {
  return function(node) {
    if (!isElement(node) || !node.tagName) {
      return false;
    }
    return regex.test(node.tagName.toLowerCase());
  };
}

export function hasSpaceSeparatedAttrValue(
    name: string, value: string): Predicate {
  return function(element: Node) {
    if (!isElement(element)) {
      return false;
    }
    const attributeValue = getAttribute(element, name);
    if (typeof attributeValue !== 'string') {
      return false;
    }
    return attributeValue.split(' ').indexOf(value) !== -1;
  };
}

export function isDocument(node: Node): node is Document {
  return (node as Document).nodeName === '#document';
}

export function isDocumentFragment(node: Node): node is DocumentFragment {
  return (node as DocumentFragment).nodeName === '#document-fragment';
}

export function isElement(node: Node): node is Element {
  return (node as Element).nodeName === (node as Element).tagName;
}

export function isTextNode(node: Node): node is TextNode {
  return (node as TextNode).nodeName === '#text';
}

export function isCommentNode(node: Node): node is CommentNode {
  return (node as CommentNode).nodeName === '#comment';
}

export function isChildNode(node: Node): node is ChildNode {
  return (node as ChildNode).parentNode !== undefined;
}

export function isParentNode(node: Node): node is ParentNode {
  return (node as ParentNode).childNodes !== undefined;
}

export const predicates = {
  hasClass: hasClass,
  hasAttr: hasAttr,
  hasAttrValue: hasAttrValue,
  hasMatchingTagName: hasMatchingTagName,
  hasSpaceSeparatedAttrValue: hasSpaceSeparatedAttrValue,
  hasTagName: hasTagName,
  hasTextValue: hasTextValue,
  AND: AND,
  OR: OR,
  NOT: NOT,
  parentMatches: parentMatches,
};
