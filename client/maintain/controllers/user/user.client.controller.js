angular.module("userManagement").controller("userController",['$scope', '$http', 'uiGridConstants','$uibModal', 'i18nService', 'instance', 'toaster', '$rootScope','$cookies', function ($scope, $http, uiGridConstants,$uibModal, i18nService, instance, toaster, $rootScope,$cookies) {
	var vm = $scope.vm = {};
    vm.collapsed = false;
    i18nService.setCurrentLang("zh-cn");

    const TIP_ONLY_ONE_ROW_SELECT = "请只选中一行记录进行操作";
    const TIP_DELETE_SUCCESS = "删除成功";
    const TIP_DELETE_FAILED = "删除失败";

    $scope.userGrid = {
        enableSorting: true,
        showGridFooter: true,
        showColumnFooter: true,
        enableColumnResizing: true,
        enableGridMenu: true,
        paginationPageSizes: [9, 50, 75],
        paginationPageSize: 9,
        //enableRowHeaderSelection: true,
        //enableRowSelection: true,
        enableFullRowSelection: true,
        exporterOlderExcelCompatibility: true,
        exporterMenuPdf: false,
        appScopeProvider: $scope.myAppScopeProvider,
        rowTemplate: "<div ng-dblclick=\"grid.appScope.showInfo(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"
    };
	var positionIntroductionGridColumnDefs = [
        {field: 'userid', enableFiltering: true, allowCellFocus:false, displayName:'用户名称'},
        {field: 'role', allowCellFocus:false, displayName:'角色'},
        {field: 'accountType', allowCellFocus:false, displayName:'账号类别'},
        {field: 'createdBy', allowCellFocus:false, displayName: '创建者'},
        {field: 'created', allowCellFocus:false, displayName: '创建时间'},
        {field: 'updatedBy', allowCellFocus:false, displayName: '更新者'},
        {field: 'updated', allowCellFocus:false, displayName: '更新时间'}
    ];

    function getLoginUserRole(){
        var username =  $cookies.get('USER_ID');
        var criteria = {};

        if(!_.isEmpty(username)){
            criteria.userid = username;
        }
        $http.get('/api/v1/loginuser?query='+JSON.stringify(criteria)).then(function(res){
            if(res){
               var loginuser = res.data[0];
               if('admin'===loginuser.role){
                   $scope.isAdminLogin = true;
               }
            }else{
                console.log('rep failed');
            }
        });

    }


    getLoginUserRole();

    $scope.getUserList = function(){
        $http.get('/api/v1/loginuser').success(function(data){
            $scope.userList = data;
        });
    };
    $scope.getUserList();

    $scope.accountTypeList = ['local','ldap'];
    $scope.roleList = ['admin','user'];

    $scope.isLocal = false;

    $scope.loadUserData = function(){
        $http.get('/api/v1/loginuser').then(function(res){
            if(res){
                $scope.userGrid.data = res.data;
                res.data.forEach(function (user) {
                    user.created = getOperationTime(user.created);
                    user.updated = getOperationTime(user.updated);
                });

            }else{
                console.log('rep failed');
            }
        });
    };
    $scope.loadUserData();

    $scope.searchUser = function (){
        var criteria = {};

        if(!_.isEmpty($scope.username)){
            criteria.userid = $scope.username;
        }
        if(!_.isEmpty($scope.roleName)){
            criteria.role = $scope.roleName;
        }
        if(!_.isEmpty($scope.accountName)){
            criteria.accountType = $scope.accountName;
        }
        $http.get('/api/v1/loginuser?query='+JSON.stringify(criteria)).then(function(res){
            if(res){
                res.data.forEach(function (loginuser) {
                    loginuser.created = getOperationTime(loginuser.created);
                    loginuser.updated = getOperationTime(loginuser.updated);
                });
                $scope.userGrid.data = res.data;
            }else{
                  console.log('rep failed');
            }
        });
    };

    $scope.resetSearch = function() {
        $scope.username = null;
        $scope.accountName = null;
        $scope.roleName = null;
    };

    /*****************************************************************************
    *  Module: Add User
    ******************************************************************************/

    $scope.addUser = function(){
        $uibModal.open({
            templateUrl: 'client/maintain/views/user/userTemplate.html',
            controller: 'userCreate',
            size: 'lg',
            backdrop: 'static'
        });
    };

    $scope.updateUser = function(){
        if($scope.gridApi.grid.selection.selectedCount != 1){
            toaster.pop('error', TIP_ONLY_ONE_ROW_SELECT);
        }else{
            //console.log($scope.gridApi.grid.selection.lastSelectedRow.entity);
            instance.applicantEntity = $scope.gridApi.grid.selection.lastSelectedRow.entity;
            $uibModal.open({
                templateUrl: 'client/maintain/views/user/userTemplate.html',
                controller: 'userUpdate',
                size: 'lg',
                backdrop: 'static'
            });
        }
    };

    $scope.deleteUser = function(){
        if($scope.gridApi.grid.selection.selectedCount != 1){
            toaster.pop('error', TIP_ONLY_ONE_ROW_SELECT);
        }
        else {
            $.confirm({
                title: '确定删除所有选中的用户？',
                content: false,
                confirmButton:'确定',
                cancelButton:'取消',
                confirmButtonClass: 'btn-info',
                cancelButtonClass: 'btn-default',
                theme:'black',
                keyboardEnabled:true,
                confirm: function(){
                    var row = $scope.gridApi.grid.selection.lastSelectedRow.entity;
                    //console.log(rows);
                    $http.delete('/api/v1/loginuser/' + row._id).success(function(data){
                        toaster.pop('success', TIP_DELETE_SUCCESS);
                        instance.refreshForCreateOrUpdate(null);
                    }).error(function(){
                        toaster.pop('error', TIP_DELETE_FAILED);
                        instance.refreshForCreateOrUpdate(null);
                    });
                    $scope.gridApi.selection.clearSelectedRows();
                },
                cancel: function(){
                }
            });

        }
    };


    $scope.userGrid.multiSelect = true;
    $scope.userGrid.modifierKeysToMultiSelect = true;
    //$scope.userGrid.noUnselect = true;

    $scope.userGrid.columnDefs = positionIntroductionGridColumnDefs;

    $scope.userGrid.onRegisterApi = function( gridApi ) {
        $scope.gridApi = gridApi;
        $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.EDIT );
    };

    function convertGMTtoDate(dateTimeString){
        if(!dateTimeString) {
            return null;
        }
        var year = dateTimeString.substring(0, 4);
        var month = dateTimeString.substring(5, 7);
        var day = dateTimeString.substring(8, 10);
        var hour = dateTimeString.substring(11, 13);
        var minute = dateTimeString.substring(14, 16);
        var second = dateTimeString.substring(17, 19);
        var millisecond = dateTimeString.substring(20, 22);

        return new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
    }

    function getOperationTime(date){
        var updateDate = convertGMTtoDate(date);
        var month = updateDate.getMonth() < 10 ? '0' + updateDate.getMonth() : updateDate.getMonth();
        var day = updateDate.getDate() < 10 ? '0' + updateDate.getDate() : updateDate.getDate();
        var hour = updateDate.getHours() < 10 ? '0' + updateDate.getHours() : updateDate.getHours();
        var minute = updateDate.getMinutes() < 10 ? '0' + updateDate.getMinutes() : updateDate.getMinutes();
        var second = updateDate.getSeconds() < 10 ? '0' + updateDate.getSeconds() : updateDate.getSeconds();
        var time = updateDate.getFullYear() + '-'
            + month + '-' + day + ' ' + hour + ':' + minute
            + ':' + second;
        return time;
    }

    instance.refreshForCreateOrUpdate = function(position){
        if(position != null){
            $scope.userGrid.data.push(position);
        }else{
            $scope.loadUserData();
        }
    };

    function convertGMTtoDate(dateTimeString){
        if(!dateTimeString) {
            return null;
        }
        var year = dateTimeString.substring(0, 4);
        var month = dateTimeString.substring(5, 7);
        var day = dateTimeString.substring(8, 10);
        var hour = dateTimeString.substring(11, 13);
        var minute = dateTimeString.substring(14, 16);
        var second = dateTimeString.substring(17, 19);
        var millisecond = dateTimeString.substring(20, 22);

        return new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
    }
}]);

