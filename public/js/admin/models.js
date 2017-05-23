(function() {

    angular.module('app')
        .factory('GroupsRecord',  ['Restangular', GroupsRecord ] )
    ;

    function GroupsRecord( Restangular ) {
        this.promise = {
            to : {
                get : function () {
                    return Restangular.all('groups/').getList();
                },
                read : function( id ) {
                    return Restangular.one('groups/', id).get();
                },
                destroy : function( id ) {
                    return Restangular.one('groups/', id).remove();
                },
                put : function( form ) {
                    var f = angular.copy( form );
                    return Restangular.all('groups/').post( f );
                },
                save : function( id, form ) {
                    var f = angular.copy( form );
                    f._method = "PUT";
                    return Restangular.one('groups/', id).customPOST( f );
                }
            }
        };
        return this;
    }

    angular.module('app')
        .factory('Instruments',  ['Restangular', Instruments ] )
    ;

    function Instruments( Restangular ) {
        this.promise = {
            to : {
                get : function () {
                    return Restangular.all('instruments/').getList();
                },
                read : function( id ) {
                    return Restangular.one('instruments/', id).get();
                },
                destroy : function( id ) {
                    return Restangular.one('instruments/', id).remove();
                },
                put : function( form ) {
                    var f = angular.copy( form );
                    return Restangular.all('instruments/').post( f );
                },
                save : function( id, form ) {
                    var f = angular.copy( form );
                    f._method = "PUT";
                    return Restangular.one('instruments/', id).customPOST( f );
                }
            }
        };
        return this;
    }




    angular.module('app')
        .factory('Recording',  ['Restangular', Recording ] )
    ;

    function Recording( Restangular ) {

        this.promise = {
            to : {
                get : function () {
                    return Restangular.all('recordings/').getList();
                },
                read : function( id ) {
                    return Restangular.one('recordings/', id).get();
                },
                destroy : function( id ) {
                    return Restangular.one('recordings/', id).remove();
                },
                put : function( form ) {
                    var f = angular.copy( form );
                    return Restangular.all('recordings/').post( f );
                },
                save : function( id, form ) {
                    var f = angular.copy( form );
                    f._method = "PUT";
                    return Restangular.one('recordings/', id).customPOST( f );
                }
            }
        };
        return this;
    }


    angular.module('app')
        .factory('UsersRecord',  ['Restangular', UsersRecord ] )
    ;

    function UsersRecord( Restangular ) {

        this.promise = {
            to : {
                get : function () {
                    return Restangular.all('users/').getList();
                },
                read : function( id ) {
                    return Restangular.one('users/', id).get();
                },
                destroy : function( id ) {
                    return Restangular.one('users/', id).remove();
                },
                put : function( form ) {
                    var f = angular.copy( form );
                    return Restangular.all('users/').post( f );
                },
                save : function( id, form ) {
                    var f = angular.copy( form );
                    f._method = "PUT";
                    return Restangular.one('users/', id).customPOST( f );
                }
            }
        };
        return this;
    }



})();
