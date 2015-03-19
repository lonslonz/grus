Grus
====
Saving and retrieving the runtime NodeJS server performance: tps, range of response time of each api.

# Description

Measures node server's the response time of requests and accumulated them to a range of response time. 
The tps, range of response time are inserted in MySQL tables. 
The performance summary(tps, total elapsed, total request) and response time rate are retrieved by Grus's collecting api function.
Generally, collecting api can be used to make hourly, daily, weekly performance report. 

For a example of result (daily performance statistics) :

    [
	{
		"beginTime": "2015-02-03 00:00:00",
		"endTime": "2015-02-04 00:00:00",
		"avgTps": "957.88",
		"avgRespMillis": "1.05",
		"totalElapsedMillis": "23.38",
		"totalCount": 22,
		"rangeOfResponseTime": {
			"~ 10 ms": "100.00 %",
			"~ 50 ms": "0.00 %",
			"~ 100 ms": "0.00 %",
			"~ 200 ms": "0.00 %",
			"~ 500 ms": "0.00 %",
			"~ 1000 ms": "0.00 %",
			"~ 2000 ms": "0.00 %",
			"~ 5000 ms": "0.00 %",
			"~ 9999999 ms": "0.00 %"
		}
	},
	{
		"beginTime": "2015-02-06 00:00:00",
		"endTime": "2015-02-07 00:00:00",
		"avgTps": "750.18",
		"avgRespMillis": "1.57",
		"totalElapsedMillis": "29.35",
		"totalCount": 26,
		"rangeOfResponseTime": {
			"~ 10 ms": "100.00 %",
			"~ 50 ms": "0.00 %",
			"~ 100 ms": "0.00 %",
			"~ 200 ms": "0.00 %",
			"~ 500 ms": "0.00 %",
			"~ 1000 ms": "0.00 %",
			"~ 2000 ms": "0.00 %",
			"~ 5000 ms": "0.00 %",
			"~ 9999999 ms": "0.00 %"
		}
	}
    ]

# Install

    npm install grus
    
# Usage

Work with express. Just call app.use() function with grus() parameter when server init. When you give 'saveToMySQL' null, grus writes performance data to './log.txt' as well as console(default).

    var app = express();
    var grus = require('grus');
    
    app.use(grus(
        {
            saveToMySQL: null
        })
    );

# Usage : Work with MySQL
    
Recommended : Use MySQL. When you want to save data into MySQL, use option 'saveToMySQL'.
    
    app.use(grus({
        saveToMySQL: {
            host: 'your.mysql.server',
            port: 3306,
            user: 'your id',
            password: 'your password',
            database: 'grus'
        }
    }));

    
Create database for grus

    create database grus;
    
