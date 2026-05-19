export const ATTR_NAMES = {
  physique: '体质', intelligence: '智力', charm: '魅力', luck: '运气', cunning: '心计'
};
export const ATTR_ICONS = { physique:'💪', intelligence:'📖', charm:'💐', luck:'🍀', cunning:'🕸️' };
export const TIME_PERIODS = ['清晨','上午','下午','傍晚','夜晚'];
export const PERIOD_ACTIONS = {
  morning: ['晨练','早课','拜访'],
  noon: ['读书','交易','社交'],
  afternoon: ['修炼','探索','处理事务'],
  evening: ['休息','宴会','密谋'],
  night: ['睡觉','夜游','冥想'],
};

export const LOCATIONS = {
  home: { name:'家中', icon:'🏠', actions:['rest','study_room','garden','family_hall'], desc:'朱门深院，雕梁画栋。' },
  academy: { name:'书院', icon:'📚', actions:['attend_class','library','debate','tea_room'], desc:'书声琅琅，墨香四溢。' },
  market: { name:'市集', icon:'🏪', actions:['shop','tea_house','gamble','street_wander'], desc:'车水马龙，店铺林立。' },
  office: { name:'官府', icon:'🏛️', actions:['handle_cases','court_meeting','bribe','review'], desc:'明镜高悬，庄严肃穆。', unlock:{intelligence:7, day:30} },
  mystic: { name:'秘境', icon:'🌀', actions:['meditate','magic_training','dungeon','summon'], desc:'灵气氤氲，异界之门。', unlock:{transmuted:true} },
};

export const SCENE_PROMPTS = {
  home: `Ancient Chinese courtyard mansion, elegant architecture, warm tones`,
  academy: `Ancient Chinese academy, scholars studying, classical buildings`,
  market: `Ancient Chinese bustling market street, vendors, colorful stalls`,
  office: `Ancient Chinese government office, solemn hall`,
  mystic: `Fantasy magic world, floating islands, magical aura, dragon flying`
};
