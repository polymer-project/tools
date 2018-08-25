/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   lib/utils/html-tag.html
 */

/// <reference path="boot.d.ts" />

/**
 * Class representing a static string value which can be used to filter
 * strings by asseting that they have been created via this class. The
 * `value` property returns the string passed to the constructor.
 */
declare class LiteralString {
  value: string;
  constructor(string: any);

  /**
   * @returns LiteralString string value
   */
  toString(): string;
}

declare namespace Polymer {


  /**
   * A template literal tag that creates an HTML <template> element from the
   * contents of the string.
   *
   * This allows you to write a Polymer Template in JavaScript.
   *
   * Templates can be composed by interpolating `HTMLTemplateElement`s in
   * expressions in the JavaScript template literal. The nested template's
   * `innerHTML` is included in the containing template.  The only other
   * values allowed in expressions are those returned from `Polymer.htmlLiteral`
   * which ensures only literal values from JS source ever reach the HTML, to
   * guard against XSS risks.
   *
   * All other values are disallowed in expressions to help prevent XSS
   * attacks; however, `Polymer.htmlLiteral` can be used to compose static
   * string values into templates. This is useful to compose strings into
   * places that do not accept html, like the css text of a `style`
   * element.
   *
   * Example:
   *
   *     static get template() {
   *       return Polymer.html`
   *         <style>:host{ content:"..." }</style>
   *         <div class="shadowed">${this.partialTemplate}</div>
   *         ${super.template}
   *       `;
   *     }
   *     static get partialTemplate() { return Polymer.html`<span>Partial!</span>`; }
   *
   * @returns Constructed HTMLTemplateElement
   */
  function html(strings: TemplateStringsArray|string[], ...values: any[]): HTMLTemplateElement;


  /**
   * An html literal tag that can be used with `Polymer.html` to compose.
   * a literal string.
   *
   * Example:
   *
   *     static get template() {
   *       return Polymer.html`
   *         <style>
   *           :host { display: block; }
   *           ${styleTemplate}
   *         </style>
   *         <div class="shadowed">${staticValue}</div>
   *         ${super.template}
   *       `;
   *     }
   *     static get styleTemplate() { return Polymer.htmlLiteral`.shadowed { background: gray; }`; }
   *
   * @returns Constructed literal string
   */
  function htmlLiteral(strings: TemplateStringsArray|string[], ...values: any[]): LiteralString;
}
