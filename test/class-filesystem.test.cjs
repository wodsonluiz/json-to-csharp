const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

function harness({scheme='file',statCode,statError,readError,exists=false,answer='Yes'}={}) {
  const writes=[], errors=[], warnings=[], reads=[];
  class FileSystemError extends Error {constructor(code){super(code);this.code=code;}}
  const source={scheme,authority:'server',path:'/data/example.json',fsPath:'/data/example.json',
    query:'provider=one',fragment:'section',with(change){return {...this,...change};}};
  const json='{"employee":{"name":"Ada"}}';
  const vscode={FileSystemError,commands:{registerCommand(name,fn){if(name==='json-to-csharp.convert')execute=fn;return{dispose(){}};}},
    workspace:{fs:{
      readFile:async uri=>{reads.push(uri);if(readError)throw new Error('read unavailable');return Buffer.from(json);},
      stat:async()=>{if(statError)throw new Error('provider failure');if(statCode)throw new FileSystemError(statCode);if(!exists)throw new FileSystemError('FileNotFound');},
      writeFile:async(uri,data)=>writes.push({uri,text:data.toString()})
    },openTextDocument:async uri=>uri},
    window:{activeTextEditor:{document:{uri:source,getText:()=>json}},showTextDocument:async()=>{},
      showErrorMessage:message=>errors.push(message),showWarningMessage:async message=>{warnings.push(message);return answer;}}};
  let execute;
  const filename=path.resolve('dist/extension.js'),m=new Module(filename),localRequire=Module.createRequire(filename);
  m.require=name=>name==='vscode'?vscode:localRequire(name);
  m._compile(fs.readFileSync(filename,'utf8'),filename);
  m.exports.activate({subscriptions:[]});
  return {run:explorer=>execute(explorer?source:undefined),source,writes,errors,warnings,reads};
}

test('Class conversion preserves file and remote provider URIs through editor and Explorer',async()=>{
  for(const scheme of ['file','vscode-remote']) for(const explorer of [false,true]) {
    const h=harness({scheme});await h.run(explorer);
    assert.equal(h.errors.length,0);assert.equal(h.writes.length,1);
    assert.deepEqual(h.writes[0].uri,{...h.source,path:'/data/Employee.cs'});
    assert.match(h.writes[0].text,/public class Employee/);
  }
});
test('Class conversion never writes after permission, unavailable or unknown destination errors',async()=>{
  for(const options of [{statCode:'NoPermissions'},{statCode:'Unavailable'},{statError:true}]) {
    const h=harness(options);await h.run(true);
    assert.equal(h.writes.length,0);assert.equal(h.errors.length,1);assert.equal(h.warnings.length,0);
  }
});
test('Class conversion reports Explorer read failures without rejecting the command',async()=>{
  const h=harness({readError:true});await assert.doesNotReject(h.run(true));
  assert.equal(h.writes.length,0);assert.deepEqual(h.errors,['Conversion failed: read unavailable']);
});
test('Class conversion requires unsaved JSON to be saved before accessing the filesystem',async()=>{
  for(const explorer of [false,true]) {const h=harness({scheme:'untitled'});await h.run(explorer);
    assert.equal(h.reads.length,0);assert.equal(h.writes.length,0);
    assert.deepEqual(h.errors,['Save the JSON file before converting']);}
});
test('Class conversion confirms existing destinations and respects cancellation',async()=>{
  for(const answer of ['Yes','No','Cancel']) {
    const h=harness({exists:true,answer});await h.run(true);
    assert.equal(h.warnings.length,1);assert.equal(h.writes.length,answer==='Yes'?1:0);
    assert.equal(h.errors.length,0);
  }
});
