const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');

function harness({json='{"value":1}',exists=false,answer='Yes',statError,unsaved=false}={}) {
  let execute;const writes=[];const errors=[];const warnings=[];
  class FileSystemError extends Error {constructor(code){super(code);this.code=code;}}
  const uri={scheme:unsaved?'untitled':'file',path:'/demo/example.json',with(change){return {...this,...change};}};
  const vscode={FileSystemError,commands:{registerCommand:(_name,handler)=>{execute=handler;return{dispose(){}};}},
    workspace:{fs:{readFile:async()=>Buffer.from(json),stat:async()=>{if(statError)throw new FileSystemError(statError);if(!exists)throw new FileSystemError('FileNotFound');},writeFile:async(uri,data)=>writes.push({uri,text:data.toString()})},openTextDocument:async uri=>uri},
    window:{activeTextEditor:{document:{uri,getText:()=>json}},showErrorMessage:message=>errors.push(message),showWarningMessage:async message=>{warnings.push(message);return answer;},showTextDocument:async()=>{}}};
  const filename=path.resolve('out/textConversionCommand.js');const m=new Module(filename);m.require=name=>name==='vscode'?vscode:require(name);m._compile(fs.readFileSync(filename,'utf8'),filename);
  m.exports.registerTextConversion({subscriptions:[]},{command:'test.convert',extension:'.yml',convert:()=> 'converted'});
  return {run:explorer=>execute(explorer?uri:undefined),writes,errors,warnings};
}

test('text conversion works through editor and Explorer', async()=>{
  for(const explorer of [false,true]) {const h=harness();await h.run(explorer);assert.equal(h.writes[0].uri.path,'/demo/example.yml');assert.equal(h.errors.length,0);}
});
test('text conversion confirms overwrite and respects cancellation', async()=>{
  for(const answer of ['Yes','No',undefined]) {const h=harness({exists:true,answer:answer??'Cancel'});await h.run(true);assert.equal(h.writes.length,answer==='Yes'?1:0);assert.equal(h.warnings.length,1);}
});
test('invalid, empty, unsaved and inaccessible input never writes',async()=>{
  for(const options of [{json:'{'},{json:' '},{unsaved:true},{statError:'NoPermissions'}]) {const h=harness(options);await h.run(false);assert.equal(h.writes.length,0);assert.equal(h.errors.length,1);}
});
