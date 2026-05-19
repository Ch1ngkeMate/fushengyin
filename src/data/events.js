// 51+ random events
const events = [
  { id:'h1', location:'home', period:'any', title:'花园偶遇', text:'你在后花园散步，忽然听见假山后传来窃窃私语声，似乎有人正在谈论家族秘密。', choices:[
    {text:'悄悄靠近偷听', check:{attr:'cunning',dc:12}, success:{msg:'你成功听清了——原来二姨娘正谋划如何侵吞家族产业！(+心计+1)', attrChange:{cunning:1}},
     failure:{msg:'你不慎踩到了枯枝，声响惊动了对方，她们立刻散去了。'}},
    {text:'若无其事离开', msg:'你选择不惹是非，转身离去。多一事不如少一事。'}
  ]},
  { id:'h2', location:'home', period:'any', title:'书房奇遇', text:'你在书房翻阅古籍时，一本泛黄的旧书从书架高处掉落，书页中夹着一张发黄的符纸。', choices:[
    {text:'仔细研究符纸', check:{attr:'intelligence',dc:14}, success:{msg:'符纸上记载的竟是奇门遁甲之术！你隐隐感到天地间有某种力量在呼唤你。(穿越进度+1)', transmuteProgress:1},
     failure:{msg:'符纸上的符文太过晦涩，你看不懂，只能小心收好。', item:'misc_relic'}},
    {text:'放回原处', msg:'你将书放回原处，心中却始终萦绕着那符纸的模样。'}
  ]},
  { id:'h3', location:'home', period:'night', title:'夜半哭声', text:'深夜，你被一阵若有若无的哭声惊醒。声音似乎来自祠堂方向...', choices:[
    {text:'前去查看', check:{attr:'luck',dc:10}, success:{msg:'原来是一个迷路的小丫鬟在哭。你将她送回住处，她感激地塞给你一块碎银。(+5银两)', gold:5},
     failure:{msg:'你找了半天没找到来源，反而着了凉。(体质-1)', attrChange:{physique:-1}}},
    {text:'蒙头继续睡', msg:'你选择不理，这深宅大院，有些事不知道更好。'}
  ]},
  { id:'h4', location:'home', period:'morning', title:'姨娘试探', text:'早膳时，三姨娘格外热情地给你夹菜，话里话外都在打探你最近的学业进展。', choices:[
    {text:'巧妙周旋', check:{attr:'cunning',dc:13}, success:{msg:'你圆滑地应付了过去，三姨娘什么都没打探到。她还觉得你成熟了不少。(+魅力+1)', attrChange:{charm:1}},
     failure:{msg:'你有些招架不住，被套出了不少信息。'}},
    {text:'直言不讳', msg:'你如实相告，三姨娘表面笑着，眼中却闪过一丝算计。'},
    {text:'借故离开', msg:'你以去书院为由匆匆离开，避开了这场交锋。'}
  ]},
  { id:'a1', location:'academy', period:'any', title:'课堂辩论', text:'夫子提出一个策论题，点名让你与萧景琰各抒己见。满堂同窗都等着看好戏。', choices:[
    {text:'正面迎战', check:{attr:'intelligence',dc:15}, success:{msg:'你的论点鞭辟入里，连夫子都频频点头！萧景琰面色复杂地看了你一眼。(+智力+1，萧景琰好感+5)', attrChange:{intelligence:1}, affection:{rival:5}},
     failure:{msg:'你的论述有些牵强，萧景琰嘴角微扬，轻松驳倒了你的观点。'}},
    {text:'谦让回避', msg:'你以身体不适为由推辞了辩论，同窗们有些失望。不过萧景琰倒没说什么。'}
  ]},
  { id:'a2', location:'academy', period:'afternoon', title:'藏书阁', text:'你在藏书阁的角落发现了一本被藏得很深的禁书，似乎记录着一些禁忌的知识。', choices:[
    {text:'偷偷翻阅', check:{attr:'luck',dc:12}, success:{msg:'书中记载的竟是一些古老的修仙法门！虽然大多残缺，但某些心法让你受益匪浅。(+智力+2)', attrChange:{intelligence:2}},
     failure:{msg:'你正看得入神，却被图书管理员发现，被罚抄《礼记》三遍。'}},
    {text:'报告夫子', msg:'你将书交给了夫子，夫子脸色大变，称赞你品行端正，赏了你一些银两。(+10银两)', gold:10}
  ]},
  { id:'a3', location:'academy', period:'morning', title:'新同窗', text:'书院来了一位外地转学来的女同窗，气质清冷，坐在角落独自看书。', choices:[
    {text:'主动搭话', check:{attr:'charm',dc:11}, success:{msg:'她叫柳如烟，家道中落后辗转求学。你们聊得很投机。(+魅力+1，获得"孤本诗集")', attrChange:{charm:1}, item:'gift_book'},
     failure:{msg:'她只是淡淡地应了一声，便继续看书了。'}},
    {text:'不去打扰', msg:'你远远看了一眼，觉得还是专心自己的学业为好。'}
  ]},
  { id:'m1', location:'market', period:'any', title:'神秘商人', text:'一个身穿奇装异服的商人拦住了你，神秘兮兮地打开一个锦盒："此物来自西域，与你有缘！"', choices:[
    {text:'看看是什么', check:{attr:'luck',dc:8}, success:{msg:'盒中是一枚泛着幽光的戒指，看起来很值钱。商人只要了5两银子。(+戒指，魅力+1)', attrChange:{charm:1}, gold:-5, item:'misc_relic'},
     failure:{msg:'盒中是块普通石头，你差点被坑。还好你没掏钱。'}},
    {text:'直接走开', msg:'骗子太多了，你警惕地绕开了他。'}
  ]},
  { id:'m2', location:'market', period:'any', title:'街头比试', text:'市集中央围了一大群人，原来是一个武者在摆擂台，扬言十招之内无人能敌。', choices:[
    {text:'上台挑战', check:{attr:'physique',dc:14}, success:{msg:'你灵活闪避，在第九招时找到了破绽，一招制敌！众人大声喝彩，武者心服口服地送了你一瓶丹药。(+回春丹×2，体质+1)', attrChange:{physique:1}, item:'pill_health'},
     failure:{msg:'你勉强撑到第五招就被打下台来，虽然有些狼狈但也赢得了尊重。'}},
    {text:'在台下观战', msg:'你津津有味地看着其他人挑战，学到了不少招式。'}
  ]},
  { id:'m3', location:'market', period:'night', title:'夜市灯火', text:'夜晚的市集格外热闹，花灯如昼。你漫步其中，忽然听到身后有人叫你的名字。', choices:[
    {text:'回头去看', check:{attr:'luck',dc:10}, success:{msg:'竟然是苏念雪！她双颊微红，手里提着两盏花灯。"真巧...我也是一个人。"你们一起逛了夜市。(苏念雪好感+10)', affection:{qingmei:10}},
     failure:{msg:'你回头却什么也没看到，想来是听错了。'}},
    {text:'加快脚步', msg:'你假装没听见，继续逛街。有时候独自走走也挺好的。'}
  ]},
  { id:'o1', location:'office', period:'any', title:'棘手案件', text:'一桩离奇的命案摆在案头，死者是城中富商，所有证据都指向其妻子，但你总觉得有蹊跷。', choices:[
    {text:'深入调查', check:{attr:'intelligence',dc:16}, success:{msg:'你发现了关键线索！真凶是富商的商业对手，嫁祸给了无辜的妻子。此案令你声名大振。(+声望+20，赏银20两)', gold:20, attrChange:{charm:1}},
     failure:{msg:'你查了许久却仍无头绪，只能按现有证据断案。虽然结果没错，但心中不安。'}},
    {text:'按律判案', msg:'你依法判案，速战速决。虽然省事，但总觉得有些草率。'}
  ]},
  { id:'p1', location:'mystic', period:'any', title:'元素潮汐', text:'空气中突然充满了浓郁的魔力，元素潮汐正在涌来。墨渊说这是难得一遇的修炼良机。', choices:[
    {text:'全力吸收魔力', check:{attr:'intelligence',dc:14}, success:{msg:'你成功引导元素之力涌入体内，魔力大幅增长！(+魔法等级+2)', attrChange:{magic:2}},
     failure:{msg:'魔力太过汹涌，你无法完全掌控，只吸收了一小部分。(+魔法等级+1)', attrChange:{magic:1}}},
    {text:'谨慎观察', msg:'你选择先观察墨渊的做法再行动，虽然没有大幅增长，但学会了控制魔力的技巧。'}
  ]},
  { id:'p2', location:'mystic', period:'any', title:'地下城入口', text:'你在秘境深处发现了一个古老的传送门，门内传来阵阵龙吟。墨渊说这是远古地下城的入口。', choices:[
    {text:'勇敢踏入门中', check:{attr:'physique',dc:16}, success:{msg:'你在地下城中击败了石像鬼守卫，找到了失落的宝箱！(+100金币，+魔法物品)', gold:100, item:'gift_crystal'},
     failure:{msg:'你被机关困住了，幸好墨渊及时赶到救了你。虽然有些狼狈，但也算一次宝贵的经历。'}},
    {text:'标记位置下次再来', msg:'你在地图上标记了这个位置，等实力强一些再来探索。'}
  ]},
  { id:'g1', location:'any', period:'any', title:'星辰异象', text:'你抬头仰望夜空，发现北斗七星格外明亮，其中一颗星忽明忽暗，仿佛在对你眨眼。', isSpecial:true, choices:[
    {text:'凝神感应', check:{attr:'luck',dc:13}, success:{msg:'你感到一股暖流从星空涌入体内，命运之力似乎在你身上刻下了一道印记。(运气+1，穿越进度+1)', attrChange:{luck:1}, transmuteProgress:1},
     failure:{msg:'你盯得眼睛发酸，什么也没感应到。不过今夜的星空确实很美。'}},
    {text:'不以为意', msg:'你当作寻常天象，继续做自己的事。但心底某个角落已被悄悄触动。'}
  ]},
  { id:'g2', location:'any', period:'any', title:'乞丐赠言', text:'一个衣衫褴褛的老乞丐拦住了你的去路，用沙哑的声音说："少年人，老夫观你眉心有光，恐非凡尘中人..."', choices:[
    {text:'认真聆听', check:{attr:'luck',dc:10}, success:{msg:'老乞丐从怀里摸出一枚古朴铜钱塞给你："收好，他日有大用。"说完便消失在人群中。(穿越进度+1)', transmuteProgress:1},
     failure:{msg:'老乞丐笑了笑："时机未到。"便转身离开了。'}},
    {text:'给些银两', msg:'你给了老乞丐几两银子，他深深看了你一眼，说了句"善缘已结"便离开了。(-2银两)', gold:-2}
  ]},
  { id:'g3', location:'any', period:'any', title:'雨后彩虹', text:'一场突如其来的雨后，天边挂起了绚丽的彩虹。', choices:[
    {text:'许个愿', check:{attr:'luck',dc:8}, success:{msg:'也许是巧合，也许天意，你真的感到心情舒畅，好运即将来临。(+运气+1)', attrChange:{luck:1}},
     failure:{msg:'彩虹虽美，但很快就消散了。愿望大概也只是愿望吧。'}},
    {text:'静静欣赏', msg:'你停下来欣赏了片刻，心情舒畅了不少。'}
  ]},
  { id:'h5', location:'home', period:'any', title:'亲戚来访', text:'远房表亲突然上门拜访，据说在外地发了财，但言行举止总透着几分可疑。', choices:[
    {text:'热情招待并观察', check:{attr:'cunning',dc:11}, success:{msg:'你敏锐地发现这个"表亲"其实是骗子！你不动声色地揭穿了他，保住了家产。(+银两20，心计+1)', gold:20, attrChange:{cunning:1}},
     failure:{msg:'你没能看出破绽，被骗走了一些钱财。(-10银两)', gold:-10}},
    {text:'避而不见', msg:'你借口身体不适避开了，事后听说这个"表亲"确实有问题，暗自庆幸。'}
  ]},
  { id:'h6', location:'home', period:'morning', title:'祖传宝物', text:'打扫祖屋时，你在墙角暗格中发现了一个上锁的木匣，上面刻着你的名字。', choices:[
    {text:'想办法打开', check:{attr:'intelligence',dc:13}, success:{msg:'你用巧妙的方法打开了木匣，里面是祖父留给你的信和一柄短剑。信中透露家族曾与"异界"有过联系...(获得"青锋剑"，穿越进度+1)', item:'weapon_sword', transmuteProgress:1},
     failure:{msg:'木匣的锁太复杂了，你打不开。但你能感觉到里面藏着重要的东西。'}}
  ]},
  { id:'h7', location:'home', period:'night', title:'月下独酌', text:'月朗星稀，你独自在院中喝酒。忽听院墙上有人轻唤你的名字——是苏念雪。', choices:[
    {text:'邀她一起', check:{attr:'charm',dc:10}, success:{msg:'夜色如水，你们并肩坐在石阶上，聊了很久很久。她说这是她今年最开心的一晚。(苏念雪好感+15)', affection:{qingmei:15}},
     failure:{msg:'她害羞地摇了摇头，在墙头放下一盒点心便匆匆离开了。点心很甜。(苏念雪好感+5)', affection:{qingmei:5}}}
  ]},
  { id:'a4', location:'academy', period:'afternoon', title:'诗词大会', text:'书院举办诗词大会，优胜者可获夫子亲笔推荐信，对科举大有裨益。', choices:[
    {text:'登台赋诗', check:{attr:'intelligence',dc:14}, success:{msg:'你的诗作惊艳四座！夫子当场挥毫写下推荐信给你。(+科举进度+1)', attrChange:{intelligence:1}},
     failure:{msg:'你即兴发挥有些紧张，诗句平淡。但好歹也算亮了相。'}},
    {text:'为好友助威', msg:'你为台上的萧景琰喝彩，他虽然表面不屑，但嘴角微扬。(萧景琰好感+5)', affection:{rival:5}}
  ]},
  { id:'a5', location:'academy', period:'morning', title:'神秘访客', text:'一位身着道袍的老者来到书院，自称云游四海的修士，想找一位"有缘人"。', choices:[
    {text:'与他交谈', check:{attr:'luck',dc:12}, success:{msg:'老者端详你许久，点了点头："果然是你。小友，异日若有奇遇，持此符可寻我。"', transmuteProgress:1},
     failure:{msg:'老者看了你一眼，摇摇头离开了。你有些莫名其妙。'}}
  ]},
  { id:'m4', location:'market', period:'afternoon', title:'拍卖会', text:'市集拍卖行正在举行一场拍卖，压轴的是一块据说可以"通灵"的古玉。', choices:[
    {text:'出价竞拍(-15两)', check:{attr:'luck',dc:13}, success:{msg:'你以15两拍下古玉，它在你手中微微发热，似有生命。(获得古玉，穿越进度+1)', gold:-15, transmuteProgress:1},
     failure:{msg:'古玉被一个神秘买家以高价拍走，你只能望洋兴叹。'}, cost:15}
  ]},
  { id:'m5', location:'market', period:'morning', title:'药材采购', text:'药铺老板说新到了一批珍稀药材，其中一株"千年灵芝"据说能起死回生。', choices:[
    {text:'购买药材(-20两)', msg:'你买下了这株灵芝。虽然很贵，但说不定什么时候能救命。(获得"千年灵芝")', gold:-20, item:'pill_health', cost:20},
    {text:'只是看看', msg:'太贵了，你看了看价格就默默离开了。'}
  ]},
  { id:'m6', location:'market', period:'night', title:'赌坊奇遇', text:'你路过赌坊，里面传来阵阵欢呼。一个熟悉的身影闪过——似乎是萧景琰？', choices:[
    {text:'进去看看', check:{attr:'luck',dc:12}, success:{msg:'果然是他！你帮他在赌局中扳回一局，他对你刮目相看。(+银两30，萧景琰好感+10)', gold:30, affection:{rival:10}},
     failure:{msg:'你被赌局吸引，自己也下了注，结果输了。(-10银两)', gold:-10}},
    {text:'当作没看见', msg:'你继续前行，每个人都有自己的秘密。'}
  ]},
  { id:'o2', location:'office', period:'afternoon', title:'朝堂党争', text:'朝中两派为了一项新政争执不休，你被要求表态。无论选择哪边都会有后果...', choices:[
    {text:'支持改革派', check:{attr:'cunning',dc:14}, success:{msg:'你的表态恰到好处，赢得了改革派的信任。(+声望，心计+1)', attrChange:{cunning:1}},
     failure:{msg:'你的表态得罪了保守派，日后可能会有些麻烦。'}},
    {text:'保持中立', msg:'你选择了沉默，虽然两边都不讨好，但也不得罪任何人。'}
  ]},
  { id:'o3', location:'office', period:'morning', title:'微服私访', text:'你决定微服到民间走访，了解百姓真实的生活情况。', choices:[
    {text:'深入贫民区', check:{attr:'charm',dc:12}, success:{msg:'你听到了许多真实的疾苦声音，回府后推行了惠民政策。(+声望)', attrChange:{charm:1}},
     failure:{msg:'你在贫民区遇到了扒手，钱包被偷了。(-5银两)', gold:-5}},
    {text:'巡视商铺', msg:'你视察了几家商铺，了解市场行情。一切看起来都不错。'}
  ]},
  { id:'p3', location:'mystic', period:'any', title:'魔法学院', text:'墨渊带你参观了魔法学院——一座悬浮在空中的巨大城堡。学生们骑着扫帚飞来飞去。', choices:[
    {text:'报名上课', check:{attr:'intelligence',dc:13}, success:{msg:'第一堂课就是元素操控，你天赋异禀，轻松凝聚了火球！(+魔法等级+1)', attrChange:{magic:1}},
     failure:{msg:'你的火球失控了，差点烧到自己的袍子。但墨渊说这很正常。'}},
    {text:'四处参观', msg:'你在学院里逛了一圈，大开眼界。这里的每一处都颠覆了你的认知。'}
  ]},
  { id:'g4', location:'any', period:'any', title:'落水救人', text:'你路过河边，看到一个小孩掉进了水里，正在拼命挣扎。', choices:[
    {text:'跳入水中救人', check:{attr:'physique',dc:12}, success:{msg:'你成功将小孩救上岸，他的家人感激涕零，非要重金酬谢。(+20银两，体质+1)', gold:20, attrChange:{physique:1}},
     failure:{msg:'你也呛了几口水，但好歹把小孩救了上来。虽然狼狈但值得。(体质-1)', attrChange:{physique:-1}}},
    {text:'呼救找人帮忙', msg:'你大声呼救，附近的渔民闻声赶来救起了小孩。'}
  ]},
  { id:'g5', location:'any', period:'night', title:'流星雨', text:'夜空突然划过无数流星，璀璨夺目。人们纷纷走出屋外观赏。', choices:[
    {text:'许下心愿', check:{attr:'luck',dc:9}, success:{msg:'流星仿佛听到了你的愿望。冥冥中你感到未来充满了无限可能。(+运气+1)', attrChange:{luck:1}},
     failure:{msg:'流星太美了，你忘记许愿只顾着欣赏。不过能看见这样的美景已经很幸运了。'}}
  ]},
  { id:'g6', location:'any', period:'any', title:'路遇贵人', text:'你路遇一位气度不凡的中年人，他似乎在找人问路，但周围人都对他敬而远之。', choices:[
    {text:'主动相助', check:{attr:'charm',dc:10}, success:{msg:'原来他是当朝宰相微服私访！他对你的热心印象深刻。(+声望)', attrChange:{charm:1}},
     failure:{msg:'你指错了路，但对方没有怪你，只是笑了笑自己找了。'}},
    {text:'远远避开', msg:'你不想惹麻烦，快步走开了。'}
  ]},
  { id:'g7', location:'any', period:'morning', title:'喜鹊报喜', text:'清晨，一只喜鹊落在你窗前的树枝上，叽叽喳喳叫个不停。', choices:[
    {text:'觉得是好兆头', msg:'你心情愉快，今天做什么都很顺利。老话说喜鹊叫喜事到。(+运气临时+1)', attrChange:{luck:1}},
    {text:'不在意', msg:'你继续睡了个回笼觉。鸟儿叫不是很正常吗？'}
  ]},
  { id:'g8', location:'any', period:'any', title:'古董小摊', text:'路边有一个不起眼的古董摊，摊主是个眯着眼的老头。角落里一枚不起眼的戒指似乎在发光。', choices:[
    {text:'买下戒指(-8两)', check:{attr:'luck',dc:13}, success:{msg:'这枚戒指竟是上古遗物！蕴含了强大的魔力。(穿越进度+2)', gold:-8, transmuteProgress:2, cost:8},
     failure:{msg:'戒指没什么特别的，但造型还算别致。', gold:-8, cost:8}},
    {text:'随便看看', msg:'你翻看了几件东西，没有特别感兴趣的。'}
  ]},
  { id:'h8', location:'home', period:'evening', title:'家族聚会', text:'今晚家族聚会，长辈们都在。这是展示自己的好机会，但也可能被刁难。', choices:[
    {text:'主动敬酒表现', check:{attr:'charm',dc:13}, success:{msg:'你举止得体，言谈风雅，赢得了长辈们的一致好评。(+家族声望)', attrChange:{charm:1}},
     failure:{msg:'你有些紧张，说错了话，被一位叔父嘲讽了一番。'}},
    {text:'低调坐在角落', msg:'你不引人注意地度过了一个平静的晚上。有时候不出错就是最好的表现。'}
  ]},
  { id:'a6', location:'academy', period:'morning', title:'作弊风波', text:'考试时，你发现旁边的同窗正在偷偷抄小抄。夫子似乎还没发现。', choices:[
    {text:'悄悄提醒他', check:{attr:'cunning',dc:10}, success:{msg:'你巧妙地遮住了夫子的视线，同窗感激涕零。(+人脉)', attrChange:{charm:1}},
     failure:{msg:'你的动作被夫子发现了，你也被牵连受罚。'}},
    {text:'举手举报', msg:'你举手报告了夫子。同窗被取消成绩，从此对你敬而远之。'},
    {text:'专心做自己的', msg:'你专心做自己的试卷，不理会他人。'}
  ]},
  { id:'m7', location:'market', period:'afternoon', title:'说书人', text:'茶馆里一位说书人正在讲"剑仙传"，讲的是凡人修炼成仙的故事，引人入胜。', choices:[
    {text:'认真听完并打赏(-2两)', msg:'你说不定被故事触动。剑仙之路...难道真的存在吗？(穿越进度+1)', gold:-2, transmuteProgress:1},
    {text:'听听热闹', msg:'你听了半场，觉得故事不错但终究是编的。'}
  ]},
  { id:'g9', location:'any', period:'afternoon', title:'暴风雨', text:'突然天降暴雨，电闪雷鸣。你被困在了原地，无处可去。', choices:[
    {text:'在雨中奔跑回家', check:{attr:'physique',dc:10}, success:{msg:'你跑得快，虽然淋湿了但没有大碍。回到家洗个热水澡就好。'},
     failure:{msg:'你摔了一跤，浑身泥泞，还着凉了。(体质-1)', attrChange:{physique:-1}}},
    {text:'找个屋檐避雨', msg:'你在屋檐下躲雨，偶遇了几个同样被困的行人，闲聊了一阵。'}
  ]},
  { id:'g10', location:'any', period:'any', title:'迷路小孩', text:'一个五六岁的小孩呜呜哭着说找不到回家的路了。', choices:[
    {text:'耐心帮他找家', check:{attr:'charm',dc:8}, success:{msg:'你顺利找到了小孩的家，他的父母感激涕零，非要留你吃饭。(+人情)', attrChange:{charm:1}},
     failure:{msg:'你找了半天也没找到，只好把小孩送到了官府。'}},
    {text:'交给附近商铺', msg:'你把小孩交给了附近一家商铺的老板娘帮忙照看。'}
  ]},
  { id:'g11', location:'any', period:'any', title:'奇门遁甲', text:'你偶然在一本旧书中发现了奇门遁甲的残篇，其中记载着一种穿越时空的秘术。', choices:[
    {text:'尝试施展秘术', check:{attr:'intelligence',dc:15}, success:{msg:'你感到空间在你周围扭曲了...秘术被触发了！(穿越进度+3)', transmuteProgress:3},
     failure:{msg:'秘术太复杂了，你失败了。但你不打算放弃。'}}
  ]},
  { id:'g12', location:'any', period:'any', title:'旧友来信', text:'你收到了一封信——来自故乡的苏念雪。她说家乡一切安好，只是很想你。', choices:[
    {text:'回信诉说近况', msg:'你写了一封长信，把异界的奇妙经历告诉了她。虽然她可能难以理解，但你知道她会为你高兴。(苏念雪好感+10)', affection:{qingmei:10}},
    {text:'将信收好', msg:'你将信小心收好。虽然无法回去，但知道故乡还有人记挂着你，心中温暖了不少。'}
  ]},
  { id:'h9', location:'home', period:'morning', title:'传家宝', text:'母亲把你叫到房间，从箱底取出一对玉镯，说这是祖上传下来的，现在该传给你了。', choices:[
    {text:'郑重收下', msg:'你双手接过玉镯，感受到其中蕴含的家族传承之重。(+银两等价物+20)', gold:20},
    {text:'请母亲先保管', msg:'你说自己还年轻，请母亲继续保管。母亲欣慰地笑了。'}
  ]},
  { id:'a7', location:'academy', period:'afternoon', title:'夫子单独指导', text:'夫子让你课后留一下，说有些话想单独和你谈谈。', choices:[
    {text:'虚心请教', check:{attr:'intelligence',dc:10}, success:{msg:'夫子传授了你许多科举应试的独门诀窍。(+智力+1)', attrChange:{intelligence:1}},
     failure:{msg:'夫子说的太过深奥，你有些跟不上。但至少态度得到了认可。'}}
  ]},
  { id:'m8', location:'market', period:'morning', title:'早市鲜货', text:'清晨的市集有刚从河里打捞上来的鲜鱼和刚采摘的蔬果。', choices:[
    {text:'买些鲜货(-3两)', msg:'你买了一些新鲜的食材，准备回去做一顿好饭。(+体质+1)', gold:-3, attrChange:{physique:1}},
    {text:'随便逛逛', msg:'早市的热闹让人心情愉快。你逛了一圈便离开了。'}
  ]},
  { id:'o4', location:'office', period:'morning', title:'御前奏对', text:'皇帝突然召见你，询问你对边境局势的看法。这是表现自己的大好机会。', choices:[
    {text:'慷慨陈词', check:{attr:'intelligence',dc:15}, success:{msg:'你的见解深刻，皇帝龙颜大悦，当场提拔了你！(+声望，+50银两)', gold:50, attrChange:{charm:1}},
     failure:{msg:'你说得有些紧张，但皇帝没有怪罪。年轻人嘛，还需历练。'}}
  ]},
  { id:'g13', location:'any', period:'any', title:'街头艺人', text:'街头有杂耍艺人在表演，吞火、踩高跷、变戏法，精彩纷呈。', choices:[
    {text:'打赏几文钱(-1两)', msg:'你慷慨打赏，艺人表演得更加卖力了。', gold:-1},
    {text:'驻足观看', msg:'你看了一会儿，心情愉悦了不少。'}
  ]},
  { id:'g14', location:'any', period:'night', title:'梦见异界', text:'你做了一个奇怪的梦——梦中有龙、有魔法、有一个苍老的声音在呼唤你的名字。', choices:[
    {text:'认真回忆梦境', msg:'你将梦境记录下来。这或许不是普通的梦...(穿越进度+1)', transmuteProgress:1},
    {text:'当作普通梦', msg:'你翻了个身继续睡。但梦中的画面久久挥之不去。'}
  ]},
  { id:'g15', location:'any', period:'any', title:'偶遇算命先生', text:'路边的算命先生摆了个卦摊，看到你走过便说："这位客官，老夫免费为你看一卦如何？"', choices:[
    {text:'让他算一卦', check:{attr:'luck',dc:10}, success:{msg:'算命先生掐指一算，面露惊色："不得了！阁下命格奇异，有穿梭两界之相！"(穿越进度+1)', transmuteProgress:1},
     failure:{msg:'算命先生说了些吉利话，虽然好听但没什么实质内容。'}},
    {text:'婉拒', msg:'你不信这个，礼貌地拒绝了。算命先生叹了口气："天机不可泄露..."'}
  ]},
  { id:'special_transmute', location:'any', period:'night', title:'✨ 穿越之门', isSpecial:true, isTransmuteTrigger:true,
    text:'天地变色，你手中的古物剧烈震动起来。一道裂缝在虚空中展开，透过裂缝，你能看到另一个世界——那里有飞翔的巨龙、漂浮的城堡、闪烁的魔法阵。一个苍老的声音在你脑海中响起：\n\n"命定之人，异界的大门已为你打开。跨过这道门，你将踏上全新的旅程。但也意味着你将离开熟悉的一切..."',
    choices:[
      {text:'勇敢踏入异界之门！', msg:'TRANSMUTE'},
      {text:'还需要考虑一下...', msg:'裂缝缓缓闭合，但你知道它随时可以再次打开。命运的抉择尚未做出。'}
  ]},
  { id:'t1', location:'mystic', period:'any', title:'魔法学院入学', text:'墨渊正式带你办理魔法学院的入学手续。学院分为四大系：火焰、冰霜、风暴、大地。', choices:[
    {text:'选择火焰系', msg:'你选择了火焰系——破坏与重生的力量。(获得火焰亲和)', attrChange:{magic:2}},
    {text:'选择冰霜系', msg:'你选择了冰霜系——冷静与控制的力量。(获得冰霜亲和)', attrChange:{magic:2}},
    {text:'选择风暴系', msg:'你选择了风暴系——自由与速度的力量。(获得风暴亲和)', attrChange:{magic:2}},
    {text:'选择大地系', msg:'你选择了大地系——守护与坚韧的力量。(获得大地亲和)', attrChange:{magic:2}}
  ]},
  { id:'t2', location:'mystic', period:'any', title:'龙巢试炼', text:'学院组织了一次龙巢试炼——在三天内从龙巢中取回龙鳞。', choices:[
    {text:'正面挑战幼龙', check:{attr:'physique',dc:16}, success:{msg:'你成功击败了幼龙，获得了龙鳞！(声望大增，+100金币)', gold:100, attrChange:{physique:1}},
     failure:{msg:'幼龙太强了，你被烧得灰头土脸。还好墨渊在暗中保护。'}},
    {text:'潜行偷取龙鳞', check:{attr:'cunning',dc:14}, success:{msg:'你利用潜行技巧成功偷到了龙鳞！(声望大增)', attrChange:{cunning:1}},
     failure:{msg:'你的潜行被母龙发现了，被追得满山跑。不过也算一次难忘的经历。'}}
  ]},
  { id:'t3', location:'mystic', period:'night', title:'双月之夜', text:'今晚异界的两个月亮同时满月，魔力潮汐达到顶峰。墨渊说这是百年一遇的修炼良机。', choices:[
    {text:'通宵修炼', check:{attr:'intelligence',dc:14}, success:{msg:'你在双月照耀下突破了瓶颈！魔力大涨。(+魔法等级+3)', attrChange:{magic:3}},
     failure:{msg:'你太累了中途睡着了，但也吸收了不少魔力。(+魔法等级+1)', attrChange:{magic:1}}},
    {text:'观看双月奇景', msg:'你选择欣赏这难得的美景。有些体验比修炼更珍贵。'}
  ]},
];
export default events;
