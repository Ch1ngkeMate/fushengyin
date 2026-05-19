// ERNIE Image Turbo 生图客户端
// 直接调用百度千帆 API，绕过 CORS 通过 Vite proxy

const API_KEY = 'bce-v3/ALTAK-SBPi3yOwIBmJWe1SDwiO4/e735f6c8cf68128a646c2adc8ea5216dfbe1de1a';
// 开发模式走 Vite proxy，生产模式直连（ERNIE API 支持跨域）
const API_URL = import.meta.env.DEV
  ? '/api/ernie-image'
  : 'https://qianfan.baidubce.com/v2/ernie-image/images/generations';

// 内存缓存
const cache = new Map();
const pendingRequests = new Map();

function hashPrompt(prompt) {
  let h = 0;
  for (let i = 0; i < prompt.length; i++) {
    h = ((h << 5) - h) + prompt.charCodeAt(i);
    h |= 0;
  }
  return 'img_' + Math.abs(h).toString(36);
}

export async function generateImage(prompt) {
  const key = hashPrompt(prompt);

  // 检查缓存
  if (cache.has(key)) return cache.get(key);

  // 检查 LocalStorage
  try {
    const stored = localStorage.getItem(`scene_img_${key}`);
    if (stored) {
      cache.set(key, stored);
      return stored;
    }
  } catch(e) {}

  // 去重 — 同一个 prompt 不重复请求
  if (pendingRequests.has(key)) return pendingRequests.get(key);

  const promise = (async () => {
    try {
      const body = JSON.stringify({
        model: 'ernie-image-turbo',
        prompt: prompt.substring(0, 200), // ERNIE 限制 prompt 长度
        size: '1024x1024',
        n: 1
      });

      const res = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json();
      const url = data?.data?.[0]?.url;

      if (url) {
        cache.set(key, url);
        try { localStorage.setItem(`scene_img_${key}`, url); } catch(e) {}
        return url;
      }
      throw new Error('No image URL in response');
    } catch (e) {
      console.warn('Image gen failed:', e.message);
      return null; // 返回 null，UI 显示 fallback
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);
  return promise;
}

// 预生成常用场景图
const COMMON_SCENES = [
  'ancient Chinese courtyard mansion, morning light, elegant architecture, warm tones',
  'ancient Chinese academy, scholars studying, classical buildings, bright day',
  'ancient Chinese bustling market, vendors, colorful stalls, afternoon sun',
  'ancient Chinese government hall, solemn atmosphere, grand pillars, official setting',
  'fantasy magical realm, floating islands, magical aura, mystical atmosphere',
];

export function preloadScenes() {
  COMMON_SCENES.forEach(p => generateImage(p).catch(() => {}));
}