Create following tables for saving data into MySQL. You should manage MySQL partitions periodically.
    
    CREATE TABLE `perf_view` (
      `perf_id` int(11) NOT NULL AUTO_INCREMENT,
      `server` varchar(64) DEFAULT NULL,
      `tps` double DEFAULT NULL,
      `avg_resp` double DEFAULT NULL,
      `total_elapsed` double DEFAULT NULL,
      `total_count` bigint(20) DEFAULT NULL,
      `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`perf_id`,`update_time`),
      KEY `idx_update_time` (`update_time`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8
    /*!50100 PARTITION BY RANGE (UNIX_TIMESTAMP(update_time))
    (PARTITION p20150101 VALUES LESS THAN (UNIX_TIMESTAMP('2015-01-01 00:00:00')) ENGINE = InnoDB,
     PARTITION p20150201 VALUES LESS THAN (UNIX_TIMESTAMP('2015-02-01 00:00:00')) ENGINE = InnoDB,
     PARTITION p20150301 VALUES LESS THAN (UNIX_TIMESTAMP('2015-03-01 00:00:00')) ENGINE = InnoDB,
     PARTITION p20150401 VALUES LESS THAN (UNIX_TIMESTAMP('2015-04-01 00:00:00')) ENGINE = InnoDB) */;
 
     CREATE TABLE `resp_range` (
      `resp_range_id` int(11) NOT NULL AUTO_INCREMENT,
      `perf_id` int(11) NOT NULL,
      `resp_range` bigint(20) DEFAULT NULL,
      `resp_count` double DEFAULT NULL,
      `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`resp_range_id`,`update_time`),
      KEY `idx_update_time` (`update_time`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8
    /*!50100 PARTITION BY RANGE (UNIX_TIMESTAMP(update_time))
    (PARTITION p20150101 VALUES LESS THAN (UNIX_TIMESTAMP('2015-01-01 00:00:00')) ENGINE = InnoDB,
     PARTITION p20150201 VALUES LESS THAN (UNIX_TIMESTAMP('2015-02-01 00:00:00')) ENGINE = InnoDB,
     PARTITION p20150301 VALUES LESS THAN (UNIX_TIMESTAMP('2015-03-01 00:00:00')) ENGINE = InnoDB,
     PARTITION p20150401 VALUES LESS THAN (UNIX_TIMESTAMP('2015-04-01 00:00:00')) ENGINE = InnoDB) */;

When you make server run, grus will insert performance data into those tables. You can select tables to see performance. And you also can use collectStat* functions to see performance statistics. 

    nodetps.collectStatDaily('2015-02-03 00:00:00', '2015-02-09 23:59:59', function(summary){ console.log(summary});
    nodetps.collectStatHourly('2015-02-03 00:00:00', '2015-02-09 23:59:59', function(summary){ console.log(summary});
    nodetps.collectDailyStat('2015-02-03 00:00:00', '2015-02-03 23:59:59', function(summary){ console.log(summary});

They return collected data as a JSON. For example, you can change it to HTML and send it as a mail daily.

    {
	"beginTime": "2015-02-03 05:00:00",
	"endTime": "2015-02-09 23:59:59",
	"avgTps": "750.18",
	"avgRespMillis": "1.57",
	"totalElapsedMillis": "29.35",
	"totalCount": 26,
	"rangeOfResponseTime": {
		"~ 10 ms": "100.00 %",
		"~ 50 ms": "0.00 %",
		"~ 100 ms": "0.00 %",
		"~ 200 ms": "0.00 %",
		"~ 500 ms": "0.00 %",
		"~ 1000 ms": "0.00 %",
		"~ 2000 ms": "0.00 %",
		"~ 5000 ms": "0.00 %",
		"~ 9999999 ms": "0.00 %"
	}	
    }

# Options

You can give grus options when grus init

    app.use(grus(
            {
                rangeReponseMillis : [10, 50, 100, 9999999],
                writeToConsole : false,
            })
        );
    
default options is 

    
	var optionsDefault  = {
	    // range of response time by millis. eg.) ~ 10ms, ~ 50ms, ~ 100ms
	    rangeReponseMillis : [10, 50, 100, 200, 500, 1000, 2000, 5000, 9999999],
	    // interval that collected data are saved into MySQL
	    saveIntervalSec : 60000,
	    // write collected data(tps, response time) to console
	    writeToConsole : true,
	    // insert data into MySQL. Connection information of [node-mysql](https://github.com/felixge/node-mysql/)
	    // saveToMySQL: {
	    //   host: 'your.mysql.server',
	    //   port: 3306,
	    //   user: 'your id',
	    //   password: 'your password',
	    //   database: 'grus'
	    // }
	    saveToMySQL : null,
	    // write collected data to file. 
	    saveToFile : './grus.log',
	    // target url for performance measuring. when value is '/my', '/myapi', '/my/post' are target urls.
	    // normally collecting response time if for requesting REST api not getting static files
	    includeUrlStartWith : ['/'],
	    // static files extension that want to exclude. 
	    excludeStaticFilesExt : ['css', 'js', 'html', 'htm', 'jpg', 'png', 'gif', 'ico']
	};

In real environment, give 'saveToMySQL' option and turn off saveToFile, writeToConsole. recommended setting is 

	app.use(grus({
	        saveToMySQL: {
	            host: 'your.mysql.server',
	            port: 3306,
	            user: 'your id',
	            password: 'your password',
	            database: 'grus'
	        },
	        writeToConsole : false,
	        saveToFile : null
	}));

# Example

	var grus = require('grus');
	var app = express();

	app.use(nodetps({
	    writeToConsole:true,
	    saveToMySQL: {
	        host: 'mysql.server.com',
	        port: 3306,
	        user: 'user',
	        password: 'password',
	        database: 'grus'
	    }
	}));

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

