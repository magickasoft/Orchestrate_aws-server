angular.module('app', [ "ngRoute", 'ngAnimate', 'angular-loading-bar', 'restangular', 'ngCookies' ] );
angular.module('app').config( AppRouteProvider ).run( AppRunner );

/* @ngInject */
function AppRouteProvider( RestangularProvider, $routeProvider, $locationProvider ) {

    RestangularProvider.setBaseUrl( API_BASE );
    RestangularProvider.setRestangularFields({ id: "id" });

    var STATIC_HTML_ROOT = HTML_BASE + "html/admin";
    $routeProvider

        .when( '/instruments/create',      { templateUrl: STATIC_HTML_ROOT + '/instruments-create.html',     controller: 'InstrumentsCreateCtrl' } )
        .when( '/instruments/:id',         { templateUrl: STATIC_HTML_ROOT + '/instruments-edit.html',        controller: 'InstrumentsEditCtrl' } )
        .when( '/instruments',             { templateUrl: STATIC_HTML_ROOT + '/instruments-index.html',       controller: 'InstrumentsIndexCtrl' } )

        .when( '/groups/create',      { templateUrl: STATIC_HTML_ROOT + '/groups-create.html',     controller: 'GroupsCreateCtrl' } )
        .when( '/groups/:id',         { templateUrl: STATIC_HTML_ROOT + '/groups-edit.html',        controller: 'GroupsEditCtrl' } )
        .when( '/groups',             { templateUrl: STATIC_HTML_ROOT + '/groups-index.html',       controller: 'GroupsIndexCtrl' } )

        .when( '/recordings/:id',         { templateUrl: STATIC_HTML_ROOT + '/recordings-edit.html',  controller: 'RecordingsEditCtrl' } )
        .when( '/recordings',             { templateUrl: STATIC_HTML_ROOT + '/recordings-index.html', controller: 'RecordingsIndexCtrl' } )

        .when( '/users/create',      { templateUrl: STATIC_HTML_ROOT + '/users-create.html',       controller: 'UsersCreateCtrl' } )
        .when( '/users/:id',         { templateUrl: STATIC_HTML_ROOT + '/users-edit.html',         controller: 'UsersEditCtrl' } )
        .when( '/users',             { templateUrl: STATIC_HTML_ROOT + '/users-index.html',        controller: 'UsersIndexCtrl' } )

        .when( '/',       { templateUrl: STATIC_HTML_ROOT + '/dashboard.html' } )
       // .otherwise( { "redirectTo" : "/"} )
    ;
}
AppRouteProvider.$inject = [ 'RestangularProvider', '$routeProvider', '$locationProvider' ];


