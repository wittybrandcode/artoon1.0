import { parse } from '@artoon/parser';
import { render } from './src/index';

// Simulate full round-trip: ARTOON text → parse → AST → render → HTML
const artoonText = `>.ul:: فقرات نصية مع تنسيق غنى
>.-ol:: عناوين من المستوى 1 إلى 6
>.ul:: قوائم نقطية ومرقمة
>.ul:: بلوكات الكود مع ألوان الصيغة
>.ul:: جداول قابلة للتحرير
>.ul:: صور وفيديو وصوت
>.ul:: فواصل أفقية`;

const parsed = parse(artoonText);
console.log("=== AST ===");
console.log(JSON.stringify(parsed.ast, null, 2));

console.log("\n=== HTML ===");
const html = render(parsed.ast);
console.log(html);
