'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const uuid = require('uuid');

const PORT = 3000;
const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};
const STATIC_PATH = path.join(process.cwd(), './dist/ng-csp/browser');

const toBool = [() => true, () => false];

const getContent = async (streamPath, isRoot) => {
  let content = await fs.readFileSync(streamPath, 'utf-8');
  let nonce = null;

  if (isRoot) {
    nonce = uuid.v4();
    content = content.replaceAll('nonceVal', `"${nonce}"`);
  }

  return { content, nonce };
};

const prepareFile = async (url) => {
  const paths = [STATIC_PATH, url];
  const isRoot = url.endsWith('/');

  if (isRoot) {
    paths.push('index.html');
  }
  
  const filePath = path.join(...paths);
  console.log({filePath});
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : STATIC_PATH + '/404.html';
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const { content, nonce } = await getContent(streamPath, isRoot);

  return { found, ext, content, nonce };
};

const getHeaders = (file) => {
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
  const defaultHeaders = { 'Content-Type': mimeType };
  let headers;

  if (file.nonce) {
    const cspAllowlist = `default-src 'none'; script-src 'nonce-${file.nonce}' https://www.google-analytics.com/; style-src 'nonce-${file.nonce}'; img-src 'self'`;
    headers = { ...defaultHeaders, 'Content-Security-Policy': cspAllowlist };
  } else {
    headers = defaultHeaders;
  }

  return headers;
};

http.createServer(async (req, res) => {
  const file = await prepareFile(req.url);
  const statusCode = file.found ? 200 : 404;
  const headers = getHeaders(file);

  res.writeHead(statusCode, headers);
  res.write(file.content);
  res.end();
  console.log(`${req.method} ${req.url} ${statusCode}`);
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);