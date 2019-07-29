const fs = require('fs');
const path = require('path');
const qs = require('querystring');
var users = {};
var rank = [];

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getLeaders(id) {

	var x = false;
	var l = [];

	for (i = 0; i < 5; i++) {
		try {
			if (rank[i] === id) {
				l[i] = users[rank[i]]['time'] + 'you';
				x = true;
			} else {
				l[i] = users[rank[i]]['time'];
			}
		} catch (e) {}
	}

	if (x === false) {
		try {
			l[5] = users[id]['time'] + 'you';
		} catch (e) {}
	}

	return l;
}

require('http').createServer( (req, res) => {

	switch (req.method) {

		case 'GET':

			var options = {}, url, type = 'file';

			if (req.url.slice(0, 7) === '/update'){
				
				var id = req.url.replace('/update', '');
				var leaderboard = getLeaders(id);
				users[id]['lastUpdate'] = (new Date).getTime();
				res.writeHead(200);
				res.end(JSON.stringify(leaderboard));
				
			} else {
				switch (req.url) {

					case '/':
					case '/?':
						options = {
							'Content-type': 'text/html'
						};
						url = path.join(__dirname, '/grow.html');
						break;

					case '/grass.png':
						options = {
							'Content-type': 'image/png'
						};
						url = path.join(__dirname, req.url);
						break;

					case '/sky.jpeg':
						options = {
							'Content-type': 'image/jpeg'
						};
						url = path.join(__dirname, req.url);
						break;

					case '/favicon.ico':
						options = {
							'Content-type': 'image/x-icon'
						};
						url = path.join(__dirname, req.url);
						break;

					case '/new':
						var id = uuidv4();
						options.id = id;

						rank[rank.length] = id;
						users[id] = [];
						users[id]['start'] = (new Date).getTime();
						users[id]['time'] = 0;
						users[id]['lastUpdate'] = (new Date).getTime();
						

						type = 'update';
						console.log('[NEW USER] ' + id);
						break;

					default:
						options = false;
						break;
				}
				
				if (fs.existsSync(url) && options !== false && type === 'file') {
					res.writeHead(200, options);
					fs.createReadStream(url).pipe(res);
				} else if (type === 'update') {
					res.writeHead(200);
					res.end(JSON.stringify(options.id));
				} else {
					console.log('Missing directory ' + req.url);
					res.writeHead(500);
				}
				break;
			}

	}

}).listen(80);

setInterval(() => {
	for (i = 0; i < rank.length; i++){
		var id = rank[i];
		if ((new Date).getTime() - users[id]['lastUpdate'] > 60000){
			console.log('[USER LEFT] ' + id);
			rank.splice(rank.indexOf(id), 1);
			delete users[id];
			i--;
		} else {
			users[id]['time'] = (new Date).getTime() - users[id]['start'];
		}
	}
}, 60000)

console.log('Server started and listening on port 80');