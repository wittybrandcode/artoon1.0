import { parse } from '@artoon/parser';
import { render } from './src/index';

const artoonText = `>.ul:: item 1
>.-ol:: item 2
>.ul:: item 3`;

const parsed = parse(artoonText);
console.log("AST:");
console.log(JSON.stringify(parsed.ast, null, 2));

console.log("\nHTML:");
const html = render(parsed.ast);
console.log(html);
