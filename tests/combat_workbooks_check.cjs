'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),context=vm.createContext({});
for(const file of [...JSON.parse(fs.readFileSync(path.join(root,'data/simulator-modules.json'),'utf8')),'tests/combat_workbooks_cases.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const result=vm.runInContext('BondWorkbookTests.run()',context,{timeout:120000});
process.stdout.write(JSON.stringify(result,null,2));
