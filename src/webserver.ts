import http from 'http';
var fs = require('fs');            //required to readfile

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/plain');
  // res.end('Hello World');
  fs.readFile('index.html', function (err: any, data:any) {
    res.writeHead(200);
    res.write(data);
    res.end();
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});