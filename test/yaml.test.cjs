const {test} = require('node:test');
const assert = require('node:assert/strict');
const YAML = require('yaml');
const {jsonToYaml} = require('../out/yamlConverter');

test('YAML preserves JSON objects, arrays, primitives and nesting', () => {
  for (const value of [{employee:{name:'Ada',active:true,tags:['yes','2026-01-01'],meta:null}},[1,false,{x:'a: b'}],null,true,42,1.5,'hello',{},[]]) {
    assert.deepEqual(YAML.parse(jsonToYaml(JSON.stringify(value))),value);
  }
});
test('YAML escapes keys, prototype-like names and multiline strings as data', () => {
  const json='{"__proto__":{"safe":true},"a: b":"<tag>&\\nnext","yes":"false"}';
  assert.deepEqual(YAML.parse(jsonToYaml(json)),JSON.parse(json));
  assert.equal({}.safe,undefined);
});
test('YAML keeps large integers exact and rejects non-JSON input', () => {
  assert.equal(YAML.parse(jsonToYaml('{"id":9007199254740993}'),{intAsBigInt:true}).id,9007199254740993n);
  for (const invalid of ['', '{', 'a: 1', '!!js/function foo']) assert.throws(()=>jsonToYaml(invalid));
});
