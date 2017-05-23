angular.module('app', [ 'angular-loading-bar', 'ngCookies' ] );

angular.module('app').controller('LoginController',       LoginController );

function LoginController( $scope, $rootScope, $cookies, $http ) {
    $scope.loading = false;
    $scope.error = "";
    $scope.form = {};
    $scope.data = {
        availableServers: [
            {id: '1', name: 'DEV Server', url: 'http://ec2-54-88-241-99.compute-1.amazonaws.com/auth'},
            {id: '2', name: 'UAT Server', url: 'http://ec2-52-207-212-15.compute-1.amazonaws.com/auth'}
        ],
        //selectedServer: {id: '2', name: 'UAT Server', url: 'http://ec2-52-207-212-15.compute-1.amazonaws.com/'}
    };
    $scope.comparisonServer = function (servers) {
        var availableServer;
        for(var i = 0; i < servers.length; i++) {
            if (servers[i].url.indexOf(window.location.href)!=-1) {
                availableServer = servers[i];
            }
        }
        return availableServer ? availableServer : servers[0];
    };
    $scope.data.selectedServer = $scope.comparisonServer($scope.data.availableServers);

    if (localStorage.getItem( API_ACCESS_TOKEN )) {
        var hdrs = {};
        hdrs[ API_AUTH_HEADER ] = "Bearer " + localStorage.getItem( API_ACCESS_TOKEN );
        $cookies.put( "access_token", localStorage.getItem( API_ACCESS_TOKEN ) );

        $http({
            method: 'GET',
            url: API_AUTH_ENDPOINT,
            headers: hdrs
        }).success(function (data, status, headers, config) {
            window.location.href = API_REDIRECT_ON_SUCCESS;
        }).error( function(data,status) {
            jQuery(".app-content").show();
        });
    } else {
       jQuery(".app-content").show();
    }

    $scope.onChangeServer = function () {
        console.log($scope.data.selectedServer);
        window.location.href = $scope.data.selectedServer.url;
    };
    $scope.getErrorMessage = function () {
        // for OAUTH compatibility:
        switch ($scope.error) {
            case "invalid_grant":   return "User or password is invalid";
            case "invalid_request": return "Invalid Authorization Code";
            case "invalid_client":  return "Client identifier is required";
        }
        return $scope.error;
    };


    $scope.canBeSubmitted = function() {
        return $scope.form.username;
    };

    $scope.submit = function () {

      $scope.loading = true;
      $scope.error = '';
        $http({
            method: 'POST',
            url: API_LOGIN_ENDPOINT,
            data: $.param( {
                "grant_type": "password",
                "username": $scope.form.username,
                "password": $scope.form.password,
                "useRefreshTokens": false
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(function (data, status, headers, config) {
            if ( data.access_token ) {
                localStorage.setItem( API_ACCESS_TOKEN, data.access_token);
                $cookies.put( "access_token", data.access_token );

                var sHref = API_REDIRECT_ON_SUCCESS;
                setTimeout( function() { window.location.href = sHref; }, 200 );
            } else {
                $scope.loading = false;
            }
        })
        .error(function (data, status, headers, config) {
            if ( data.error ) { $scope.error = data.error; }
            else if ( data.errors ) { $scope.error = data.errors.message; }
            else if ( data.status === 'failure') {
                $scope.error = "User or password is not valid";
            }
            if ( typeof( $scope.error ) === "string" ) {
                $scope.errors = [ $scope.error ];
            }
            $scope.loading = false;
        });
    };
}

LoginController.$inject = [ '$scope',  '$rootScope', '$cookies',  '$http' ];

