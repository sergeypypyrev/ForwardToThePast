const Hapi = require('@hapi/hapi');

const CONFIG = require('./config');
const cache = require('./cache');

require('@babel/register')({
	presets: ['@babel/preset-react', '@babel/preset-env']
});

async function start() {
	const server = Hapi.server({
		port: CONFIG.PORT,
		host: 'localhost'
	});
	await server.register(require('@hapi/vision'));
	server.views({
		engines: {
			jsx: require('hapi-react-views')
		},
		relativeTo: __dirname,
		path: 'view'
	});
	server.route(require('./route/index'));
	await server.start();
}

let yesExit = false;
function maybeExit() {
	if (yesExit && !cache.saving)
		process.exit(0);
}

function requestExit() {
	yesExit = true;
	maybeExit();
}

cache.addListener(maybeExit);
process.on('SIGTERM', requestExit);
process.on('SIGINT', requestExit);
start();
