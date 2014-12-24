var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found!');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {
    'content-type': mime.lookup(path.basename(filePath))
  });

  response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
  //is file already in memory?
  if (cache[absPath]) {
    //serve file from memory :)))
    sendFile(response, absPath, cache[absPath]);
  } else {
    //check if the file exists
    fs.exists(absPath, function(exists){
      if (exists) {
        //read file from disk
        fs.readFile(absPath, function(err, data){
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

var server = http.createServer(function(request, response) {
  var filePath = false;

  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }

  var absPath = './' + filePath;
  serveStatic(response, cache, absPath)
});

server.listen(3000, function() {
  console.log('server listening on port 3000');
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);