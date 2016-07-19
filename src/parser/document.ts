/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {Analyzer} from '../analyzer';
import {ImportDescriptor} from '../ast/ast';

export class Document<T> {

  private _analyzer: Analyzer;

  url: string;
  contents: string;
  ast: T;
  imports: ImportDescriptor[];
  inlineDocuments: Document<any>[];

  constructor(from: DocumentInit<T>) {
    this._analyzer = from.analyzer;
    this.url = from.url;
    this.contents = from.contents;
    this.ast = from.ast;
    this.imports = from.imports;
    this.inlineDocuments = from.inlineDocuments;
  }

  loadImports(): Promise<Document<any>[]> {
    return <Promise<Document<any>[]>><any>Promise.all(
        this.imports.map((i) => this._analyzer.loadDocument(i.url)));
  }
}

export interface DocumentInit<T> {
  analyzer: Analyzer;
  url: string;
  contents: string;
  ast: T;
  imports: ImportDescriptor[];
  inlineDocuments: Document<any>[];
}
