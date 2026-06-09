// Script to fix test files by adding 'type' property alongside 'nodeType'
const fs = require('fs');
const path = require('path');

const testFiles = [
  'tests/text.test.ts',
  'tests/table.test.ts',
  'tests/block.test.ts',
  'tests/compound.test.ts',
  'tests/media.test.ts',
  'tests/link.test.ts',
  'tests/code.test.ts',
  'tests/comment.test.ts',
  'tests/serialize.test.ts'
];

// Mapping from nodeType to type
const typeMap = {
  text: 'text',
  table: 'table',
  block: 'block',
  compound: 'compound',
  media: 'media',
  link: 'link',
  code: 'code',
  comment: 'comment',
  separator: 'separator'
};

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace nodeType: 'xxx' with type: 'xxx',\n      nodeType: 'xxx'
  Object.keys(typeMap).forEach(nodeType => {
    const type = typeMap[nodeType];
    // Match nodeType: 'xxx', with proper indentation
    const regex = new RegExp(`(\\s+)nodeType: '${nodeType}',`, 'g');
    content = content.replace(regex, `$1type: '${type}',\n$1nodeType: '${nodeType}',`);
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${file}`);
});

console.log('\n✅ All test files fixed!');