/* @ngInject */
function AppRunner($rootScope, Restangular, $timeout, $window, $location, $cookies, $templateCache ) {
    $rootScope.threads = [];

    $rootScope.$on( '$viewContentLoaded', function() { $templateCache.removeAll(); });
    $rootScope.$on( '$routeChangeStart',  function(event, toState, toParams, fromState, fromParams) {
        $rootScope.errors = [];
        $rootScope.user = localStorage.getItem("user");

        $rootScope.back = function() {
            $window.history.back();
        };
    });
    $rootScope.$on('$routeChangeSuccess', function () {
        $timeout(function () { $window.scrollTo(0,0); }, 1 );
    });

    $rootScope.logout = function() {
        localStorage.setItem( API_ACCESS_TOKEN, "" );
        $cookies.put( "access_token", "" );

        window.location.href = API_REDIRECT_ON_LOGOUT;
    };

    // RESTANGULAR INTERCEPTION
    Restangular.setResponseInterceptor(function( data, operation, what, url, response, deferred) {
        console.log( "ResponseInterceptor " + url  + " " + response.status );

        $rootScope.threads.push( url );
        $rootScope.loading = false;
        return data;
    });

    Restangular.setRequestInterceptor(function(elem, operation, what, url) {
        $rootScope.errors = []; // very awkward....should not this be fixed?

        $rootScope.loading = true;
        $rootScope.threads.pop();

        if ( localStorage.getItem( API_ACCESS_TOKEN ) ) {
            Restangular.setDefaultHeaders({
                'X-Access-Token': 'Bearer ' + localStorage.getItem( API_ACCESS_TOKEN )
            });
        }
        // delete elem.extraInfo;
        return elem;
    });


    Restangular.setErrorInterceptor(function(response ) {
        console.log( "errorInterceptor " + response.status );
        console.log( response );

        $rootScope.threads.pop();
/*
        if ( response.status >= 400 ) {
            if ( response.data !== undefined ) {
                if ( typeof( response.data ) == "string" ) {
                  $rootScope.errors.push( response.data );
                } else if ( typeof( response.data.errors.message ) == "string" ) {
                  $rootScope.errors.push( response.data.errors.message );
                } else if ( typeof( response.data.errors ) == "string" ) {
                  $rootScope.errors.push( response.data.errors );
                } else if ( typeof( response.data.error.message ) == "string" ) {
                  $rootScope.errors.push( response.data.error.message );
                } else if ( typeof( response.data.error ) == "string" ) {
                  $rootScope.errors.push( response.data.error );
                } else {
                  for ( var field in response.data ) {
                      $rootScope.errors.push( response.data[ field ].join("\n") );
                  }
                }
            }
            if ( $rootScope.errors.length === 0 ) {
              $rootScope.errors.push( "Server Error " + response.status );
            }
        }*/
        $rootScope.loading = false;
        if ( response.status == 403 || response.status == 401 ) {
            // auth errors handling
            $rootScope.errors.push( "Access is Forbidden. Please re-login" );
        } else if ( response.status == 404 ) {
            if ( $rootScope.errors.length === 0 ) $rootScope.errors.push( "Resource not found" );
        } else if ( response.status == 405 ) {
            if ( $rootScope.errors.length === 0 ) $rootScope.errors.push( "Method not allowed" );
        } else if ( response.status == 422 ) {
            if ( $rootScope.errors.length === 0 ) $rootScope.errors.push( "Validation Error" );
        } else if ( response.status == 426 ) {
            setTimeout( $rootScope.logout, 1000 );
        } else if ( response.status >= 500 ) {
            if ( $rootScope.errors.length === 0 ) $rootScope.errors.push( "Server Error" );
        } else if ( response.data !== undefined ) {

            if ( response.data === null && response.status === 0 ) {
                $rootScope.errors.push( "Unable to connect to the server. " +
                    "Please refresh the page when internet connection will be restored" );

            } else if ( response.status === 401  ) {
                $rootScope.errors = response.data.errors;
            } else {
                // console.log( response.data.errors );
                if ( response.data  )
                  $rootScope.errors = response.data.errors;

                if ( $rootScope.errors.length === 0 ) {
                    $rootScope.errors.push( "Server response status: " + response.status );
                }
            }
        }
    });

}
AppRunner.$inject = ['$rootScope', 'Restangular', '$timeout', '$window', '$location', '$cookies', '$templateCache'];



jQuery(document).ready(function () {

    if (! localStorage.getItem( API_ACCESS_TOKEN ) ) {
        // document.cookie = "";
        // window.location.href = API_REDIRECT_ON_LOGOUT;
        // console.error();
        return;
    }
    $(".app-content").show();

    var hdrs = {};
    hdrs[ API_AUTH_HEADER ] = "Bearer " + localStorage.getItem( API_ACCESS_TOKEN );

    jQuery.ajax({
        type: 'GET',
        url: API_AUTH_ENDPOINT, headers: hdrs
    }).success(function (response) {

        // we're good. we are home. home knows it.

    }).fail(function (response) {
        console.warn( response );
        // localStorage.setItem( API_ACCESS_TOKEN, "" );
        // window.location.href = API_REDIRECT_ON_LOGOUT;
    });
});

