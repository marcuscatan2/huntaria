"""Read-only local balance probe for the fixed expedition regression seed."""
import json
from browser_check import ROOT,find_browser,sync_playwright
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser('chrome'),headless=True)
    page=browser.new_page()
    page.goto(ROOT.joinpath('index.html').as_uri())
    page.wait_for_function('!!window.BondApp')
    print(json.dumps(page.evaluate('''()=>{
      const s=BondProfile.normalize({version:5,owned:['emberfox','stonehorn'],xp:{emberfox:4500,stonehorn:4500},attributes:{str:1,agi:1,vit:11,int:21,dex:1,leadership:6}});
      const e=BondExpeditionData.make('clearing','forest',123,9,1),rows=[];
      for(const type of ['druid','mage'])for(const skills of [BondGame.UNITS[type].default, type==='druid'?['bramble','renewal','bark']:['hex','comet','aegis']])for(const mastery of [false,true]){
        const build=BondGame.defaultBuild();build[0][0]={type,skills};
        const growth=mastery?Object.fromEntries(build[0].map(u=>[u.type,{bond:5,might:4,guard:3}])):{};
        for(const enc of e.steps){if(enc.team)build[1]=enc.team;const b=new BondGame.Battle(build,{profile:s,growth,enemyLevel:9,encounter:enc.kind?enc:null}).run();rows.push({type,skills,mastery,enc:enc.id,enemy:enc.team?.map(u=>u.type)||enc.type,winner:b.winner,time:b.time,reason:b.reason,hp:b.units.map(u=>({type:u.type,side:u.side,hp:u.hp,max:u.maxHp,damage:u.damage,heal:u.healing}))});}
      }
      return {attributes:s.attributes,rows};
    }''')),flush=True)
    browser.close()
