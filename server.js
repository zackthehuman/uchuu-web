/*global process, console */
(function() {

var http = require('http'),
  url = require('url'),
  path = require('path'),
  fs = require('fs'),
  querystring = require('querystring'),
  port = process.argv[2] || 8888,
  contentRoot = process.argv[3] || process.cwd();

http.createServer(function(request, response) {

  var uri = url.parse(request.url),
    query = uri.query,
    filename = null;

  //console.log(uri);

  if(uri.pathname === '/load') {
    //
    // Serve "mapped" content file
    //
    filename = path.join(contentRoot, querystring.unescape(query.split('=')[1]));
    console.log(uri);
    console.log(filename);

    fs.exists(filename, function(exists) {
      if(!exists) {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('404 Not Found\n');
        response.end();
        return;
      }

      if (fs.statSync(filename).isDirectory()) {
        filename += '/index.html';
      }

      fs.readFile(filename, 'binary', function(err, file) {
        var contentType = 'text/plain';

        if(err) {
          response.writeHead(500, {'Content-Type': contentType});
          response.write(err + '\n');
          response.end();
          return;
        }

        if(filename.indexOf('.png') != -1) {
          contentType = 'image/png';
        }

        response.writeHead(200, {'Content-Type': contentType});
        response.write(file, 'binary');
        response.end();
      });
    });
  } else {
    //
    // Serve application file
    //
    filename = path.join(process.cwd(), uri.pathname);
    console.log(filename);

    fs.exists(filename, function(exists) {
      if(!exists) {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('404 Not Found\n');
        response.end();
        return;
      }

      if (fs.statSync(filename).isDirectory()) {
        filename += '/index.html';
      }

      fs.readFile(filename, 'binary', function(err, file) {
        if(err) {
          response.writeHead(500, {'Content-Type': 'text/plain'});
          response.write(err + '\n');
          response.end();
          return;
        }

        response.writeHead(200);
        response.write(file, 'binary');
        response.end();
      });
    });
  }
}).listen(parseInt(port, 10));

console.log('Static file server running at\n  => http://localhost:' + port + '/\nContent root is \n  => "' + contentRoot + '"\nCTRL + C to shutdown');

}());