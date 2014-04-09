'use strict';

angular.module('websiteApp')
    .controller('MainCtrl', function ($scope, $http) {
        $scope.testFuelData = function() {
            var postData = {};
            postData.user = 'o1fUut4FYMq3xJP0zs_hNAjAbVvQ';
            postData.end = new Date();
            postData.start = new Date('2014/03/01');
            $http.post('/mservice/fuelData', postData).success(function(data, status, headers, config) {
                $scope.data = data;
            }).error(function(data, status) {
                $scope.data = 'error';
            });
        };
        $scope.testCarbonData = function() {
            var postData = {};
            postData.user = 'o1fUut4FYMq3xJP0zs_hNAjAbVvQ';
            postData.end = new Date();
            postData.start = new Date('2014/02/01');
            $http.post('/mservice/carbonData', postData).success(function(data, status, headers, config) {
                $scope.data = data;
            }).error(function(data, status) {
                    $scope.data = 'error';
                });
        };
        $scope.testEnrollUser = function() {

            var postData = {};
            postData.user = 'o1fUut4FYMq3xJP0zs_hNAjAbVvQ';
            postData.obd_code = 'WFQ00013044';
            postData.owner_flag = 1;
            postData.enroll_time = new Date();

            $http
                .post('/mservice/enroll', postData).success(function(data, status, headers, config) {
                $scope.data = data;
                })
                .error(function(data, status) {
                    $scope.data = 'error';
                });
        };
    });
