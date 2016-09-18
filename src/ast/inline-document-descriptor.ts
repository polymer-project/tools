/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
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

import * as dom5 from 'dom5';
import * as parse5 from 'parse5';
import {ASTNode} from 'parse5';
import * as util from 'util';

import * as jsdoc from '../javascript/jsdoc';

import {ScannedDocument} from './document';
import {ScannedFeature} from './scanned-feature';
import {Position, SourceRange} from './source-range';

export interface LocationOffset {
  /** Zero based line index. */
  line: number;
  /** Zero based column index. */
  col: number;
  /**
   * The url of the source file.
   */
  filename?: string;
}

/**
 * Represents an inline document, usually a <script> or <style> tag in an HTML
 * document.
 *
 * @template N The AST node type
 */
export class InlineParsedDocument implements ScannedFeature {
  type: 'html'|'javascript'|'css'|/* etc */ string;

  contents: string;

  /** The location offset of this document within the containing document. */
  locationOffset: LocationOffset;
  attachedComment?: string;

  scannedDocument?: ScannedDocument;

  sourceRange: SourceRange;

  constructor(
      type: string, contents: string, locationOffset: LocationOffset,
      attachedComment: string, sourceRange: SourceRange) {
    this.type = type;
    this.contents = contents;
    this.locationOffset = locationOffset;
    this.attachedComment = attachedComment;
    this.sourceRange = sourceRange;
  }
}

/**
 * Corrects source ranges based on an offset.
 *
 * Source ranges for inline documents need to be corrected relative to their
 * positions in their containing documents.
 *
 * For example, if a <script> tag appears in the fifth line of its containing
 * document, we need to move all the source ranges inside that script tag down
 * by 5 lines. We also need to correct the column offsets, but only for the
 * first line of the <script> contents.
 */
export function correctSourceRange(
    sourceRange?: SourceRange, locationOffset?: LocationOffset): SourceRange|
    undefined {
  if (!locationOffset || !sourceRange) {
    return sourceRange;
  }
  return {
    file: locationOffset.filename || sourceRange.file,
    start: correctPosition(sourceRange.start, locationOffset),
    end: correctPosition(sourceRange.end, locationOffset)
  };
}

export function correctPosition(
    position: Position, locationOffset: LocationOffset): Position {
  return {
    line: position.line + locationOffset.line,
    column: position.column + (position.line === 0 ? locationOffset.col : 0)
  };
}

export function getAttachedCommentText(node: ASTNode): string|undefined {
  // When the element is defined in a document fragment with a structure of
  // imports -> comment explaining the element -> then its dom-module, the
  // comment will be attached to <head>, rather than being a sibling to the
  // <dom-module>, thus the need to walk up and previous so aggressively.
  const parentComments = dom5.nodeWalkAllPrior(node, dom5.isCommentNode);
  const comment = <string|undefined>(
      parentComments[0] ? parentComments[0]['data'] : undefined);
  if (!comment || /@license/.test(comment)) {
    return;
  }
  return jsdoc.unindent(comment).trim();
}

function isLocationInfo(
    loc: (parse5.LocationInfo | parse5.ElementLocationInfo)):
    loc is parse5.LocationInfo {
  return 'line' in loc;
}

export function getLocationOffsetOfStartOfTextContent(node: ASTNode):
    LocationOffset {
  let firstChildNodeWithLocation = node.childNodes.find(n => !!n.__location);
  let bestLocation = firstChildNodeWithLocation ?
      firstChildNodeWithLocation.__location :
      node.__location;
  if (!bestLocation) {
    throw new Error(
        `Couldn't extract a location offset from HTML node: ` +
        `${util.inspect(node)}`);
  }
  if (isLocationInfo(bestLocation)) {
    return {line: bestLocation.line - 1, col: bestLocation.col};
  } else {
    return {
      line: bestLocation.startTag.line - 1,
      col: bestLocation.startTag.endOffset,
    };
  }
}
