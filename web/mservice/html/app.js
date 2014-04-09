'use strict';

angular
    .module('websiteApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute'
    ])
    .config(function ($routeProvider, $locationProvider, $httpProvider) {
        $routeProvider
            .when('/mservice/html', {
                templateUrl: '/mservice/html/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/mservice/html'
            });
        $locationProvider.html5Mode(true);

    });
