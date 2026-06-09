import { render } from './src/index';

const ast = {
    version: '2.0',
    content: [
        {
            type: "list",
            line: 1,
            direction: "rtl",
            listType: "ul",
            items: [
                {
                    itemType: "li",
                    listType: "ul",
                    content: [{ type: "plain", value: "item 1" }]
                },
                {
                    itemType: "li",
                    listType: "ol",
                    content: [{ type: "plain", value: "item 2" }]
                },
                {
                    itemType: "li",
                    listType: "ul",
                    content: [{ type: "plain", value: "item 3" }]
                }
            ]
        }
    ]
};

const html = render(ast as any);
console.log(html);
