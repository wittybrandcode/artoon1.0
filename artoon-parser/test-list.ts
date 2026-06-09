import { parse } from './src/index';
const artoonText = `>.ul:: item 1
>.ol:: item 2
>.-ul:: nested item`;
const result = parse(artoonText);
console.log(JSON.stringify(result.ast, null, 2));