angular.module('userManagement').controller('userCreate', ['instance','$scope', '$http', '$uibModal', '$uibModalInstance', 'toaster','$cookies',
    function (instance, $scope, $http, $uibModal, $uibModalInstance, toaster,$cookies) {

        const TIP_CREATE_SUCCESS = "创建成功";
        const TIP_CREATE_FAILED = "创建失败，请重试";

        $scope.createUser_domainId_error_show = false;

        $scope.isLocal = false;
        $scope.user = {
            accountType: 'ldap',
            role:'user'
        };

        $scope.createUsernameValidation = true;

        $scope.createNewUser = function () {
                $scope.user_create_form.$valid = false;
                if(!$scope.isLocal){
                    $scope.user_create_form.userCreatePassword.$valid = true;
                if($scope.user_create_form.userCreateDomainId.$valid) {
                    $scope.user_create_form.$valid = true;
                }
            }else{
                $scope.user_create_form.userCreateConfirmPasswordNotSameAsBefore = ($scope.user.password !== $scope.user.confirmPassword);
                if ($scope.user_create_form.userCreatePassword.$valid && $scope.user_create_form.userCreateConfirmPassword.$valid && !$scope.user_create_form.userCreateConfirmPasswordNotSameAsBefore && $scope.user_create_form.userCreateDomainId.$valid) {
                    $scope.user_create_form.$valid = true;
                }
            }
            if ($scope.user_create_form.$valid ) {
                $scope.user.userid = $scope.user.userid.toLowerCase();
                $scope.user.createdBy =  $cookies.get('USER_ID');
                $scope.user.updatedBy =  $cookies.get('USER_ID');
                $scope.user.created = Date.now;
                $scope.user.updated = Date.now;
                var url = '/api/user';
                $http.post(url, $scope.user).success(function (data) {
                    $uibModalInstance.close('ok');
                    toaster.pop('success', TIP_CREATE_SUCCESS);
                    instance.refreshForCreateOrUpdate(null);
                }).error(function (error) {
                    if (error.message && error.message.indexOf('username already exists') !== -1) {
                        $scope.createUser_domainId_error_show = true;
                    }
                });
            } else {
                $scope.user_create_form.userCreated = true;
            }
        };

        $scope.validationField = function (userid) {
            var user = {};
            if(userid !== null && angular.isDefined(userid) && userid.replace(/(^\s*)|(\s*$)/g,"") !== ''){
                user.userid = userid.toLowerCase();
                $http.post('/api/user/validation', user).success(function (data) {
                    if (data.status === 'success') {
                        $scope.createUser_domainId_error_show = false;
                        $scope.createUsernameValidation = true;
                    } else {
                        $scope.createUser_domainId_error_show = true;
                        $scope.createUsernameValidation = false;
                    }

                }).error(function (err) {
                    console.log(err);
                });
            }

        };

        $scope.setAccoutType = function(){
            if('local'===$scope.user.accountType){
                $scope.isLocal = true;
            }else{
                $scope.isLocal = false;
            }
        }

        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        };
    }
]);

