/* Hand-authored content. Every creature has five choices, three active slots,
   and one passive. This file is also loaded by the standalone engine tests. */
(function (root) {
  'use strict';
  const skills = {};
  function skill(id, name, kind, amount, cd, extra = {}) {
    const tag = {hit:'STRIKE',trainer:'TRAINER',frontaoe:'MONSTER AREA',aoe:'AREA',heal:'HEAL',teamheal:'TEAM HEAL',selfheal:'SELF HEAL',shield:'WARD',selfshield:'SELF WARD',teamshield:'TEAM WARD',guard:'PROTECT',haste:'TEAM HASTE',selfhaste:'HASTE',cleanse:'CLEANSE'}[kind];
    const icon = {hit:'◆',trainer:'➶',frontaoe:'✦',aoe:'✦',heal:'✚',teamheal:'✿',selfheal:'✚',shield:'⬡',selfshield:'⬡',teamshield:'⬡',guard:'♜',haste:'»',selfhaste:'»',cleanse:'◇'}[kind];
    let description = {
      hit:`Deal ${amount} damage to your normal target.`, trainer:`Deal ${amount} damage directly to the enemy trainer. Guard can intercept.`,
      frontaoe:`Deal ${amount} damage to enemy monsters in range. Only hit the trainer when no monsters remain.`,
      aoe:`Deal ${amount} damage to every enemy in range, including the trainer.`,
      heal:`Restore ${amount} HP to the ally with the lowest health percentage.`, teamheal:`Restore ${amount} HP to every living ally.`, selfheal:`Restore ${amount} HP to yourself.`,
      shield:`Give the most injured ally a ${amount} HP shield for ${extra.duration}s.`, selfshield:`Gain a ${amount} HP shield for ${extra.duration}s.`, teamshield:`Give each living ally a ${amount} HP shield for ${extra.duration}s.`,
      guard:`Intercept 60% of damage to your trainer, anywhere in the arena, for ${extra.duration}s.`,
      haste:`All allies move and act 30% faster for ${extra.duration}s. Cooldowns are unchanged.`,selfhaste:`Move and act 30% faster for ${extra.duration}s. Cooldowns are unchanged.`,
      cleanse:`Remove Slow and Burn from all allies and heal each for ${amount} HP.`
    }[kind];
    if(extra.effect==='slow') description += ` Slow movement and actions by 40% for ${extra.duration}s.`;
    if(extra.effect==='burn') description += ` Burn for 12 damage per second for ${extra.duration}s.`;
    if(extra.reach) description += ` Reach: ${extra.reach} arena units.`;
    if(kind.includes('shield')) description += ' Shields do not stack; a stronger existing shield is preserved.';
    skills[id] = {name,kind,amount,cd,tag,icon,description,...extra};
  }
  skill('mend','Mend','heal',110,7); skill('bark','Barkskin','shield',140,9,{duration:7}); skill('bramble','Bramble','hit',70,7,{effect:'slow',duration:4});
  skill('renewal','Grove Renewal','teamheal',65,12); skill('entangle','Entangle','frontaoe',55,11,{effect:'slow',duration:3});
  skill('frost','Frostbolt','hit',85,7,{effect:'slow',duration:5}); skill('nova','Arc Nova','aoe',60,10); skill('hex','Crown Hex','trainer',115,9);
  skill('aegis','Arcane Aegis','selfshield',180,12,{duration:6}); skill('comet','Comet','hit',145,11);
  skill('pounce','Pounce','hit',110,6); skill('burn','Cinderbite','hit',45,8,{effect:'burn',duration:5}); skill('pierce','Wild Lunge','hit',105,10,{reach:18});
  skill('quickstep','Quickstep','selfhaste',0,12,{duration:6}); skill('firefan','Firefan','frontaoe',65,11,{effect:'burn',duration:3});
  skill('guard','Bondguard','guard',0,10,{duration:8}); skill('fortify','Fortify','selfshield',200,10,{duration:8}); skill('slam','Pebble Slam','hit',105,8,{effect:'slow',duration:3});
  skill('boulder','Boulder Toss','hit',80,9,{reach:24}); skill('rally','Rallying Ward','teamshield',80,13,{duration:6});
  skill('chain','Chain Spark','frontaoe',85,8); skill('snipe','Skyneedle','trainer',115,10,{reach:46}); skill('gust','Headwind','hit',65,7,{effect:'slow',duration:5});
  skill('staticbolt','Static Bolt','hit',115,8); skill('tailwind','Tailwind','haste',0,13,{duration:4});
  skill('bloom','Little Bloom','heal',125,8); skill('haste','Springstep','haste',0,10,{duration:6}); skill('cleanse','Fresh Start','cleanse',65,9);
  skill('spore','Spore Toss','hit',45,9,{effect:'slow',duration:3}); skill('petalward','Petal Ward','shield',120,10,{duration:8});
  skill('frostbite','Frostbite','hit',85,7,{effect:'slow',duration:4}); skill('icepounce','Ice Pounce','hit',125,9,{reach:18}); skill('snowfall','Snowfall','frontaoe',55,11,{effect:'slow',duration:2});
  skill('snowhide','Snowhide','selfshield',100,12,{duration:6}); skill('packrush','Pack Rush','selfhaste',0,12,{duration:5});
  skill('emberbreath','Ember Breath','frontaoe',65,10,{effect:'burn',duration:4}); skill('fireball','Fireball','hit',105,8); skill('ashveil','Ash Veil','selfshield',130,12,{duration:6});
  skill('scorch','Scorch','hit',55,7,{effect:'burn',duration:5}); skill('wingdraft','Wingdraft','haste',0,13,{duration:4});
  skill('shellguard','Shellguard','guard',0,11,{duration:8}); skill('carapace','Carapace','selfshield',190,12,{duration:8}); skill('shellbash','Shell Bash','hit',95,9,{effect:'slow',duration:3});
  skill('stonewave','Stonewave','frontaoe',65,11); skill('ironward','Iron Ward','shield',140,12,{duration:7});
  skill('antler','Antler Rush','hit',105,8); skill('rootbind','Rootbind','hit',60,9,{effect:'slow',duration:4}); skill('wildguard','Wildguard','guard',0,11,{duration:7});
  skill('greencanopy','Green Canopy','teamshield',65,13,{duration:8}); skill('lifebud','Lifebud','selfheal',80,10);
  skill('springwater','Springwater','heal',110,8); skill('riptide','Riptide','hit',60,8,{effect:'slow',duration:3}); skill('ripples','Healing Ripples','teamheal',55,12);
  skill('rivercleanse','River Cleanse','cleanse',50,11); skill('bubbleward','Bubble Ward','shield',110,10,{duration:7});
  skill('moonbeam','Moonbeam','hit',80,8); skill('moondust','Moondust','heal',95,7); skill('lantern','Guiding Lantern','haste',0,12,{duration:5});
  skill('lull','Lullaby','frontaoe',40,11,{effect:'slow',duration:3}); skill('aurora','Aurora','teamheal',50,12);
  skill('trailcut','Quick cut','hit',86,6,{category:'melee'}); skill('trailguard','Raised guard','selfshield',95,11,{duration:5});
  skill('trailshot','Quick shot','hit',72,6,{category:'ranged'}); skill('trailaim','Steady aim','hit',120,11,{category:'ranged'}); skill('trailbreath','Catch breath','selfheal',70,15);
  skill('huntersmark','Pinning shot','hit',85,7,{category:'ranged',effect:'slow',duration:4});
  skill('volley','Arrow volley','frontaoe',70,10,{category:'ranged'});
  skill('longshot','Longshot','hit',140,11,{category:'ranged',reach:46});
  skill('huntingcall','Hunting call','haste',0,13,{duration:5});
  skill('trailward','Trail ward','selfshield',150,12,{duration:6});
  skill('cleave','Cleave','frontaoe',90,9,{category:'melee'});
  skill('swordlunge','Sword lunge','hit',155,8,{category:'melee',reach:18});
  skill('parry','Parry','selfshield',180,10,{duration:6});
  skill('rallyingcry','Rallying cry','teamshield',80,13,{duration:6});
  skill('secondwind','Second wind','selfheal',95,14);
  const passives = {
    kindling:{name:'Kindling',description:'Strikes deal 15% more damage to burning enemies.'},
    granite:{name:'Granite Hide',description:'Take 10% less incoming damage, including intercepted damage.'},
    charged:{name:'Charged Feathers',description:'Every third basic attack deals 35 extra damage.'},
    tender:{name:'Tender Care',description:'All your healing is 15% stronger. You are still a fragile support.'},
    winter:{name:'Winter Hunt',description:'Strikes deal 20% more damage to slowed enemies.'},
    cinder:{name:'Cinder Heart',description:'After casting an offensive skill, restore 18 HP to yourself. No healing during Overcharge.'},
    shell:{name:'Shell Reserve',description:'Begin each battle with a 160 HP shield lasting 12 seconds.'},
    lastgrove:{name:'Last Grove',description:'Once per battle, survive a hit below 40% HP to gain a 140 HP shield for 6 seconds.'},
    current:{name:'Gentle Current',description:'When you restore HP to an ally other than yourself, remove their Slow.'},
    moonward:{name:'Moon Ward',description:'Restoring HP to an ally gives them a 40 HP shield for 4 seconds. It never replaces or extends a stronger shield.'}
  };
  const units = {};
  function unit(id,name,subtitle,role,hp,power,interval,moveSpeed,range,color,pool,equipped,passive=null) {
    units[id]={name,subtitle,role,hp,power,interval,moveSpeed,range,color,skills:pool.split(' '),default:equipped.split(' '),passive,trait:passive?passives[passive].description:subtitle};
  }
  unit('apprentice','Apprentice','A stranger on the forest floor','Trainer',780,38,1.45,1.3,1,'#b4aa74','trailcut trailguard trailshot trailaim trailbreath','trailcut trailguard trailbreath');
  unit('druid','Druid','Keeper of the grove','Trainer',800,28,1.8,1,4,'#57a386','mend bark bramble renewal entangle','mend bramble bark');
  unit('mage','Mage','Weaver of the arcane','Trainer',720,39,1.8,1,4,'#a39ad9','frost nova hex aegis comet','frost nova aegis');
  unit('hunter','Hunter','A steady bow and a watchful pack','Trainer',780,43,1.65,1.15,4,'#91ac65','huntersmark volley longshot huntingcall trailward','huntersmark longshot trailward');
  unit('swordsman','Knight','Steel beside your companions','Trainer',1080,50,1.65,1.2,1,'#739cad','cleave swordlunge parry rallyingcry secondwind','cleave parry swordlunge');
  unit('emberfox','Emberfox','A spark with sharp teeth','Melee DPS',610,49,1.55,1.5,1,'#df8858','pounce burn pierce quickstep firefan','burn pounce quickstep','kindling');
  unit('stonehorn','Stonehorn','A steadfast little mountain','Tank',1100,26,2.3,.6,1,'#8c9c86','guard fortify slam boulder rally','guard slam fortify','granite');
  unit('stormowl','Stormowl','Quiet wings. Loud thunder.','Ranged DPS',570,46,1.65,1.1,4,'#91b6d0','chain snipe gust staticbolt tailwind','chain snipe gust','charged');
  unit('bloomslime','Bloomslime','A pocket-sized ray of sunshine','Support',500,20,1.9,.8,3,'#8fbd9c','bloom haste cleanse spore petalward','bloom haste spore','tender');
  unit('frostfang','Frostfang','A winter wind with paws','Melee DPS',620,45,1.6,1.45,1,'#9cc9e4','frostbite icepounce snowfall snowhide packrush','frostbite icepounce packrush','winter');
  unit('cindrake','Cindrake','Little wings. Big ambitions.','Ranged DPS',600,42,1.85,1,3,'#d98d6d','emberbreath fireball ashveil scorch wingdraft','scorch fireball ashveil','cinder');
  unit('ironback','Ironback','The river’s oldest shield','Tank',1060,24,2.4,.55,1,'#95afae','shellguard carapace shellbash stonewave ironward','shellguard shellbash carapace','shell');
  unit('thornstag','Thornstag','Guardian of the wild paths','Tank',940,32,2.1,.85,1,'#b0bb86','antler rootbind wildguard greencanopy lifebud','wildguard rootbind antler','lastgrove');
  unit('tideotter','Tideotter','Go gently. Go together.','Support',510,23,1.85,1,3,'#8fc4ca','springwater riptide ripples rivercleanse bubbleward','springwater riptide bubbleward','current');
  unit('lumimoth','Lumimoth','A lantern for lost friends','Support',470,25,1.8,1.1,4,'#b9a5d4','moonbeam moondust lantern lull aurora','moondust lantern moonbeam','moonward');
  root.BondContent={UNITS:units,SKILLS:skills,PASSIVES:passives,CLASSES:Object.freeze(['druid','mage','hunter','swordsman']),TRAINERS:Object.freeze(['druid','mage','hunter','swordsman','apprentice']),MONSTERS:Object.keys(units).filter(k=>units[k].passive)};
})(globalThis);
