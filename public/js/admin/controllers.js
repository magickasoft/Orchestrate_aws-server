angular
    .module('app')

    .controller('GroupsCreateCtrl', ['$scope', 'GroupsRecord', GroupsCreateCtrl])
    .controller('GroupsEditCtrl',    ['$scope', '$routeParams', 'GroupsRecord', GroupsEditCtrl ])
    .controller('GroupsIndexCtrl',  ['$scope', 'GroupsRecord', GroupsIndexCtrl])

    .controller('InstrumentsCreateCtrl', ['$scope', 'Instruments', InstrumentsCreateCtrl ])
    .controller('InstrumentsEditCtrl',    ['$scope', '$routeParams', 'Instruments', InstrumentsEditCtrl ])
    .controller('InstrumentsIndexCtrl',  ['$scope', 'Instruments', InstrumentsIndexCtrl ])

    .controller('RecordingsIndexCtrl',  ['$scope', 'Recording', 'GroupsRecord', RecordingsIndexCtrl])
    .controller('RecordingsEditCtrl',    ['$scope', '$routeParams', 'Recording', RecordingsEditCtrl ])

    .controller('UsersIndexCtrl',   ['$scope', 'UsersRecord', UsersIndexCtrl])
    .controller('UsersCreateCtrl',  ['$scope', 'UsersRecord', UsersCreateCtrl])
    .controller('UsersEditCtrl',    ['$scope', '$routeParams', 'UsersRecord', UsersEditCtrl ])
;


