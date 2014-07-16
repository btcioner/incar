module wxApp {
    // 向AngularJS注册
    export var _module = angular.module('wxApp', ['ngResource','ngRoute']);
    _module.config(['$locationProvider', '$routeProvider', ($locationProvider, $routeProvider)=> {
        $routeProvider.when('/msite/v/4s/:s4_id/activity/:tpl_name/:act_id/account/:acc_id',
            {
                templateUrl: '/msite/mpartials/MyActInfo.html',
                controller: 'myActInfoCtrl'
            });
//        $locationProvider.html5Mode(true);
    }]);
}