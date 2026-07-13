const WebSocket = require('ws');

const url = 'wss://api.oksigen24medis.com';
console.log(`Connecting to ${url}...`);

const ws = new WebSocket(url);

ws.on('open', function open() {
  console.log('Successfully connected!');
});

ws.on('message', function message(data) {
  console.log('Received:', data.toString());
});

ws.on('error', function error(err) {
  console.error('Error occurred:', err.message || err);
});

ws.on('close', function close(code, reason) {
  console.log(`Connection closed: ${code} - ${reason.toString()}`);
});

setTimeout(() => {
  console.log('Closing after 10s...');
  ws.close();
}, 10000);
