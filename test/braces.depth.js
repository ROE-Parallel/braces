'use strict';

require('mocha');
const assert = require('assert');
const braces = require('..');

const nestedBraces = depth => '{'.repeat(depth) + 'a,b' + '}'.repeat(depth);
const nestedParens = depth => '('.repeat(depth) + 'a' + ')'.repeat(depth);

describe('max nesting depth', () => {
  it('should accept brace nesting up to the default limit', () => {
    assert.doesNotThrow(() => braces.parse(nestedBraces(100)));
    assert.doesNotThrow(() => braces.compile(nestedBraces(100)));
  });

  it('should throw a SyntaxError when brace nesting exceeds the default limit', () => {
    assert.throws(() => braces.parse(nestedBraces(101)), SyntaxError);
  });

  it('should throw a SyntaxError, not a RangeError, for very deep brace nesting', () => {
    for (const depth of [3500, 4000, 4900]) {
      assert.throws(() => braces(nestedBraces(depth)), SyntaxError);
      assert.throws(() => braces.compile(nestedBraces(depth)), SyntaxError);
      assert.throws(() => braces.expand(nestedBraces(depth)), SyntaxError);
    }
  });

  it('should throw a SyntaxError for very deep parentheses nesting', () => {
    assert.throws(() => braces.parse(nestedParens(101)), SyntaxError);
    assert.throws(() => braces.compile(nestedParens(4900)), SyntaxError);
  });

  it('should count mixed braces and parentheses together', () => {
    const mixed = '{('.repeat(60) + 'a' + ')}'.repeat(60);
    assert.throws(() => braces.parse(mixed), SyntaxError);
  });

  it('should allow lowering the limit with options.maxDepth', () => {
    assert.throws(() => braces.parse(nestedBraces(5), { maxDepth: 4 }), SyntaxError);
    assert.doesNotThrow(() => braces.parse(nestedBraces(4), { maxDepth: 4 }));
  });

  it('should not allow raising the limit above the default with options.maxDepth', () => {
    assert.throws(() => braces.parse(nestedBraces(101), { maxDepth: 100000 }), SyntaxError);
  });

  it('should not affect ordinary patterns', () => {
    assert.deepEqual(braces.expand('a{b,c{d,e}}f'), ['abf', 'acdf', 'acef']);
    assert.deepEqual(braces.expand('{1..3}'), ['1', '2', '3']);
    assert.deepEqual(braces('a{b,c}d'), ['a(b|c)d']);
  });
});
