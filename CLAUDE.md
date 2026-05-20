# 浮生引 · 红尘与异界

文字叙事养成游戏，React + Vite + animal-island-ui。

## 常用命令

```bash
npm run dev       # 开发 (Vite HMR)
npm run build     # 生产构建
npm run preview   # 预览构建产物
```

## 视觉辅助脚本（自动允许，无需权限申请）

- `image-bridge.py` — 截图解析（ERNIE 视觉 + DeepSeek 推理），位于 `D:\develop\cursor Pro\shao-xiaoli-attendance\scripts\`
- `xiumi_scraper.py` — 秀米模板爬虫，同上目录

## 项目结构

```
src/
├── components/    # React 组件
├── state/         # GameContext 全局状态
├── data/          # 游戏数据 (事件/物品/NPC/结局/剧情链/提示词)
└── utils/         # 工具 (生图 API)
```

## 游戏系统

- 时间: 上午3动 + 下午3动 → 夜晚结算 → 新一天
- 主线进度: 0-100% 进度条
- 8 个里程碑 + 8 条多步剧情链 + 51 随机事件 + 10 结局
- 4 位 NPC + 好感度系统 + D20 技能检定
