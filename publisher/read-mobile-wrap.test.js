import test from 'node:test';
import assert from 'node:assert/strict';
import {editorialSkin} from './editorial-skin.js';

test('READ paragraphs wrap long sourced text instead of overflowing mobile width',()=>{
 assert.match(editorialSkin,/article p\\{[^}]*overflow-wrap:anywhere/);
 assert.doesNotMatch(editorialSkin,/article p\\{[^}]*overflow:hidden/);
});
