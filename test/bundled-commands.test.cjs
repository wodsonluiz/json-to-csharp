const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

test('every advertised command executes from the actual bundle and is available in all entry points',async()=>{
  const commands=new Map();const writes=[];
  class FileSystemError extends Error {constructor(){super('not found');this.code='FileNotFound';}}
  const uri = filePath => ({scheme:'file',path:filePath,fsPath:filePath,with(change){return uri(change.path);}});
  const vscode={FileSystemError,Uri:{file:uri},commands:{registerCommand:(name,fn)=>{commands.set(name,fn);return{dispose(){}};}},
    workspace:{fs:{readFile:async()=>Buffer.from('{"employee":{"name":"Ada","skills":["C#"]}}'),stat:async()=>{throw new FileSystemError();},writeFile:async(uri,data)=>writes.push({path:uri.path,text:data.toString()})},openTextDocument:async uri=>uri},
    window:{showTextDocument:async()=>{},showErrorMessage:message=>assert.fail(message)}};
  const filename=path.resolve('dist/extension.js');const m=new Module(filename);const localRequire=Module.createRequire(filename);
  m.require=name=>name==='vscode'?vscode:localRequire(name);m._compile(fs.readFileSync(filename,'utf8'),filename);
  const context={subscriptions:[]};m.exports.activate(context);
  const manifest=require('../package.json');assert.equal(context.subscriptions.length,4);
  const expected={
    'json-to-csharp.convert':[/Employee.cs$/,/public class Employee/],
    'json-to-csharp.convertToRecord':[/example.record.cs$/,/public record Employee/],
    'json-to-csharp.convertToYaml':[/example.yml$/,/"employee":/],
    'json-to-csharp.convertToXml':[/example.xml$/,/<json type="object">/]
  };
  for(const [id,[file,content]] of Object.entries(expected)) {
    assert.ok(manifest.contributes.commands.some(c=>c.command===id));
    assert.ok(manifest.activationEvents.includes('onCommand:'+id));
    for(const menu of ['editor/context','explorer/context'])assert.ok(manifest.contributes.menus[menu].some(c=>c.command===id));
    await commands.get(id)(uri('/tmp/example.json'));
    const written=writes.at(-1);assert.match(written.path,file);assert.match(written.text,content);
  }
  assert.equal(writes.length,4);
});
