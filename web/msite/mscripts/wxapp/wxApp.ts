declare var angular:any;
declare var _:any;

var wxApp = angular.module('wxApp', ['ngResource']);
wxApp.controller('devAPCtrl',
    ['$scope', '$location', '$resource', ($scope, $location, $resource)=>{
        $scope.name = $location.search().name;
        $scope.jump = $location.search().jump;
        $scope.pages = [
            { title: "行车手册", url: "/msite/page_xcsc.html" },
            { title: "以后再添加", url: "/msite/none.html" }
        ];

        if($scope.jump) {
            var linkRes = $resource("/wservice/wxap", null, {query: {isArray: false}});
            var result = linkRes.query(()=> {
                if(result.status === "ok") {
                    var link = _.find(result.links, (obj)=> {
                        return obj.name === $scope.name;
                    });
                    document.location.replace(link.url);
                }
                else{
                    $scope.error = angular.toJson(result);
                }
            });
        }
}]);