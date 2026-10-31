const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseJsonAndDetermineRoot } = require('../out/jsonParser');
const { generateCSharpClasses } = require('../out/csharpGenerator');
const { extractAndFormatClasses } = require('../out/csharpFormatter');

test('single root produces the documented DTO without serialization helpers', async () => {
  const { rootName, sample } = await parseJsonAndDetermineRoot(
    '{"employee":{"name":"John","salary":56000,"married":true}}', 'Fallback');
  assert.equal(rootName, 'Employee');
  const result = extractAndFormatClasses(await generateCSharpClasses(rootName, sample));
  assert.match(result, /public class Employee/);
  for (const property of ['string Name', 'long Salary', 'bool Married']) assert.ok(result.includes(property));
  assert.doesNotMatch(result, /partial|JsonProperty|JsonConvert|namespace/);
});

test('multiple roots, arrays and null retain the filename root', async () => {
  for (const sample of ['{"a":1,"b":true}', '[{"id":1}]', 'null']) {
    assert.deepEqual(await parseJsonAndDetermineRoot(sample, 'Document'), {rootName:'Document', sample});
  }
});

test('invalid JSON is rejected', async () => {
  await assert.rejects(parseJsonAndDetermineRoot('{', 'Document'), SyntaxError);
});

test('formatter retains nested class bodies and removes duplicate classes', () => {
  const result = extractAndFormatClasses('public partial class Item { public string Name { get; set; } }\npublic partial class Item { }');
  assert.equal(result, 'public class Item { public string Name { get; set; } }');
});

test('packaged bundle registers and executes the conversion command', async () => {
  const fs = require('node:fs');
  const {createRequire} = require('node:module');
  const bundleRequire = createRequire(require('node:path').resolve('dist/extension.js'));
  let command;
  let written;
  const vscode = {
    commands: {registerCommand(name, callback) { assert.equal(name, 'json-to-csharp.convert'); command=callback; return {dispose(){}}; }},
    Uri: {file: fsPath => ({fsPath})},
    workspace: {
      fs: {readFile: async () => Buffer.from('{"employee":{"name":"John"}}'), stat: async () => {throw new Error('missing');}, writeFile: async (uri, data) => { written={uri,data}; }},
      openTextDocument: async uri => uri
    },
    window: {showTextDocument: async () => {}, showErrorMessage: message => assert.fail(message)}
  };
  const Module = require('node:module');
  const bundledModule = new Module(require('node:path').resolve('dist/extension.js'));
  bundledModule.require = name => name === 'vscode' ? vscode : bundleRequire(name);
  bundledModule._compile(fs.readFileSync('dist/extension.js','utf8'), bundledModule.id);
  const context={subscriptions:[]}; bundledModule.exports.activate(context);
  assert.equal(context.subscriptions.length,1);
  await command({fsPath:'/tmp/employee.json'});
  assert.equal(written.uri.fsPath,'/tmp/Employee.cs');
  assert.match(written.data.toString(),/public class Employee/);
});
