'use strict';

angular.module('backendMaintain').run(['$rootScope', '$cookies', '$location', '$log', '$window', '$http', '$state', function ($rootScope, $cookies, $location, $log, $window, $http, $state) {
    var locationChangeStartOff = $rootScope.$on('$stateChangeStart', locationChangeStart);


    function locationChangeStart(event, toState,   toParams
        , fromState, fromParams) {
        //event.preventDefault();
        var userDomainId = $cookies.get('USER_ID');
        if (userDomainId === undefined){
            if ($location.path().indexOf('login') < 0){
                $window.location.href='login';
            }
        }else{
            if(toState.name==='login'){
                $window.location.href = '/back/home';
            }else if(toState.name==='logout'){
                $cookies.remove('USER_ID');
                var user= {
                    username: userDomainId
                }
                $http.post('/api/user/logout', user);
            }
        }
    }

}]);
// Setting up route
angular.module('backendMaintain').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('login');
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'client/maintain/views/login/login.client.view.html'
            })
            .state('logout', {
                url: '/login',
                templateUrl: 'client/maintain/views/login/login.client.view.html'
            })
            .state('home', {
                url: '/back/home',
                templateUrl: 'client/maintain/views/home.client.view.html'
            }).state('position', {
                url: '/back/position',
                templateUrl: 'client/maintain/views/position/position.html'
            }).state('applicant', {
                url: '/back/applicant',
                templateUrl: 'client/maintain/views/applicant/applicant.html'
            })
            .state('companyIntroduction',{
                url: '/back/companyIntroduction',
                data: {'name' : '走进东方海外'},
                templateUrl: 'client/maintain/views/company/companyIntroduction.html'
            })
            .state('companySegmentCreate', {
                url: '/back/companySegment/type/:{type}',
                data: {'name' : '信息编辑'},
                templateUrl: 'client/maintain/views/company/companySegment.html'
            })
            .state('companySegmentEdit', {
                url: '/back/companySegment/id/:{id}',
                data: {'name' : '信息编辑'},
                templateUrl: 'client/maintain/views/company/companySegment.html'
            })
         .state('companyTemplate',{
              url: '/back/companyTemplate',
              templateUrl: 'client/maintain/views/company/companyTemplate.html'
          })
         .state('userManagement',{
              url: '/back/userManagement',
              templateUrl: 'client/maintain/views/user/userManagement.html'
          })
         .state('dictionary', {
           url: '/back/dictionary',
           templateUrl: 'client/maintain/views/dictionary/dictionary.html'
         });
    }
]);


