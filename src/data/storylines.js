// 多步剧情链 — 比随机事件更深、更长的叙事体验
const storylines = [
  {
    id: 'mysterious_letter',
    title: '📜 神秘来信',
    trigger: { location: 'any', minDay: 3, chance: 0.3 },
    steps: [
      {
        text: '清晨推开门，发现门缝下塞着一封信。信纸泛黄，字迹潦草，落款是一个你从未听过的名字——"沈惊鸿"。信中写道："三日后子时，城外破庙，事关你家族兴衰。"',
        choices: [
          { text: '按时赴约', msg: '你决定去看个究竟。这封信来得蹊跷，但万一是真的呢？', next: 1 },
          { text: '先调查此人', check: { attr: 'cunning', dc: 12 },
            success: { msg: '你四处打听，得知沈惊鸿曾是江湖上赫赫有名的侠客，十年前突然销声匿迹。看来此人非同小可。你还是决定赴约。(+心计+1)', attrChange: { cunning: 1 }, next: 1 },
            failure: { msg: '没打探到什么有用信息，但好奇心驱使你还是决定赴约。', next: 1 }
          },
          { text: '置之不理', msg: '你将信扔到一边。江湖骗术罢了。但这封信的内容却在脑海中挥之不去...', endStory: true }
        ]
      },
      {
        text: '子时，破庙。月光透过残破的屋顶洒下。一个黑衣男子从阴影中走出，腰间配着一柄古剑。"你来了。"他打量着你，"你长得很像你父亲。"',
        choices: [
          { text: '"你认识我父亲？"', msg: '"岂止认识。"他从怀中取出一枚与你家中祖物一模一样的玉佩。"二十年前，令尊与我并肩作战，封印了一处上古秘境。如今封印松动，异界的魔物即将重返人间。"', next: 2 },
          { text: '"你到底想说什么？"', check: { attr: 'intelligence', dc: 13 },
            success: { msg: '他眼中闪过一丝赞许。"直截了当，有你父亲的风范。"他说出了同样的秘密——你的家族是两界守门人。(+智力+1)', attrChange: { intelligence: 1 }, next: 2 },
            failure: { msg: '他叹了口气，缓缓道出了关于你父亲和异界封印的秘密。虽然信息量太大让你一时难以消化。', next: 2 }
          }
        ]
      },
      {
        text: '"封印需要三样东西：你父亲留下的玉佩、秘境中的星陨石、以及...你血脉中的灵力。"沈惊鸿郑重地看着你。"这不是请求。这是你的宿命。"',
        choices: [
          { text: '接受使命', msg: '你接过玉佩，感到它在你掌心微微发热。命运的车轮已经开始转动，你无法回头。(获得古老玉佩，穿越进度+3，沈惊鸿好感+20)', item: 'misc_relic', transmuteProgress: 3, affection: { rival: 15 }, next: 3 },
          { text: '"我需要时间考虑"', msg: '"时间不多了。"他将玉佩塞进你手中。"拿着。当你准备好了，它会指引你找到我。"(获得古老玉佩)', item: 'misc_relic', next: 3 },
          { text: '拒绝', msg: '沈惊鸿沉默良久，收回玉佩。"也罢。但命运的洪流不会因为你的退缩而停止。"他转身消失在夜色中。但这个秘密已在你心中生根。', endStory: true, transmuteProgress: 1 }
        ]
      },
      {
        text: '回到家已是凌晨。你握着玉佩，望向窗外的星空。从今天起，你不再只是一个普通的少年。你是两界之间的守门人。\n\n"新的旅程才刚刚开始。"你对自己说。',
        choices: [
          { text: '踏上征途', msg: '这条道路充满未知与危险，但也充满了无尽的可能。你的故事，将在两界之间传唱。(+全属性+1，+50银两，穿越进度+2)', attrChange: { physique:1, intelligence:1, charm:1, luck:1, cunning:1 }, gold: 50, transmuteProgress: 2, endStory: true }
        ]
      }
    ]
  },
  {
    id: 'academy_conspiracy',
    title: '🔍 书院阴谋',
    trigger: { location: 'academy', minDay: 5, chance: 0.35 },
    steps: [
      {
        text: '你在藏书阁整理书籍时，无意中发现了夫子密柜中的一封信——信中内容令人震惊：有人要在秋闱中徇私舞弊，而幕后的主使竟是朝中一位大员。',
        choices: [
          { text: '暗中调查', check: { attr: 'cunning', dc: 14 },
            success: { msg: '你小心翼翼地搜集证据，发现此事牵涉甚广。萧景琰似乎也察觉到了什么，主动找你商议。(萧景琰好感+10)', affection: { rival: 10 }, next: 1 },
            failure: { msg: '你打草惊蛇了。第二天，那封信就不见了。但你知道自己触碰到了什么敏感的真相。', next: 1 }
          },
          { text: '直接报告夫子', msg: '夫子脸色大变，连声说"不可声张"。他让你暂时不要管这件事，但你能看出他眼中的恐惧。这件事没那么简单。', next: 1 },
          { text: '假装没看见', msg: '你将信放回原处。这种事知道的越少越安全。但你的良心一直在隐隐作痛。', endStory: true }
        ]
      },
      {
        text: '你与萧景琰暗中调查了几天，发现舞弊案只是冰山一角。幕后之人正在策划更大的阴谋——借秋闱之机安插亲信，进而控制朝堂。',
        choices: [
          { text: '联手揭露真相', check: { attr: 'intelligence', dc: 15 },
            success: { msg: '你们收集了确凿证据，匿名递交给了御史台。不久后朝堂震动，涉案官员被一一查处。你与萧景琰虽隐于幕后，却成为了真正的朋友。(+智力+2，萧景琰好感+20，+30银两)', attrChange: { intelligence: 2 }, affection: { rival: 20 }, gold: 30, next: 2 },
            failure: { msg: '计划出了一点纰漏，虽然没能完全扳倒幕后之人，但至少秋闱得以公平进行。萧景琰对你刮目相看。(萧景琰好感+10)', affection: { rival: 10 }, next: 2 }
          },
          { text: '明哲保身', msg: '你选择了退出。萧景琰失望地看着你，但他独自继续了调查。这件事让你心中始终有个结。', endStory: true }
        ]
      },
      {
        text: '风波平息后，夫子私下找到你们。"你们救了这届学子。"他递过来两封推荐信，"这份情，我会永远记得。"',
        choices: [
          { text: '收下推荐信', msg: '你郑重地接过信。这不仅是一封推荐信，更是责任和信任的象征。(+科举加成，+智力+1)', attrChange: { intelligence: 1 }, endStory: true }
        ]
      }
    ]
  },
  {
    id: 'market_heist',
    title: '💰 市集秘宝',
    trigger: { location: 'market', minDay: 7, chance: 0.3 },
    steps: [
      {
        text: '市集角落，一群江湖人士围着一个受伤的老者。老者手中紧握一块泛着幽光的宝石，口中喃喃："不能让它落入他们手中..."他看到了你，眼睛一亮。',
        choices: [
          { text: '挺身而出', check: { attr: 'physique', dc: 14 },
            success: { msg: '你灵活地穿过人群，扶起老者，带着他消失在错综复杂的市集巷弄中。江湖人士追丢了你们。(+体质+1)', attrChange: { physique: 1 }, next: 1 },
            failure: { msg: '你与江湖人士过了几招，虽然不敌但争取了时间，苏念雪不知从哪冒出来帮忙，用市集的人群掩护你们脱身。(苏念雪好感+10)', affection: { qingmei: 10 }, next: 1 }
          },
          { text: '暗中观察', msg: '你没有贸然出手。江湖人士带着老者离开了，但你记住了他们的方向。也许之后还能遇到。', endStory: true }
        ]
      },
      {
        text: '安全后，老者喘息着说明真相：他是西域来的商人，这块"星陨石"来自天外。封印在两界之间的通道需要它。而追杀他的，是企图打开通道、释放魔物的邪教组织。',
        choices: [
          { text: '接受星陨石', msg: '"它选择了你。"老者将宝石交到你的手中，宝石在接触你皮肤的瞬间亮起了柔和的光芒。老者欣慰地笑了。(获得星陨石，穿越进度+3)', transmuteProgress: 3, next: 2 },
          { text: '问清详情再决定', check: { attr: 'intelligence', dc: 12 },
            success: { msg: '你仔细询问了关于两界通道的一切。老者倾囊相授，你获得了宝贵的情报。(+智力+1，穿越进度+2)', attrChange: { intelligence: 1 }, transmuteProgress: 2, next: 2 },
            failure: { msg: '老者说了很多，但大部分你都无法理解。不过星陨石的光芒告诉你，一切都是真实的。', transmuteProgress: 1, next: 2 }
          }
        ]
      },
      {
        text: '"记住，无论发生什么，都不要让星陨石落入他们手中。"老者最后叮嘱道。"两界的平衡，就靠你了。"天色渐亮，老者的身影在晨光中淡去。',
        choices: [
          { text: '踏上守护者之路', msg: '你将星陨石贴身收藏。一个新的世界在你面前展开，充满了危险与奇迹。(+运气+2，穿越进度+2，+40银两)', attrChange: { luck: 2 }, gold: 40, transmuteProgress: 2, endStory: true }
        ]
      }
    ]
  },
  {
    id: 'love_letter',
    title: '💌 月下心事',
    trigger: { location: 'home', minDay: 3, chance: 0.4, minAffection: { qingmei: 40 } },
    steps: [
      {
        text: '你在书房发现了苏念雪不小心遗落的绢帕，上面绣着两句诗——"天不老，情难绝。心似双丝网，中有千千结。"你认出这是她的手笔。',
        choices: [
          { text: '找到她，还给她', msg: '你在后花园找到了苏念雪。她看到你手中的绢帕，脸一下子红到了耳根。"你...你看到了？"她的声音细如蚊蚋。', next: 1 },
          { text: '也写一首诗回应', msg: '你提笔在绢帕旁添了两句诗。后来她发现了，眼眶微红，却没有说什么。但你看得出，她很开心。(苏念雪好感+15)', affection: { qingmei: 15 }, next: 1 },
          { text: '当作没看见', msg: '你将绢帕放回原处。有些心事，放在心底最美。', endStory: true }
        ]
      },
      {
        text: '夜幕降临，苏念雪约你在月下的亭中相见。她穿着一袭淡绿色的衣裙，月光洒在她身上，仿佛画中走出的仙子。\n\n"我有话想对你说..."',
        choices: [
          { text: '静静听她说', msg: '"从小到大，你一直是我最信赖的人。"她轻声说，眼中闪烁着星光。"无论你将来去哪里，做什么，我都会支持你。"(苏念雪好感+20)', affection: { qingmei: 20 }, next: 2 },
          { text: '握住她的手', msg: '你什么都没说，只是握住了她的手。十指相扣的瞬间，月光似乎更加明亮了。苏念雪依偎在你肩上，轻声说："真好。"(苏念雪好感+25)', affection: { qingmei: 25 }, next: 2 },
        ]
      },
      {
        text: '那一晚，你们聊了很久。从儿时的回忆，到对未来的憧憬。月亮从东边升到了中天，又渐渐西斜。\n\n有些情感，不需要说出口。',
        choices: [
          { text: '珍惜这份感情', msg: '从此以后，你们的羁绊更加深厚。无论前路如何，至少有一个人会一直在你身边。(苏念雪好感+30，+魅力+1)', affection: { qingmei: 30 }, attrChange: { charm: 1 }, endStory: true }
        ]
      }
    ]
  },
  {
    id: 'rival_alliance',
    title: '🤝 亦敌亦友',
    trigger: { location: 'academy', minDay: 10, chance: 0.3, minAffection: { rival: 35 } },
    steps: [
      {
        text: '萧景琰主动找你。"最近有人一直在跟踪我。"他低声说，"我感觉和上次的舞弊案有关。那些人没有全部落网。"他看了看你，"我需要一个信得过的人。"',
        choices: [
          { text: '"交给我"', msg: '萧景琰罕见地露出了笑容。"我就知道你会这么说。"他递过来一份名单，"这是我查到的可疑人物。"', next: 1 },
          { text: '"为什么是我？"', check: { attr: 'cunning', dc: 12 },
            success: { msg: '"因为你是唯一一个能让我心服口服的对手。"他说这话时，眼神坦荡。这份信任让你动容。(+萧景琰好感+10)', affection: { rival: 10 }, next: 1 },
            failure: { msg: '"直觉。"他简洁地回答。但你知道，能让萧景琰说出"信得过"这三个字，已经说明了一切。', next: 1 }
          }
        ]
      },
      {
        text: '你们花了几天时间调查，最终锁定了三个嫌疑人。其中一个竟然是你们都很敬重的一位老师。证据确凿，但如何处理却成了难题。',
        choices: [
          { text: '举报到底', check: { attr: 'cunning', dc:15 },
            success: { msg: '你们以巧妙的方式让真相浮出水面。老师被带走时，眼中没有怨恨，只有解脱。"谢谢你们。"他说。(+心计+2，萧景琰好感+20)', attrChange: { cunning: 2 }, affection: { rival: 20 }, next: 2 },
            failure: { msg: '你们的举报引起了轩然大波。虽然处理有些波折，但最终正义还是得到了伸张。', next: 2 }
          },
          { text: '先给老师一个解释的机会', msg: '老师承认了一切。他哭着说自己的家人被威胁了。你们决定帮他对付幕后之人。事情变得更加复杂，但也更加坚定了你们的友谊。', next: 2 }
        ]
      },
      {
        text: '经历此役，你与萧景琰的关系发生了质变。不再是竞争对手，而是真正的战友。"下次有事，第一个找你。"他拍了拍你的肩膀，转身离去。',
        choices: [
          { text: '珍惜这份友谊', msg: '人生得一知己足矣。从此以后，你们并肩而行，共同面对前路的一切挑战。(萧景琰好感+30，+魅力+1)', affection: { rival: 30 }, attrChange: { charm: 1 }, endStory: true }
        ]
      }
    ]
  },
  {
    id: 'mentor_awakening',
    title: '🔮 异界召唤',
    trigger: { location: 'mystic', chance: 0.5 },
    steps: [
      {
        text: '墨渊带你来到一座古老的祭坛前。祭坛上的符文与你曾在古书中看到的如出一辙。"这是上古传送阵。你的血脉中蕴含着开启它的力量。"',
        choices: [
          { text: '将手放在符文上', check: { attr: 'intelligence', dc: 14 },
            success: { msg: '符文在你的触碰下依次点亮，祭坛发出了低沉的轰鸣。墨渊眼中闪过一丝惊讶。"比我想象的更快。"(+魔法等级+2)', attrChange: { magic: 2 }, next: 1 },
            failure: { msg: '符文只亮了一半。墨渊点了点头："第一次能做到这个程度，已经很不错了。"(+魔法等级+1)', attrChange: { magic: 1 }, next: 1 }
          },
          { text: '先听墨渊解释', msg: '墨渊详细讲解了传送阵的原理和风险。你对异界的认知又加深了一层。"知识就是力量。"他说。(+智力+1)', attrChange: { intelligence: 1 }, next: 1 }
        ]
      },
      {
        text: '"传送阵的另一端，是一个叫作艾泽拉斯的世界。"墨渊说道。"那里有魔法学院、龙骑军团、元素神殿。而你，将成为连接两个世界的关键。"',
        choices: [
          { text: '你准备好了吗？', msg: '你深深地吸了一口气。脚下的传送阵已经完全亮起，异界的风吹拂着你的脸庞。跨越时刻即将到来。(穿越进度+3，+魔法+1)', transmuteProgress: 3, attrChange: { magic: 1 }, endStory: true }
        ]
      }
    ]
  },
  {
    id: 'haunted_mansion',
    title: '👻 荒宅探秘',
    trigger: { location: 'home', minDay: 5, chance: 0.25 },
    steps: [
      {
        text: '家族后山有一座废弃多年的老宅，据说闹鬼。但最近，几个下人声称看到里面有灯火闪烁。好奇心驱使你决定一探究竟。',
        choices: [
          { text: '夜晚独自前往', check: { attr: 'luck', dc: 13 },
            success: { msg: '你提着灯笼走进荒宅。在二楼的房间中，你发现了一个暗室，里面藏着家族早年经商的重要账本和一张藏宝图！(+运气+1，+50银两)', attrChange: { luck: 1 }, gold: 50, next: 1 },
            failure: { msg: '你被一阵怪声吓了一跳，但仔细查看后发现原来是风吹窗棂的声音。不过你在老宅中确实找到了一些有趣的老物件。(+20银两)', gold: 20, next: 1 }
          },
          { text: '白天带人一起', msg: '你和几个家丁白天进入老宅。虽然少了一些神秘感，但确实发现了暗室。里面有不少值钱的古物。(+30银两)', gold: 30, next: 1 }
        ]
      },
      {
        text: '在整理老宅中的遗物时，你发现了一本日记。日记的主人是你的曾祖父，他记载了一段不为人知的历史——家族曾经显赫一时，因卷入朝廷政治斗争而衰败。',
        choices: [
          { text: '仔细研读日记', check: { attr: 'intelligence', dc: 12 },
            success: { msg: '日记中隐藏的线索指向一件传家宝的埋藏地点。更关键的是，你发现曾祖父也曾接触过"异界"的秘密。(+智力+1，穿越进度+2)', attrChange: { intelligence: 1 }, transmuteProgress: 2, endStory: true },
            failure: { msg: '日记内容晦涩难懂，但你至少了解了家族的过去。这将帮助你在宅斗中占据优势。(+心计+1)', attrChange: { cunning: 1 }, endStory: true }
          }
        ]
      }
    ]
  },
  {
    id: 'fate_encounter',
    title: '✨ 命运的岔路',
    trigger: { location: 'any', minDay: 15, chance: 0.2 },
    steps: [
      {
        text: '你做了一个梦。在梦中，你站在一个岔路口——左边通向繁华的京城，右边通向神秘的异界之门。两个世界都在召唤你。一个声音问："你，选择哪条路？"',
        choices: [
          { text: '选择尘世之路', msg: '你选择留在凡间，用自己的力量改变这个世界。京城中，一个新的传奇正在等待着你。(+智力+2，+心计+2，+100银两)', attrChange: { intelligence: 2, cunning: 2 }, gold: 100, endStory: true },
          { text: '选择异界之门', msg: '你毫不犹豫地走向异界。那里有魔法、龙、和无限的未知。你的命运不在尘世，而在星辰大海。(穿越进度+5，+魔法+2)', transmuteProgress: 5, attrChange: { magic: 2 }, endStory: true },
          { text: '选择两条路都走', check: { attr: 'luck', dc:16 },
            success: { msg: '梦境中，两条路竟然融为了一体。你同时行走于两个世界！这不是梦，这是你真正的命运——成为两界行者。(+全属性+2，穿越进度+4)', attrChange: { physique:2, intelligence:2, charm:2, luck:2, cunning:2 }, transmuteProgress: 4, endStory: true },
            failure: { msg: '你试图同时走两条路，却从梦中惊醒。但梦中的画面深深刻在了你的脑海中。也许有一天，你真的可以做到。(+运气+1)', attrChange: { luck: 1 }, endStory: true }
          }
        ]
      }
    ]
  }
];

export default storylines;
