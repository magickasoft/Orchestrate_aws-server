var fs = require("fs"),
    Q = require( "q" );


var path = require("path"),
    log4js = require( "log4js" );

log4js.configure({
    appenders: [
        { type: 'file',
          filename: path.join(__dirname, '/../public/log') + "/application.log",
          maxLogSize: 1000000,
          compress : 1,
          backups: 50 }
    ]
});

var logger = log4js.getLogger();
logger.setLevel('ALL');

exports = module.exports;


exports.log = function ( x ) {
    return exports.trace( x );
};
exports.error = function ( x ) {
    console.log( "[" + ( new Date() ).toISOString() + "] [ERROR] " + x  );
    logger.error( x );
};
exports.trace = function ( x ) {
    console.log( "[" + ( new Date() ).toISOString() + "] [TRACE] " + x  );
    logger.trace( x );
};
exports.info = function ( x ) {
    console.log( "[" + ( new Date() ).toISOString() + "] [INFO]  " + x  );
    logger.info( x );
};
exports.warn = function ( x ) {
    console.log( "[" + ( new Date() ).toISOString() + "] [WARN]  " + x  );
    logger.warn( x );
};
exports.debug = function ( x ) {
    console.log( "[" + ( new Date() ).toISOString() + "] [DEBUG]  " + JSON.stringify( x ) );
    logger.debug( JSON.stringify( x ) );
};



exports.errorWatcher = function (error) {
    console.log( "[" + ( new Date() ).toISOString() + "] ERROR CAUGHT:");
    console.error( error );
};

exports.responseErrorWatcher = function( req, res ) {
    return function( errorMessage ) {
        // exports.log( "\n\n\nERROR MESSAGE : " + typeof( errorMessage  ) );

        var arrErrors = [];
        if ( typeof( errorMessage  ) === 'object' )  {
            if ( errorMessage.toString  !== undefined ) {
                arrErrors.push( errorMessage.toString() );
            } else {
                for ( var e in errorMessage ) {
                    exports.log( e );
                    arrErrors.push( errorMessage[e] );
                }
            }
        } else {
            arrErrors.push( errorMessage );
        }
        res.status(501).json( { "errors" : arrErrors } );
        exports.errorWatcher( errorMessage );
    };
};

exports.noError = function( err, req, res ) {
    if ( err ) {
        exports.responseErrorWatcher( req, res );
        return false;
    }
    return true;
};

exports.shellescape = function(s) {
  if ( /^win/.test(process.platform) ) {
	return s;
  }
  // for unix only: 
  if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
      s = "'"+s.replace(/'/g,"'\\''")+"'";
      s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
        .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
  }
  return s;
};


exports.promise = {
    to : {

        execute : function ( command ) {
            var deferred = Q.defer();
            try {
                if ( command === undefined  || command === '' ) {
                    throw "empty command is provided";
                }
                exports.trace( "Exec: " + command );

                // TODO: refactor into spawn instead of exec due to issues of buffer overflow
                require('child_process').exec( command, {maxBuffer: 1024 * 500}, function (error, stdout, stderr) {
                    if ( error ) {
                        exports.error( "Exec ERROR: " + error );
                        deferred.reject( error );
                    } else {
                        if ( stdout ) {
                            exports.info( "Exec STDOUT: " + stdout );
                        }
                        deferred.resolve( stdout );
                    }
                });
            } catch (ex) {
                deferred.reject( ex );
            }
            return deferred.promise;
        },

        write : function( obj, file, sContents ) {
            if ( file === undefined ) {
                throw "File name required on rw.promise.to.write";
            }

            var deferred = Q.defer();
            exports.trace( "filewriter [" + file + "]: started");
            fs.writeFile( file, sContents, { encoding :"utf8" }, function (err) {
                try {
                    if (err) {
                        deferred.reject( err ); // rejects the promise with `er` as the reason
                    } else {
                        exports.log( "writer["+file+"]: finished");
                        deferred.resolve( obj ); // fulfills the promise with `data` as the value
                    }
                } catch (ex) {
                   deferred.reject( ex );
                }
            });
            return deferred.promise;
        }
    }
};
