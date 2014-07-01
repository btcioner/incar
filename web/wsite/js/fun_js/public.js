
//广化给我写的AngularJS写service例子
var jlmod = angular.module("mmmod", []);
jlmod.factory('jlVV', ['$http', function($http){
//    if(!window.vsdf){
//        window.vsdf = {}
//    }
    var vvInner = {
        foo : function(data){ return "foo:" + data; }
    };
//    else{
//        return windows.vsdf;
//    }
    return vvInner;
}]);
jlmod.factory('carProperties', ['$http', function($http){
    var cache ="";
    var  propertiesInfo= {
        getSeries : function(series){
              if(cache != "")
              {
                  alert(cache);
                  console.log(cache);
                   for(var i=0;i<cache.brands.length;i++)
                   {
                       if(series == cache.brands[i].seriesCode)
                       {
                           return cache.brands[i].series;
                       }
                   }
              }
        },
//        getSeries:function(series){
//            if(cache != "")
//            {
//                var series = cache.series;
//                for(var i=0;i++;i<series.length)
//                {
//                    if(brand == series.seriesCode)
//                    {
//                        return series.series;
//                    }
//                }
//            }
//        },
        notify: function(fn){
            propertiesInfo.fn = fn;
        }
    };

//        $http.get(baseurl+"brand").success(function(data_1){
//
//            if(typeof propertiesInfo.fn === 'function'){
//                propertiesInfo.fn;
//            }
//             cache = data_1;
//        });


    return propertiesInfo;
}]);

