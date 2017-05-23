angular.module('app', [ 'angular-loading-bar', 'ngCookies' ] );

angular.module('app').controller('LoginConductorController',       LoginConductorController );

function LoginConductorController( $scope, $rootScope, $cookies, $http ) {
    $scope.loading = false;
    $scope.error = "";
    $scope.form = {};
    console.log('LoginConductorController init');
    jQuery(".app-content").show();


    $scope.canBeSubmitted = function() {
        return $scope.form.logincode;
    };

    $scope.submit = function () {
    console.log('click');
      $scope.loading = true;
      $scope.error = '';
        $http({
            method: 'POST',
            url: API_LOGIN_ENDPOINT,
            data: $.param( {
                "logincode": $scope.form.logincode
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(function (data, status, headers, config) {
            if ( data.LoginCode ) {
                var sHref = API_REDIRECT_ON_SUCCESS;
                setTimeout( function() { window.location.href = sHref+'/'+ data.LoginCode; }, 200 );
            } else {
                $scope.loading = false;
            }
        })
        .error(function (data, status, headers, config) {
            if ( data.error ) { $scope.error = data.error; }
            else if ( data.errors ) { $scope.error = data.errors.message; }
            else if ( data.status === 'failure') {
                $scope.error = "LoginCode is not valid";
            }
            if ( typeof( $scope.error ) === "string" ) {
                $scope.errors = [ $scope.error ];
            }
            $scope.loading = false;
        });
    };
}

LoginConductorController.$inject = [ '$scope',  '$rootScope', '$cookies',  '$http' ];

