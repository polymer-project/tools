/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {assert} from 'chai';
import * as fs from 'fs';
import {Document, Element, Node, ParentNode, parse, serialize, TextNode} from 'parse5';
import * as treeAdapter from 'parse5/lib/tree-adapters/default';
import * as path from 'path';

import * as dom5 from '../index';

import {fixturesDir} from './utils';

/// <reference path="mocha" />

suite('walking', () => {
  const docText: string = `
<!DOCTYPE html>
<link rel="import" href="polymer.html">
<dom-module id="my-el">
<template>
  <img src="foo.jpg">
  <a href="next-page.html">Anchor</a>
  sample element
  <!-- comment node -->
</template>
<div>
  <a href="another-anchor">Anchor2</a>
</div>
</dom-module>
<script>Polymer({is: "my-el"})</script>
`.replace(/  /g, '');
  let doc: Document;

  setup(() => {
    doc = parse(docText) as Document;
  });

  test('nodeWalkAncestors', () => {
    // doc -> dom-module -> div -> a
    const anchor = ((((doc.childNodes![1] as Element).childNodes![1] as Element)
                         .childNodes![0] as Element)
                        .childNodes![3] as Element)
                       .childNodes![1] as Element;

    assert(dom5.predicates.hasTagName('a')(anchor));
    const domModule = dom5.nodeWalkAncestors(
        anchor, dom5.predicates.hasTagName('dom-module'));
    assert(domModule);
    const theLinkIsNotAnAncestor =
        dom5.nodeWalkAncestors(anchor, dom5.predicates.hasTagName('link'));
    assert.equal(theLinkIsNotAnAncestor, undefined);
  });

  test('nodeWalk', () => {
    // doc -> body -> dom-module -> template
    const template =
        (((doc.childNodes![1] as Element).childNodes![1] as Element)
             .childNodes![0] as Element)
            .childNodes![1] as Element;
    const templateContent = treeAdapter.getTemplateContent(template);

    const textNode = dom5.predicates.AND(
        dom5.isTextNode, dom5.predicates.hasTextValue('\nsample element\n'));

    // 'sample element' text node
    let expected = templateContent.childNodes![4];
    let actual = dom5.nodeWalk(doc, textNode, dom5.childNodesIncludeTemplate);
    assert.equal(actual, expected);

    // <!-- comment node -->
    expected = templateContent.childNodes![5];
    actual = dom5.nodeWalk(
        template, dom5.isCommentNode, dom5.childNodesIncludeTemplate);
    assert.equal(actual, expected);
  });

  test('query', () => {
    const fn = dom5.predicates.AND(
        dom5.predicates.hasTagName('link'),
        dom5.predicates.hasAttrValue('rel', 'import'),
        dom5.predicates.hasAttr('href'));
    const expected = ((doc.childNodes![1] as Element).childNodes![0] as Element)
                         .childNodes![0] as Element;
    const actual = dom5.query(doc, fn);
    assert.equal(actual, expected);
  });

  test('nodeWalkAll', () => {
    const empty = dom5.predicates.AND(dom5.isTextNode, function(node) {
      return !/\S/.test((node as TextNode).value!);
    });

    // serialize to count for inserted <head> and <body>
    const serializedDoc = serialize(doc);
    // subtract one to get "gap" number
    const expected = serializedDoc.split('\n').length - 1;
    // add two for normalized text node "\nsample text\n"
    const actual =
        dom5.nodeWalkAll(doc, empty, [], dom5.childNodesIncludeTemplate)
            .length +
        2;

    assert.equal(actual, expected);
  });

  test('queryAll', () => {
    const fn = dom5.predicates.AND(
        dom5.predicates.OR(
            dom5.predicates.hasAttr('href'), dom5.predicates.hasAttr('src')),
        dom5.predicates.NOT(dom5.predicates.hasTagName('link')));

    // doc -> body -> dom-module -> template
    const template =
        (((doc.childNodes![1] as Element).childNodes![1] as Element)
             .childNodes![0] as Element)
            .childNodes![1] as Element;
    const templateContent = treeAdapter.getTemplateContent(template);

    // img
    const expected_1 = templateContent.childNodes![1];
    // anchor
    const expected_2 = templateContent.childNodes![3];
    const actual = dom5.queryAll(doc, fn, [], dom5.childNodesIncludeTemplate);

    assert.equal(actual.length, 3);
    assert.equal(actual[0], expected_1);
    assert.equal(actual[1], expected_2);
  });
  suite('NodeWalkAllPrior', () => {
    const docText = fs.readFileSync(
        path.join(fixturesDir, 'multiple-comments.html'), 'utf8');
    let doc: Document;

    setup(() => {
      doc = parse(docText) as Document;
    });

    test('nodeWalkAllPrior', () => {
      const domModule = dom5.nodeWalkAll(
          doc, dom5.predicates.hasAttrValue('id', 'test-element'))[0];
      const comments = dom5.nodeWalkAllPrior(domModule as Element, dom5.isCommentNode);
      assert.include(dom5.getTextContent(comments[0]), 'test element');
      assert.include(
          dom5.getTextContent(comments[1]), 'hash or path based routing');
      assert.include(
          dom5.getTextContent(comments[2]), 'core-route-selectable.html');
      assert.include(
          dom5.getTextContent(comments[comments.length - 1]),
          'The Polymer Project Authors');
    });
  });
});
