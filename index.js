const http = require('http');
const url = require('url');
const request = require('request');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/I/want/title' && parsedUrl.query.address) {
    const addresses = Array.isArray(parsedUrl.query.address)
      ? parsedUrl.query.address
      : [parsedUrl.query.address];

    const titles = [];

    // Function to fetch title for a given address
    const getTitle = (address, callback) => {
      request(address, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const titleMatch = body.match(/<title>(.*?)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : 'NO RESPONSE';
          titles.push({ address, title });
        } else {
          titles.push({ address, title: 'NO RESPONSE' });
        }
        callback();
      });
    };

    // Use callbacks to handle asynchronous tasks in series
    const fetchTitles = () => {
      if (addresses.length === 0) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>');

        titles.forEach((item) => {
          res.write(`<li>${item.address} - "${item.title}"</li>`);
        });

        res.write('</ul></body></html>');
        res.end();
      } else {
        const currentAddress = addresses.shift();
        getTitle(currentAddress, fetchTitles);
      }
    };

    fetchTitles();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
