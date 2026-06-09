import { parse } from './src/index';

const artoonText = `>.ul:: item 1
>.-ul:: item 1 child 1
>.-ol:: item 1 child 2
>.ul:: item 2`;

const result = parse(artoonText);
console.log(JSON.stringify(result.ast, null, 2));
