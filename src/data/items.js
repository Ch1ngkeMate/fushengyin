export const ITEM_DB = {
  book_classics: { id:'book_classics', name:'《四书章句》', type:'book', desc:'科举必备。', price:30, effect:{intelligence:1} },
  book_strategy: { id:'book_strategy', name:'《三十六策》', type:'book', desc:'宅斗心计之书。', price:35, effect:{cunning:1} },
  book_magic: { id:'book_magic', name:'《元素初解》', type:'book', desc:'异界魔法入门。', price:80, effect:{magic:1}, requireTransmigration:true },
  pill_health: { id:'pill_health', name:'回春丹', type:'consumable', desc:'恢复体力。', price:15, heal:20 },
  pill_smarts: { id:'pill_smarts', name:'醒神丸', type:'consumable', desc:'临时智力+2（当日）', price:25, tempBuff:{intelligence:2} },
  gift_jade: { id:'gift_jade', name:'玉佩', type:'gift', desc:'精美玉佩，送礼佳品。', price:50, affection:15 },
  gift_book: { id:'gift_book', name:'孤本诗集', type:'gift', desc:'罕见诗作。', price:40, affection:12 },
  gift_crystal: { id:'gift_crystal', name:'元素水晶', type:'gift', desc:'异界特产。', price:100, affection:25, requireTransmigration:true },
  weapon_sword: { id:'weapon_sword', name:'青锋剑', type:'weapon', desc:'家传宝剑。', price:80, atk:5 },
  weapon_staff: { id:'weapon_staff', name:'橡木法杖', type:'weapon', desc:'魔法增幅。', price:120, atk:3, matk:8, requireTransmigration:true },
  misc_letter: { id:'misc_letter', name:'神秘信笺', type:'misc', desc:'一封来历不明的信...', price:0, questItem:true },
  misc_relic: { id:'misc_relic', name:'古老玉佩', type:'misc', desc:'泛着微光，似有秘密。', price:0, questItem:true },
};
