'use strict';

const fs = require('node:fs');
const path = require('node:path');

const FILE_PATH = path.join(process.cwd(), './dist/ng-csp/browser/index.html');

const getContent = async (path) => {
  const content = await fs.readFileSync(path, 'utf-8');
  // if (isRoot) {
  //   nonce = uuid.v4();
  //   content = content.replaceAll('nonceVal', `"${nonce}"`);
  // }

  // return { content, nonce };
  const newContent = content
    .replaceAll('<script', '<script nonce=nonceVal')
    .replaceAll('rel="stylesheet"', 'nonce=nonceVal rel="stylesheet"');
  await fs.writeFileSync(path, newContent);
};

const content = getContent(FILE_PATH);