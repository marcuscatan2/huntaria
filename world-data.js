(function(root){
  'use strict';
  const ITEMS={
    bondcontract:{name:'Bond Contract',icon:'❧',category:'Rituals',description:'Arm Try to catch during an eligible fight. After victory, one contract is consumed for a 65% chance to welcome that spirit. Failed rolls use paper; defeat and unarmed fights do not.'},
    biscuit:{name:'Bond Biscuit',icon:'◈',category:'Supplies',description:'Grants your trainer an 80 HP shield for the first 10 seconds of the next battle.'},
    mossbloom:{name:'Mossbloom',icon:'✿',category:'Materials',description:'A soft pink flower from Mosslight Clearing. A keepsake from the forest.'},
    riverstone:{name:'Riverstone',icon:'◆',category:'Materials',description:'Smoothed by the Willowbrook current. A collectible keepsake; no combat effect.'},
    amberleaf:{name:'Amberleaf',icon:'❧',category:'Materials',description:'A golden leaf that keeps its autumn color. A collectible keepsake; no combat effect.'},
    moonshard:{name:'Moonshard',icon:'◇',category:'Materials',description:'A pale crystal from the old Moonwell. A collectible keepsake; no combat effect.'},
    skyfeather:{name:'Skyfeather',icon:'➶',category:'Materials',description:'A silver-blue feather carried down from the rise. A collectible keepsake; no combat effect.'},
    grovebadge:{name:'Grove Emblem',icon:'✳',category:'Trophies',description:'Earned by defeating Mira. Proof of a growing bond; no stat bonus.'},
    riverbadge:{name:'River Emblem',icon:'≋',category:'Trophies',description:'Earned by defeating Orin. Proof of your resolve; no stat bonus.'},
    stormbadge:{name:'Storm Emblem',icon:'ϟ',category:'Trophies',description:'Earned by defeating Vesper. You completed all three challenges; no stat bonus.'}
  };
  Object.assign(ITEMS,{
    rarecontract:{name:'Illuminated Contract',icon:'❧',category:'Rituals',description:'A rarer papyrus with a 90% post-victory catch chance. Arm it during a catchable fight. A resolved attempt consumes one, including a failed roll.'},
    trailfood:{name:'Memory Fruit',icon:'✿',category:'Supplies',description:'Grants a companion 120 XP.'},
    battlefood:{name:'Trail Ration',icon:'✦',category:'Supplies',description:'Grants your party +10% max HP for the next battle.'},
    starseed:{name:'Starseed',icon:'✧',category:'Materials',description:'A rare expedition keepsake (2% faction drop). Decorative collection item; no hidden power or current crafting use.'}
  });
  const SCENES=[
    {id:'clearing',name:'Mosslight Clearing',subtitle:'Where every bond begins',mood:'GROVE WOODLAND',image:'assets/art-v6/arena.png',item:'mossbloom',npc:'mira'},
    {id:'brook',name:'Willowbrook',subtitle:'Follow the gentle current',mood:'RIVER PATH',image:'assets/art-v8/brook.png',item:'riverstone',npc:'orin'},
    {id:'hollow',name:'Amber Hollow',subtitle:'A quiet pocket of autumn',mood:'GOLDEN WOOD',image:'assets/art-v8/hollow.png',item:'amberleaf'},
    {id:'ruins',name:'Moonwell Ruins',subtitle:'Old stones, familiar magic',mood:'FORGOTTEN SANCTUARY',image:'assets/art-v8/ruins.png',item:'moonshard'},
    {id:'rise',name:'Windstep Rise',subtitle:'One last challenge above the clouds',mood:'SKYWARD TRAIL',image:'assets/art-v8/rise.png',item:'skyfeather',npc:'vesper'}
  ];
  const team=entries=>entries.map(([type,pool])=>({type,skills:pool.split(' ')}));
  const NPCS={
    mira:{name:'Mira',title:'Grove keeper',area:'clearing',level:'FIRST CHALLENGE',greeting:'Ready to show me what your party can do?',advice:'Try a tank with a damage dealer. Put a useful defensive skill early in your priority, then let your damage dealer pressure my monsters. Your trainer must survive.',coins:20,badge:'grovebadge',team:team([['druid','mend bramble bark'],['emberfox','pounce pierce quickstep'],['cindrake','fireball scorch wingdraft']])},
    orin:{name:'Orin',title:'River warden',area:'brook',level:'SECOND CHALLENGE',greeting:'Water finds a way around the strongest wall. My friends prefer patience, but do not mistake that for weakness. Ready to test your current?',advice:'Ironback begins with a shield, and Tideotter can remove Slow when healing others. Sustained damage and Burn can help. Shields do not stack, and healing stops after 55 seconds.',coins:35,badge:'riverbadge',team:team([['mage','frost comet aegis'],['ironback','shellguard shellbash carapace'],['tideotter','springwater riptide bubbleward']])},
    vesper:{name:'Vesper',title:'Storm adept',area:'rise',level:'FINAL CHALLENGE',greeting:'You made it to the rise. Up here, the smallest opening can decide a battle. Show me what you and your companions have learned.',advice:'Tempestool’s Skyneedle and my Crown Hex can target your trainer directly. Bondguard, Shellguard or Wildguard intercept that damage. A prepared Bond Biscuit helps with the opening.',coins:50,badge:'stormbadge',team:team([['mage','hex frost aegis'],['stormowl','snipe chain gust'],['frostfang','frostbite icepounce snowhide']])}
  };
  Object.assign(ITEMS,{
    amberbadge:{name:'Amber Emblem',icon:'❧',category:'Trophies',description:'First victory against Lark.'},
    moonbadge:{name:'Moon Emblem',icon:'☽',category:'Trophies',description:'First victory against Selene.'},
    packbadge:{name:'Wildfang Charm',icon:'✦',category:'Trophies',description:'Defeated all five members of the wandering pack.'},
    rootbadge:{name:'Guardian Heart',icon:'◇',category:'Trophies',description:'You brought peace to Elderroot, guardian of the trail.'}
  });
  ITEMS.stormbadge.description='Earned by defeating Vesper, the storm adept.';
  Object.assign(NPCS,{
    lark:{name:'Lark',title:'Amber ranger',area:'hollow',level:'TRAINER · OFFENSE',coins:30,badge:'amberbadge',
      greeting:'The hollow is full of quick little hunters. Can your bond withstand their rush?',
      advice:'Frost and roots slow my attackers. A tank and well-timed healing give your party room to breathe.',
      team:team([['druid','entangle renewal bramble'],['frostfang','icepounce frostbite packrush'],['emberfox','firefan pounce quickstep']])},
    selene:{name:'Selene',title:'Moon scholar',area:'ruins',level:'TRAINER · ENDURANCE',coins:40,badge:'moonbadge',
      greeting:'These stones remember every bond. Let us leave them a good story.',
      advice:'My support and guardian protect each other. Try sustained damage, Burn, or direct-trainer skills. Healing stops in Overcharge.',
      team:team([['mage','nova comet aegis'],['thornstag','wildguard antler lifebud'],['lumimoth','moondust moonbeam aurora']])},
    wildpack:{name:'Wandering pack',title:'Five small foes',appearance:'frostfang',area:'hollow',kind:'pack',level:'WILD ENCOUNTER · 5 ENEMIES',coins:35,badge:'packbadge',
      greeting:'A pack blocks the trail. Clear a path.',
      advice:'Area attacks reward you for hitting several enemies. Each creature has less health and lower basic damage than its full-grown counterpart.',
      enemies:[
        {type:'emberfox',name:'Young Brimble',hp:270,power:20,interval:2.4,passive:null,skills:['quickstep','pounce','burn']},
        {type:'frostfang',name:'Young Shardclaw',hp:280,power:20,interval:2.5,passive:null,skills:['snowhide','frostbite','packrush']},
        {type:'bloomslime',name:'Little Bloomslime',hp:230,power:12,interval:2.7,passive:null,skills:['spore','bloom','petalward']},
        {type:'cindrake',name:'Cindrake Whelp',hp:250,power:20,interval:2.6,passive:null,skills:['ashveil','fireball','wingdraft']},
        {type:'stormowl',name:'Young Tempestool',hp:230,power:18,interval:2.7,passive:null,skills:['tailwind','gust','staticbolt']}
      ]},
    elderroot:{name:'Elderroot',title:'Guardian of the trail',appearance:'elderroot',area:'rise',kind:'boss',level:'BOSS · TWO PHASES',coins:100,badge:'rootbadge',
      greeting:'An ancient guardian stirs. Defeat Elderroot before 75 seconds. At half health it awakens, charging its arena-wide Bramblequake more often.',
      advice:'The amber warning means a quake is charging. Armor, shields and guarding help your team endure it; Slow lengthens the next charge. Bring sustained damage too. Explore and train your mastery trees first.',
      enemies:[{type:'thornstag',appearance:'elderroot',name:'Elderroot',boss:true,hp:3300,power:65,interval:2.5,moveSpeed:.55,passive:null,skills:['boulder','slam','fortify']}]
    }
  });
  const POSITIONS={mira:{x:690,y:410},orin:{x:1670,y:405},lark:{x:2380,y:390},wildpack:{x:2780,y:490},selene:{x:3580,y:410},vesper:{x:4320,y:390},elderroot:{x:4780,y:450}};
  root.BondWorld={ITEMS,SCENES,NPCS,POSITIONS};
})(globalThis);
