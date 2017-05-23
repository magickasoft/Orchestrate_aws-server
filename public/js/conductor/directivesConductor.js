

angular.module('app')
    .filter('date_euro', function() {
        return function( strIso ) {
            if ( strIso ) {
                var arrDate = strIso.replace( /\s.+$/, '' ).split("-");
                var y = arrDate[0], m = arrDate[1], d = arrDate[2];
                if ( parseInt( d, 10 ) === 0 || parseInt( m, 10 ) === 0 ) { return ''; }

                return d + '.' + m + '.' + y  + ' ' + strIso.replace( /^.+\s/, '' ).replace( /:\d\d$/, '' );
            }
            return "";
        };
    });



angular.module('app')
    .filter('nice_date', function() {
        return function( strIso ) {
            if ( strIso ) {
                var arrDate = strIso.replace( 'T', ' ').replace( /\s.+$/, '' ).split("-");
                var y = arrDate[0], m = arrDate[1], d = arrDate[2];
                if ( parseInt( d, 10 ) === 0 || parseInt( m, 10 ) === 0 ) { return ''; }
                return  m + '/' +  d + '/' + y;
            }
            return "";
        };
    });


angular.module('app')
    .filter('nice_error', function() {
        return function( x ) {
            var out = [];
            if ( typeof( x ) === "string" )  {
                out.push( x );
            } else if ( typeof( x ) === "array" )  {
                out = x;
            } else if ( typeof( x ) === "object" ) {
                for ( var k in x ) out.push( x[k] );
            }
            return  out.join("\n");
        };
    });




  angular.module('app')
  .filter('nice_datetime', function() {
      return function( strIso ) {
          if ( strIso ) {
              var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
                "Aug", "Sep", "Oct", "Nov", "Dec");

              var date = new Date( strIso.replace( /\-/g, "/" ).replace("T", " ").replace( /\..+$/, '' ) );

              var hours = date.getHours();
              var minutes = date.getMinutes();
              var ampm = hours >= 12 ? 'pm' : 'am';
              hours = hours % 12;
              hours = hours ? hours : 12; // the hour '0' should be '12'
              minutes = minutes < 10 ? '0'+ minutes : minutes;

              var y = "";
              if ( date.getUTCFullYear() != (new Date()).getUTCFullYear() ) {
                 y = date.getUTCFullYear() + ", ";
              }
              return y + m_names[ date.getUTCMonth() ] + " " + (date.getUTCDate()) +
                 ' ' + hours + ':' + minutes + ' ' + ampm;
          }
          return "";
      };
  });


    angular.module('app')
        .filter('nice_duration', function() {
            return function( t ) {
                var pad2 = function(x) { return ( x >= 10 ? x : "0" + x ); };
                var s = t % 60;
                var m = parseInt( t / 60, 10 );
                var h = parseInt( m / 60, 10 ); m = m % 60;
                return pad2( h ) + ":" + pad2(m) + ":" + pad2(s) ;
            };
        });

    angular.module('app')
        .filter('nice_track_name', function() {
            return function( t ) {
                // console.log( t.original );
                var basename = t.original.substring( t.original.lastIndexOf( "/" ) + 1 );
                var arrParts = basename.substring( 0, basename.length - 4 ).split("_");
                return arrParts[0] + " " + arrParts[ 1 ] + " " + arrParts[ 2 ];
            };
        });
    angular.module('app')
        .filter('before_eq', function() {
            return function( t ) {
                return t.substr( 0, t.indexOf( "=" ) - 1 );
            };
        });
    angular.module('app')
        .filter('before_dot', function() {
            return function( t ) {
                return t.substr( 0, t.indexOf( "." ));
            };
        });
    angular.module('app')
        .filter('nice_png', function() {
            return function( png ) {
                var basepath = png.substring( png.indexOf( "/public" )  +  "/public".length );
                if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                    basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
                }
                return basepath;
            };
        });

    angular.module('app')
        .filter('nice_audio', function() {
            return function( track ) {
                var basepath = '';
                if ( typeof( track.mp3 ) !== "undefined" ) {
                  basepath = track.mp3.substring( track.mp3.indexOf( "/public" )  +  "/public".length );
                  if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                      basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
                  }
                } else {

                  if ( typeof( track.wav ) === "undefined" ) return basepath;
                  basepath = track.wav.substring( track.wav.indexOf( "/public" )  +  "/public".length );
                  if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                      basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
                  }
                }
                return basepath;
            };
        });

    angular.module('app')
        .filter('encoded_file', function() {
            return function( contents ) {
               return 'data:text/plain;charset=utf-8,' + encodeURIComponent( contents );
            };
        });

