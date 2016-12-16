/**
 * Created by HUGO on 6/29/2016.
 */
angular.module('backendMaintain').factory('loginServ', ['$rootScope','$location','$cookies','$window', '$http', function($rootScope, $location, $cookies, $window, $http){
    return {
        login : login
    };
    function login(userId,password,callback){
        var user= {
            username: userId,
            password: password,
            loginType: 'corp'
        }
        $http.post('/api/user/login', user).success(function (data) {
            if(data!=null){
                var date = new Date();
                date.setMinutes(date.getMinutes()+120);
                $cookies.put('USER_ID',userId,{'expires':date});
                callback('success');
            }
        }).error(function (data) {
            callback(data);
        });

    }
}]);
