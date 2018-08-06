/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   paper-button.js
 */

import {PaperButtonBehavior, PaperButtonBehaviorImpl} from '@polymer/paper-behaviors/paper-button-behavior.js';

import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';

import {html} from '@polymer/polymer/polymer-legacy.js';

import {LegacyElementMixin} from '@polymer/polymer/lib/legacy/legacy-element-mixin.js';

interface PaperButtonElement extends PaperButtonBehavior, LegacyElementMixin, HTMLElement {

  /**
   * If true, the button should be styled with a shadow.
   */
  raised: boolean|null|undefined;
  _template: template|null;
  _calculateElevation(): void;
}

declare global {

  interface HTMLElementTagNameMap {
    "paper-button": PaperButtonElement;
  }
}