angular.module('userManagement').controller('userUpdate', ['instance', '$scope', '$http', '$uibModal', '$uibModalInstance', 'toaster','$cookies',
    function (instance, $scope, $http, $uibModal, $uibModalInstance, toaster,$cookies) {
        const TIP_UPDATE_SUCCESS = "更新成功";
        const TIP_UPDATE_FAILED = "更新失败，请重试";
        $scope.createUsernameValidation = true;
        $scope.user = _.cloneDeep(instance.applicantEntity);
        $scope.isLocal = ($scope.user.accountType === 'local');
        $scope.user.password = '';
        $scope.isUpdateUserName = true;
        $scope.createNewUser = function () {
            $scope.user_create_form.$valid = false;
            if(!$scope.isLocal){
                $scope.user_create_form.userCreatePassword.$valid = true;
                $scope.user_create_form.$valid = true;
            }else{
                $scope.user_create_form.userCreateConfirmPasswordNotSameAsBefore = ($scope.user.password !== $scope.user.confirmPassword);
                if ($scope.user_create_form.userCreatePassword.$valid && $scope.user_create_form.userCreateConfirmPassword.$valid && !$scope.user_create_form.userCreateConfirmPasswordNotSameAsBefore) {
                    $scope.user_create_form.$valid = true;
                }
            }
            if ($scope.user_create_form.$valid ) {
                $scope.user.userid = $scope.user.userid.toLowerCase();
                $scope.user.updatedBy =  $cookies.get('USER_ID');
                $scope.user.updated = Date.now;
                var url = '/api/user';
                $http.post(url, $scope.user).success(function (data) {
                    $uibModalInstance.close('ok');
                    toaster.pop('success', TIP_UPDATE_SUCCESS);
                    instance.refreshForCreateOrUpdate(null);
                }).error(function (error) {
                    if (error.message && error.message.indexOf('username already exists') !== -1) {
                        $scope.createUser_domainId_error_show = true;
                    }
                });
            } else {
                $scope.user_create_form.userCreated = true;
            }
        };

        $scope.setAccoutType = function(){
            if('local'===$scope.user.accountType){
                $scope.isLocal = true;
            }else{
                $scope.isLocal = false;
            }
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        };
    }
]);
