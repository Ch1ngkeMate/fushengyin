// 夜晚事件库 (10+ 种)
const nightEvents = [
  { id:'n1', title:'奇梦', text:'你做了一个奇异的梦——梦中你站在两界交汇处，左手红尘右手星河。醒来后只记得那种奇妙的感觉。', effect:{energy:5,luck:1}, chance:0.2 },
  { id:'n2', title:'深夜访客', text:'有人轻敲你的窗户。你打开窗，一只灰猫跳了进来，嘴里叼着一枚铜钱。放下铜钱后它又无声地消失了。', effect:{gold:8}, chance:0.15 },
  { id:'n3', title:'失眠夜', text:'翻来覆去睡不着，索性起来点了灯。在书案前打发时间时，忽然想通了许多事情。(+智力+1)', effect:{intelligence:1,energy:-5}, chance:0.2 },
  { id:'n4', title:'灵感迸发', text:'月光透过窗棂洒在书案上。你突然文思泉涌，写下一篇绝妙的文章。明日准备交给夫子看看。(+智力+1,+文采)', effect:{intelligence:1}, chance:0.18 },
  { id:'n5', title:'月下偶遇', text:'你睡不着在院中散步，发现苏念雪也在。你们相视一笑，并肩赏月。(苏念雪好感+8)', effect:{affection:{qingmei:8}}, chance:0.15 },
  { id:'n6', title:'雷鸣电闪', text:'半夜突然雷雨交加。一道闪电劈中了院中老槐树，树干裂开露出了藏在其中的一个铁盒！(+30银两)', effect:{gold:30}, chance:0.08 },
  { id:'n7', title:'噩梦惊醒', text:'你梦见自己被卷入无边的黑暗，惊出一身冷汗。虽然只是梦，但总觉得不太舒服。(精力-10)', effect:{energy:-10}, chance:0.12 },
  { id:'n8', title:'深夜读书', text:'你翻阅枕边的一本古书，忽然在某页发现了一段隐藏的文字——似乎是前人留下的秘密。(穿越进度+1)', effect:{transmuteProgress:1}, chance:0.1 },
  { id:'n9', title:'窗外萤火', text:'深夜萤火虫成群飞过窗外，在夜色中闪烁如同繁星。你站在窗前看呆了，心情变得格外宁静。(+精力+15)', effect:{energy:15}, chance:0.25 },
  { id:'n10', title:'神秘信笺', text:'一封信不知何时出现在你的枕边："明日子时，后山石亭。带上你父亲留下的东西。"落款是一个你从未见过的符号。', effect:{transmuteProgress:2}, chance:0.08, isSpecial:true },
  { id:'n11', title:'星象异变', text:'你半夜被窗外的亮光惊醒。抬头望去，夜空中的星辰排列成了从未见过的图案——与古书上描绘的"异界之门"一模一样。(穿越进度+2)', effect:{transmuteProgress:2}, chance:0.06, isSpecial:true },
  { id:'n12', title:'花香入梦', text:'不知从哪传来的花香飘入房中，你沉沉睡去，做了个无比幸福的梦。第二天醒来精力充沛。(+精力全满)', effect:{energy:100}, chance:0.1 },
];
export default nightEvents;
