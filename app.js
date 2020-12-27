/*global __dirname require process */

/*
 * Server-side application for simulating a mahjong game.
 * Usage: node app.js
 * Then visit http://localhost:3000/game
 */
var argv = require('optimist').argv,
    config = require('./server/config'),
    cgh = require('./server/connect-githubhook'),
    crypto = require('./server/crypto'),
    db = require('./server/db'),
    express = require('express'),
    path = require('path'),
    shared = require('./shared/shared'),
    swig = require('swig');

var MongoStore = require('connect-mongo')(express)

require('dotenv').config()

var app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    cookieParser = express.cookieParser(config.EXPRESS_COOKIE_SECRET);

io.set('log level',0);

// Connect to the DB and then start the application
db.init(function(error) {
    if (error) {
        throw error;
    }

var sessionStore = new MongoStore({db: db.session, auto_reconnect: true/*, username: process.env.DB_USER, password: process.env.DB_PASS*/});

// TODO(gleitz): disable in production
// io.set('log level', 1); // reduce logging

app.configure(function(){
    app.use(express['static'](__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(cookieParser);
    app.use(express.session({
        store: sessionStore,
        secret: config.EXPRESS_SESSION_SECRET
    }));
    app.use(app.router);
    app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));
    app.use(express.errorHandler({dumpExceptions: true,
                                  showStack: true}));

    // github hook reloading
    var github_hook_path = '/' + config.GITHUBHOOK_SECRET,
        github_hook_obj = {};
    github_hook_obj[github_hook_path] = {url: 'https://github.com/gleitz/mahjong',
                                         branch: 'master'}
    app.use(cgh(github_hook_obj,
                function(repo, payload) {
                    console.log('Post-receive trigger. Exiting in 1 second');
                    setTimeout(function() {
                        process.exit(1);
                    }, 1000);
                }));
});

// Swig templating
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
shared.augmentSwig(swig);

// Disable the cache
// TODO: remove in production
swig.setDefaults({ cache: false });
app.set('view cache', false);

// Add the application routes
require('./server/routes').addRoutes(app);
// Add socket.io triggers
require('./server/routes').addSockets(io);

// Socket.io session configuration
io.set('authorization', function (data, callback) {
    if (data && data.query && data.query.token) {
        var session_id = crypto.decrypt(data.query.token);
        sessionStore.get(session_id, function (error, session) {
            // Add the session_id. This will show up in
            // socket.handshake.session_id.
            data.session_id = session_id;
            if (error) {
                callback('ERROR', false);
            } else if (!session) {
                callback('NO_SESSION', false);
            } else {
                // Add the session. This will show up in
                // socket.handshake.session.
                data.session = session;
                data.session.id = session_id;
                callback(null, true);
            }
        });
    } else {
        callback('NO_TOKEN', false);
    }
});

    var port = argv.port || 10003;
    server.listen(port);
    console.log('listening on ' + port);
});
