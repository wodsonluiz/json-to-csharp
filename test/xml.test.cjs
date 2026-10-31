const {test} = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {jsonToXml} = require('../out/xmlConverter');
const decoder=`import sys,json,xml.etree.ElementTree as E
root=E.fromstring(sys.stdin.read())
def value(e):
 t=e.attrib['type']
 if t=='object': return {c.attrib.get('name',c.tag):value(c) for c in e}
 if t=='array':
  assert all(c.tag=='item' and c.attrib['index']==str(i) for i,c in enumerate(e))
  return [value(c) for c in e]
 if t=='null': return None
 if t=='boolean': return e.text=='true'
 if t=='number': return json.loads(e.text)
 assert t=='string'
 return e.text or ''
assert root.tag=='json'
print(json.dumps(value(root)))`;
function roundtrip(json){
 const result=spawnSync('python3',['-c',decoder],{input:jsonToXml(json),encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
}
test('XML parses and round-trips nested JSON, arrays and primitive types',()=>{
 for(const value of [{employee:{name:'Ada',active:true,roles:['dev',null],empty:{},list:[]}},[1,2.5,false,'',null],null,'hello',true,42,{}]) {
  assert.deepEqual(roundtrip(JSON.stringify(value)),value);
 }
});
test('XML preserves invalid, reserved and colliding element names in name attributes',()=>{
 const json='{"":1,"1st":2,"a b":3,"a:b":4,"xmlns":5,"café":6,"member":7,"a\\nb\\t":8,"__proto__":9}';
 assert.deepEqual(roundtrip(json),JSON.parse(json));assert.equal({}.polluted,undefined);
});
test('XML injection payloads and XML metacharacters remain string data',()=>{
 const value={'\"/><evil/>':'</json><evil attr="x">&\'<!DOCTYPE x [<!ENTITY e SYSTEM "file:///not-read">]>','lines':'a\r\nb\tc','emoji':'🌿'};
 const json=JSON.stringify(value);const xml=jsonToXml(json);
 assert.doesNotMatch(xml,/<!DOCTYPE|<!ENTITY|<evil/);assert.deepEqual(roundtrip(json),value);
});
test('XML preserves large integers and rejects malformed JSON or invalid XML characters',()=>{
 assert.match(jsonToXml('{"id":9007199254740993}'),/>9007199254740993<\/id>/);
 for(const invalid of ['{','', 'null trailing','"\\u0000"','"\\ud800"','"\\ufffe"','1e999'])assert.throws(()=>jsonToXml(invalid));
});
