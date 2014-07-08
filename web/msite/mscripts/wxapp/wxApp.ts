module wxApp {
    // 向AngularJS注册
    export var _module = angular.module('wxApp', ['ngResource']);
    _module.config(['$locationProvider', ($locationProvider)=> {
        $locationProvider.html5Mode(true);
    }]);
}