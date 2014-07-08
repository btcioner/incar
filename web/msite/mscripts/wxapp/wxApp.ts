module wxApp {
    // 向AngularJS注册
    export var _wxAppName = 'wxApp';
    export var _module = angular.module(_wxAppName, ['ngResource']);
    _module.config(['$locationProvider', ($locationProvider)=> {
        $locationProvider.html5Mode(true);
    }]);
}