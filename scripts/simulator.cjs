/* Offline Node compatibility probe. No server, sockets, identity or rewards. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const modules=JSON.parse(fs.readFileSync(path.join(root,'data/simulator-modules.json'),'utf8'));
const count=Number(process.argv[2]||1000);if(!Number.isInteger(count)||count<1||count>2000)throw Error('Corpus count must be 1..2000');
const context=vm.createContext({});
vm.runInContext("Math.random=()=>{throw Error('Unseeded RNG');};Date.now=()=>{throw Error('Wall clock');};",context);
for(const name of [...modules,'tests/runtime_cases.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name,timeout:10000});
const hashes=[],timings=[],groupTicks=[];
for(let i=0;i<count;i++){
 const start=process.hrtime.bigint();const result=vm.runInContext('BondRuntimeFixtures.run('+i+')',context,{timeout:10000});const ms=Number(process.hrtime.bigint()-start)/1e6;
 const canonical=context.BondRuntimeFixtures.canonical(result);hashes.push(crypto.createHash('sha256').update(canonical).digest('hex'));timings.push(ms);
 if(i%10===0)groupTicks.push(ms/result.tick);
}
const percentile=(xs,p)=>[...xs].sort((a,b)=>a-b)[Math.min(xs.length-1,Math.floor(xs.length*p))];
const report={runtime:process.version,platform:process.platform,arch:process.arch,count,hashes,sourceHashes:Object.fromEntries(modules.map(n=>[n,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex')])),cpu:{replayP95ms:percentile(timings,.95),replayMaxMs:Math.max(...timings),groupMeanTickP95ms:percentile(groupTicks,.95)},limits:'Local CPU probe; average tick cost is not host scheduling/network/DB latency or a capacity certificate.'};
process.stdout.write(JSON.stringify(report));
