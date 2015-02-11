var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var grus = require('grus');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));


app.use(grus({
    writeToConsole:true,
    saveToMySQL: {
        host: 'server.com',
        port: 3306,
        user: 'user',
        password: 'pass',
        database: 'grus'
    }
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.get('/dailyStat', function(req, res) {
    grus.collectStatDaily('2015-02-03 00:00:00', '2015-02-09 23:59:59', function(summary) {
        res.send(summary);
    });

})
app.get('/hourlyStat', function(req, res) {
    grus.collectStatHourly('2015-02-03 00:00:00', '2015-02-09 23:59:59', function(summary) {
        res.send(summary);
    });

})
app.get('/stat', function(req, res) {
    grus.collectStatAll('2015-02-03 00:00:00', '2015-02-09 23:59:59', function(summary) {
        res.send(summary);
    });

})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
