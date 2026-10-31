const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {generateCSharpRecords} = require('../out/csharpRecordGenerator');

test('records retain inferred DTO names, nested types, collections and nullable values',async()=>{
  const json=JSON.stringify({employee:{name:'Ada',address:{city:'London'},tags:['a',null],visits:[{age:30,note:'first'},{age:null}]}});
  const code=await generateCSharpRecords(json,'Fallback');
  assert.match(code,/public record Employee/);
  assert.match(code,/public record Address/);
  assert.match(code,/public record Visit/);
  assert.match(code,/string\?\[\] Tags/);
  assert.match(code,/long\? Age/);
  assert.match(code,/string\? Note/);
  assert.match(code,/get; init;/);
  assert.doesNotMatch(code,/get; set;|JsonProperty|JsonConvert|Newtonsoft|partial class/);
});

test('top-level arrays, primitives and null generate a named Value DTO',async()=>{
  for(const json of ['[1,2]','null','true','42','"hello"']) {
    const code=await generateCSharpRecords(json,'Document');
    assert.match(code,/public record Document/);assert.match(code,/ Value \{ get; init; \}/);
  }
  await assert.rejects(generateCSharpRecords('{','Document'));
});

test('generated records compile as C# 9 with nullable warnings treated as errors',async t=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'json-csharp-records-'));
  t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
  const code=await generateCSharpRecords(JSON.stringify({employee:{name:'Ada',address:{city:'London'},tags:['a',null],visits:[{age:30,note:'first'},{age:null}],mixed:[1,'x',null],created:'2026-10-31T12:00:00Z',unknown:null}}),'Document');
  fs.writeFileSync(path.join(directory,'Generated.cs'),code);
  fs.writeFileSync(path.join(directory,'global.json'),JSON.stringify({sdk:{version:'8.0.100',rollForward:'latestFeature'}}));
  fs.writeFileSync(path.join(directory,'Records.csproj'),'<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>net8.0</TargetFramework><LangVersion>9.0</LangVersion><Nullable>enable</Nullable><TreatWarningsAsErrors>true</TreatWarningsAsErrors></PropertyGroup></Project>');
  fs.writeFileSync(path.join(directory,'NuGet.config'),'<configuration><packageSources><clear /></packageSources></configuration>');
  const result=spawnSync('dotnet',['build','--nologo','--verbosity','quiet'],{cwd:directory,encoding:'utf8',timeout:120000,env:{...process.env,DOTNET_CLI_HOME:directory,DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_NOLOGO:'1'}});
  assert.equal(result.status,0,result.error?.message||result.stdout+result.stderr);
});
