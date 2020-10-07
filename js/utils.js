
const Utils = {

    /**
   * Escapes any occurances of &, ", <, > or / with XML entities.
   *
   * @param {string} str
   *        The string to escape.
   * @return {string} The escaped string.
   */
  escapeXML(str) {
    const replacements = { "&": "&amp;", "\"": "&quot;", "'": "&apos;", "<": "&lt;", ">": "&gt;", "/": "&#x2F;" };
    return String(str).replace(/[&"'<>/]/g, m => replacements[m]);
  },


    /**
   * A tagged template function which escapes any XML metacharacters in
   * interpolated values.
   *
   * @param {Array<string>} strings
   *        An array of literal strings extracted from the templates.
   * @param {Array} values
   *        An array of interpolated values extracted from the template.
   * @returns {string}
   *        The result of the escaped values interpolated with the literal
   *        strings.
   */
  escaped(strings, ...values) {
    const result = [];

    for (const [i, string] of strings.entries()) {
      result.push(string);
      if (i < values.length)
        result.push(this.escapeXML(values[i]));
    }

    return result.join("");
  }

}