function GroupsCreateCtrl( $scope, GroupsRecord ) {
    $scope.reload = function() { window.location.href = "#/groups"; };

    $scope.rnd = function( len ) {
        var text = "";
        var possible = "abcdefghjkmnpqrstuvwxyz0123456789";
        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    $scope.object = {
        InvitationCode:  Math.random().toFixed(6).replace( "0.", "" ),
        LoginCode : $scope.rnd( 8 )
    };
    $scope.save = function() {
        GroupsRecord.promise.to.put( $scope.object ).then( $scope.reload );
    };

    $scope.newInvitationCode = function() {
        $scope.object.InvitationCode = Math.random().toFixed(6).replace( "0.", "" );
    };
    $scope.newLoginCode = function() {
        $scope.object.LoginCode = $scope.rnd( 8 );
    };
}



function GroupsIndexCtrl($scope, GroupsRecord) {
    $scope.refresh = function() {
        GroupsRecord.promise.to.get().then( function( data ) { $scope.groups = data; });
    };
    $scope.destroy = function( obj ) {
         GroupsRecord.promise.to.destroy( obj.difs_id ).then( $scope.refresh );
    };
    $scope.refresh();
}


function GroupsEditCtrl( $scope, $routeParams, GroupsRecord ) {
    $scope.object = {};
    $scope.reload = function() { window.location.href = "#/groups"; };

    GroupsRecord.promise.to.read( $routeParams.id ).then( function( data ) { $scope.object = data; });

    $scope.rnd = function( len ) {
        var text = "";
        var possible = "abcdefghjkmnpqrstuvwxyz0123456789";
        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    $scope.newInvitationCode = function() {
        $scope.object.InvitationCode = Math.random().toFixed(6).replace( "0.", "" );
    };
    $scope.newLoginCode = function() {
        $scope.object.LoginCode = $scope.rnd( 8 );
    };

    $scope.save = function() {
        GroupsRecord.promise.to.save( $routeParams.id, $scope.object ).then( $scope.reload );
    };
    $scope.destroy = function() {
        GroupsRecord.promise.to.destroy( $routeParams.id ).then( $scope.reload );
    };
    $scope.canBeRemoved = function() {
        return $scope.object.Total <= 0;
    };
}


/// -------- /// -------- /// ------- /// ------- ///

function InstrumentsIndexCtrl($scope, Instruments) {
    $scope.refresh = function() {
        Instruments.promise.to.get().then( function( data ) { $scope.instruments = data; });
    };
    $scope.destroy = function( obj ) {
         Instruments.promise.to.destroy( obj._id ).then( $scope.refresh );
    };
    $scope.refresh();
}

function InstrumentsCreateCtrl( $scope, Instruments ) {
    $scope.object = {};
    $scope.reload = function() { window.location.href = "#/instruments"; };

    $scope.save = function() {
        Instruments.promise.to.put( $scope.object ).then( $scope.reload );
    };
}

function InstrumentsEditCtrl( $scope, $routeParams, Instruments ) {
    $scope.object = {};
    $scope.reload = function() { window.location.href = "#/instruments"; };

    Instruments.promise.to.read( $routeParams.id ).then( function( data ) { $scope.object = data; });
    $scope.save = function() {
        Instruments.promise.to.save( $routeParams.id, $scope.object ).then( $scope.reload );
    };
    $scope.destroy = function() {
        Instruments.promise.to.destroy( $routeParams.id ).then( $scope.reload );
    };
    $scope.canBeRemoved = function() {
        return true;
    };
}
/// -------- /// -------- /// ------- /// ------- ///

function RecordingsIndexCtrl($scope, Recording, GroupRecord ) {
    $scope.formatRecordings = [];
    $scope.search = {value: ''};
    $scope.refresh = function() {
        $scope.loading = true;
        $scope.arrGroups = {};
        Recording.promise.to.get().then( function( data ) {
            //console.log(data);
            $scope.recordings = data;
            $scope.loading = false;

            GroupRecord.promise.to.get().then( function( data ) {
                //console.log(data);
                for ( var i = 0; i < data.length ; i ++ ) {
                    $scope.arrGroups[ data[ i ]._id ] = data[i];
                }
                var thisRecordings = $scope.recordings;
                for ( var i = 0; i < thisRecordings.length ; i ++ ) {
                    //$scope.arrGroups[ thisRecordings[ i ]._id ] = thisRecordings[i];
                    $scope.formatRecordings[i] = thisRecordings[i];
                    $scope.formatRecordings[i].GroupName = $scope.getGroupName(thisRecordings[i].GroupId);
                }
                console.log($scope.formatRecordings);
            });
        });
    };
    $scope.searchModel = function( ) {
        console.log('check model: ',$scope.search.value);
    };
    $scope.destroy = function( obj ) {
         Recording.promise.to.destroy( obj._id ).then( $scope.refresh );
    };
    $scope.getGroupName = function( id ) {
        return  (typeof( $scope.arrGroups[ id ] ) !== "undefined" ) ?
                $scope.arrGroups[ id ].Name : "Group #" + id;
    };
    $scope.refresh();
}



function RecordingsEditCtrl( $scope, $routeParams, Recording ) {
    $scope.object = {};
    $scope.reload = function() { window.location.href = "#/recordings"; };
    $scope.active = 0;

    $scope.activateTrack = function( i ) {
        $scope.active = i;
    };


    $scope.loading = true;
    Recording.promise.to.read( $routeParams.id ).then( function( data ) {
        $scope.object = data;
        $scope.loading = false;
    } );

    $scope.filesVisible = false;
    $scope.toggleFiles = function() {
        $scope.filesVisible = !$scope.filesVisible;
        if ( $scope.filesVisible ) {
          setTimeout( function() {
            var copyTextarea = document.querySelector('#files');
            copyTextarea.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log( "copy to clipboard - " + msg );
            } catch (err) {
                console.log('Oops, unable to copy');
            }
          }, 500 );
        }
    };

    $scope.getFiles = function() {
        var arr = [];
        if ( typeof( $scope.object.tracks ) !== "undefined") {
          for ( var l = 0; l<$scope.object.tracks.length; l ++  ) {
            var t =  $scope.object.tracks[ l ];
            var url = "";
            if ( typeof( t.mp3 ) !== "undefined" ) {
                url = t.mp3;
            } else if ( typeof( t.wav ) !== "undefined" ) {
                url = t.wav;
            }
            if ( url ) {

              var basepath = url.substring( url.indexOf( "/public" )  +  "/public".length );
              if ( typeof( API_STORAGE_ROOT ) !== "undefined" ) {
                  basepath = API_STORAGE_ROOT.substring( 0, API_STORAGE_ROOT.length - 1 ) + basepath;
              } else {
                  basepath = "http://"  + location.hostname  + basepath;
              }
              arr.push( basepath );
            }
          }
        }
        return arr.join("\r\n");
    };

    $scope.downloadFiles = function() {
        var link = document.createElement('a');
        link.download = "channels" + $scope.object._id + ".txt";
        link.href = "data:text/csv," + encodeURIComponent( $scope.getFiles() );
        link.click();
    };

    $scope.canBeRemoved = function(){ return true; };

    $scope.destroy = function(){
        $('#modalByDelete').modal('hide');
        Recording.promise.to.destroy( $routeParams.id ).then( function() {
           location.href = "#/recordings";
        });
    };
}



/// -------- /// -------- /// ------- /// ------- ///

function UsersIndexCtrl( $scope, UsersRecord ) {

    $scope.refresh = function() {
        UsersRecord.promise.to.get().then( function( data ) { $scope.users = data; });
    };
    $scope.destroy = function( obj ) {
        UsersRecord.promise.to.destroy( obj.ucac_id ).then( $scope.refresh );
    };
    $scope.refresh();
}


function UsersCreateCtrl( $scope, UsersRecord ) {
    $scope.reload = function() { window.location.href = "#/users"; };

    $scope.object = {
        ucac_status : 1
    };
    $scope.save = function() {
        UsersRecord.promise.to.put( $scope.object ).then( $scope.reload );
    };
}

function UsersEditCtrl( $scope, $routeParams, UsersRecord ) {
    $scope.object = {};
    $scope.reload = function() { window.location.href = "#/users"; };

    UsersRecord.promise.to.read( $routeParams.id ).then( function( data ) { $scope.object = data; });

    $scope.save = function() {
        UsersRecord.promise.to.save( $routeParams.id, $scope.object ).then( $scope.reload );
    };
    $scope.destroy = function() {
        UsersRecord.promise.to.destroy( $routeParams.id ).then( $scope.reload );
    };
    $scope.canBeRemoved = function() {
        // TODO: check if this is a current user.
        return true;
    };

}

