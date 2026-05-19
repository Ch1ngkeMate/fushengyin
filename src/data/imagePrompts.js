// 场景图片提示词框架 — 根据地点+时间+事件生成，接入生图 API 即可用
// 每个 prompt 都是英文 (Stable Diffusion / DALL-E 兼容)，可直接传给 generateImage(prompt)

const TIME_MOOD = {
  '清晨': 'early morning golden sunlight, misty atmosphere, dew on leaves, soft warm light',
  '上午': 'bright morning light, clear blue sky, lively atmosphere, fresh shadows',
  '下午': 'warm golden afternoon light, long shadows, gentle breeze, rich colors',
  '傍晚': 'dramatic orange sunset, crimson sky, silhouettes, lanterns being lit',
  '夜晚': 'moonlit night scene, silver moonlight, lantern glow, starry sky, deep blue shadows',
};

const LOCATION_PROMPT = {
  home:    'ancient Chinese courtyard mansion, elegant wooden architecture, carved beams and painted rafters, rock garden with bamboo, red lanterns hanging from eaves, traditional lattice windows, stone pathways',
  academy: 'ancient Chinese academy, classical pavilion architecture, scrolls and bookshelves, ink brushes on wooden desks, pine trees in courtyard, scholars in traditional robes, calligraphy on walls',
  market:  'bustling ancient Chinese marketplace, colorful silk banners, wooden vendor stalls with red roofs, crowds in traditional clothing, hanging paper lanterns, smoke from food stalls, cobblestone street',
  office:  'ancient Chinese government hall, grand wooden pillars, elevated platform with ceremonial desk, official seals and scrolls, stern architecture, incense smoke, "明镜高悬" plaque',
  mystic:  'fantasy magical realm, floating crystal islands, glowing runes on ancient stone, ethereal blue and purple mist, twin moons in sky, magical portals with swirling energy, dragon silhouettes in distance',
};

// 场景基础 prompt = 地点 + 时间氛围
export function getScenePrompt(location, period) {
  const loc = LOCATION_PROMPT[location] || LOCATION_PROMPT.home;
  const mood = TIME_MOOD[period] || TIME_MOOD['上午'];
  return `${loc}, ${mood}, cinematic lighting, 4K,digital painting, Chinese fantasy art style, rich details, warm earthy tones`;
}

// 剧情/事件触发 prompt = 场景 + 事件关键词
export function getEventPrompt(location, period, eventTitle, eventText) {
  const base = getScenePrompt(location, period);
  const eventDesc = eventText ? eventText.substring(0, 80) : eventTitle;
  return `${base}, scene: ${eventDesc}, dramatic composition, story illustration, emotional atmosphere`;
}

// 特殊场景 prompt
export const SPECIAL_PROMPTS = {
  transmute: 'a massive glowing portal ripping through reality, one side ancient Chinese courtyard, other side fantasy world with dragons and floating castles, magical energy swirling, epic cinematic scene, two worlds colliding, 4K digital art',
  ending_good: 'triumphant celebration in ancient Chinese palace, golden light streaming through windows, cherry blossoms falling, hero standing in ceremonial robes, people cheering, warm epic atmosphere, 4K',
  ending_bad: 'lonely figure walking through desolate winter landscape, bare trees, cold wind, grey sky, ancient ruins in background, melancholic atmosphere, cinematic composition, 4K',
  night_rest: 'peaceful ancient Chinese bedroom interior, warm candlelight, silk curtains, wooden bed frame, moonlight through paper windows, tranquil atmosphere, cozy and safe, soft lighting',
  storyline_mystery: 'mysterious ancient Chinese scene, shadowy figure in black robes, ancient sword with glowing runes, moonlit temple ruins, misty atmosphere, suspense and intrigue, cinematic noir lighting',
  storyline_love: 'romantic moonlit garden, cherry blossom petals drifting in air, two figures in traditional robes standing by lotus pond, soft lantern glow, intimate atmosphere, pink and silver color palette, dreamy',
  storyline_battle: 'intense martial arts duel in bamboo forest, figures in flowing robes mid-combat, leaves swirling, motion blur, dramatic lighting, epic Chinese fantasy painting style',
};

// 根据当前状态选择最佳 prompt
export function getBestPrompt(state, eventTitle, eventText) {
  if (state.transmuted && state.location === 'mystic') {
    return getScenePrompt('mystic', TIME_MOOD_KEYS[state.period]);
  }
  if (state.activeStoryline) {
    const slId = state.activeStoryline.id;
    if (slId === 'mysterious_letter') return SPECIAL_PROMPTS.storyline_mystery;
    if (slId === 'love_letter') return SPECIAL_PROMPTS.storyline_love;
  }
  const periodKey = ['清晨','上午','下午','傍晚','夜晚'][state.period] || '上午';
  return getEventPrompt(state.location, periodKey, eventTitle, eventText);
}

const TIME_MOOD_KEYS = ['清晨','上午','下午','傍晚','夜晚'];
