/**
 * Created by HUGO on 5/16/2016.
 */
angular.module('backendMaintain').controller('seekersMaintain', ['$scope', '$http', '$uibModal', 'i18nService', 'instance', '$q', '$log', function ($scope, $http, $uibModal, i18nService, instance, $q, $log) {
    var vm = $scope.vm = {};
    vm.collapsed = true;
    i18nService.setCurrentLang("zh-cn");
    $scope.myAppScopeProvider = {

        showInfo : function(row) {
            var modalInstance = $uibModal.open({
                controller: 'InfoController',
                templateUrl: 'client/maintain/views/applicant/applicant.modal.template.html',
                resolve: {
                    selectedRow: function () {
                        console.log(row.entity);
                        row.entity.photoUrl = "upload/"+row.entity.photoName;
                        return row.entity;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $log.log('modal selected Row: ' + selectedItem);
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }
    }
    $scope.getPositionForSelectShow = function(){
        $http.get('/api/v1/position').success(function(data){
            $scope.selectForShow = data;
            console.log(data);
        })
    };
    $scope.getPositionForSelectShow();
    $scope.myData = {
        enableSorting: true,
        showGridFooter: true,
        showColumnFooter: true,
        enableColumnResizing: true,
        enableGridMenu: true,
        paginationPageSizes: [25, 50, 75],
        paginationPageSize: 25,
        enableRowHeaderSelection: false,
        enableRowSelection: true,
        enableFullRowSelection:true,
        exporterOlderExcelCompatibility: true,
        exporterMenuPdf: false,
        enableFiltering: false,
        enableSelectAll: false,
        appScopeProvider: $scope.myAppScopeProvider,
        rowTemplate: "<div ng-dblclick=\"grid.appScope.showInfo(row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"
    }



    $scope.getData = function(){
        $http.get('/api/v1/applicant').then(function(res){
            if(res){
                console.log(res.data);
                res.data.forEach(function(applicant){
                    console.log(applicant);
                    console.log(applicant.updated);
                    var updateDate = convertGMTtoDate(applicant.updated);
                    var month = updateDate.getMonth() < 10 ? '0' + updateDate.getMonth() : updateDate.getMonth();
                    var day = updateDate.getDate() < 10 ? '0' + updateDate.getDate() : updateDate.getDate();
                    var hour = updateDate.getHours() < 10 ? '0' + updateDate.getHours() : updateDate.getHours();
                    var minute = updateDate.getMinutes() < 10 ? '0' + updateDate.getMinutes() : updateDate.getMinutes();
                    var second = updateDate.getSeconds() < 10 ? '0' + updateDate.getSeconds() : updateDate.getSeconds();
                    applicant.updateTime = updateDate.getFullYear() + '-'
                        + month + '-' + day + ' ' + hour + ':' + minute
                        + ':' + second;
                    var positions = [];
                    applicant.appliedPositions.forEach(function(position){
                        if(!!position.positionName){
                            positions.push(position.positionName);
                        }
                    });
                    applicant.positions = positions.join(',');
                    var graduateDate = convertGMTtoDate(applicant.graduationDate);
                    if(null !== graduateDate){
                        var graduateMonth = graduateDate.getMonth() < 10 ? '0' + graduateDate.getMonth():graduateDate.getMonth();
                        var graduateDay = graduateDate.getDate() < 10 ? '0' + graduateDate.getDate() : graduateDate.getDate();
                        applicant.graduationDateForDisplay = graduateDate.getFullYear() + '-' +
                            graduateMonth + '-' + graduateDay;
                    }
                    console.log(applicant.positions);
                    console.log(applicant.updated);
                });
                console.log(res.data);
                $scope.myData.data = res.data;
            }else{
                console.log('2');
            }
        })
    }


    $scope.myData.multiSelect = false;
    $scope.myData.modifierKeysToMultiSelect = false;
    //$scope.myData.noUnselect = true;
    $scope.myData.onRegisterApi = function( gridApi ) {
        $scope.gridApi = gridApi;
    };

    $scope.myData.columnDefs = [
        {field: 'name', enableFiltering: true, allowCellFocus:false,displayName: '申请人'},
        {field: 'phone', displayName: 'Contact', allowCellFocus:false, displayName:'联系电话'},
        {field: 'email', allowCellFocus:false, displayName:'邮箱'},
        {field: 'school', allowCellFocus:false,displayName:'学校'},
        {field: 'educationalBackground', allowCellFocus:false, displayName:'最高学历'},
        {field: 'major', allowCellFocus:false, displayName:'专业'},
        {field: 'graduationDateForDisplay', allowCellFocus:false, displayName:'毕业时间'},
        {field: 'positions', allowCellFocus:false, displayName:'申请职位'},
        {field: 'qq', allowCellFocus:false, displayName:'QQ'},
        {field: 'updateTime', allowCellFocus:false, displayName:'更新时间'}
        //{field: 'aaa', displayName: 'Operation', cellTemplate:'<div class="ui-grid-cell-contents text-center"><button class="btn btn-primary btn-xs" title="Edit" ><i class="glyphicon glyphicon-pencil"></i></button> <button class="btn btn-primary btn-xs" title="Preview"><i class="glyphicon glyphicon-floppy-disk"></i></button></div>'},
    ];
    $scope.getData();

    $http.get('/api/v1/dictionary?query='+JSON.stringify({category : '职位类型'}))
        .then(function (result) {
            instance.allPositionTypes = result.data.map(function (data) {
                return data.value;
            });
            $scope.allPositionTypes = instance.allPositionTypes;
        });

    $scope.updateSeeker = function(){
        if($scope.gridApi.grid.selection.selectedCount == 0){
            alert('pls select a row first.')
        }else{
            //console.log($scope.gridApi.grid.selection.lastSelectedRow.entity);
            instance.applicantEntity = $scope.gridApi.grid.selection.lastSelectedRow.entity;
            $uibModal.open({
                templateUrl: 'client/maintain/views/applicant/modalTemplate.html',
                controller: 'seekerUpdate',
                size: 'md',
                backdrop: 'static'
            });
        }
    };

    $scope.createSeeker = function(){
        $uibModal.open({
            templateUrl: 'client/maintain/views/applicant/modalTemplate.html',
            controller: 'seekerCreate',
            size: 'md',
            backdrop: 'static'
        })
    }
    $scope.preview = function(){
        alert('TBC');
    };

    instance.refreshForCreateOrUpdate = function(seeker){
        if(seeker != null){
            $scope.myData.data.push(seeker);
            //$scope.gridApi.core.notifyDataChange("all");
            //$scope.gridApi.core.refreshRows();
            //$scope.gridApi.core.queueRefresh();
            //$scope.gridApi.core.refresh(true);
        }else{
            $scope.getData();
        }

    }

    $scope.searchApplicant = function (){
            var criteria = {};
            var fromDate = $scope.fromDate;
            var toDate = $scope.toDate;
            // toDate: hour+23, min+59, sec+59
            if(_.isDate(toDate)) {
                toDate.setHours(23);
                toDate.setMinutes(59);
                toDate.setSeconds(59);
            }
            if(!_.isEmpty($scope.positionId)){
                criteria['appliedPositions.positionId'] = $scope.positionId;
            }
            if(!_.isEmpty($scope.applicantName)){
                criteria.name = {$regex: $scope.applicantName,$options:"$i"};
            }
            if(!_.isEmpty($scope.applicantJobType)){
                criteria.jobType = {$regex: $scope.applicantJobType,$options:"$i"};
            }
            if(!_.isEmpty($scope.applicantSchool)){
                criteria.school = {$regex: $scope.applicantSchool,$options:"$i"};
            }
            if(_.isDate(fromDate) && _.isDate(toDate)){
            criteria.updated = {$gte: fromDate, $lte: toDate};
            }
            if(!_.isDate(fromDate) && _.isDate(toDate)){
            criteria.updated = {$lte: toDate};
            }
            if(_.isDate(fromDate) && !_.isDate(toDate)){
            criteria.updated = {$gte: fromDate};
            }
            $http.get('/api/v1/applicant?query='+JSON.stringify(criteria)).then(function(res){
                if(res){
                    console.log(res.data);
                    res.data.forEach(function(applicant){
                        console.log(applicant);
                        console.log(applicant.updated);
                        var updateDate = convertGMTtoDate(applicant.updated);
                        var month = updateDate.getMonth() < 10 ? '0' + updateDate.getMonth() : updateDate.getMonth();
                        var day = updateDate.getDate() < 10 ? '0' + updateDate.getDate() : updateDate.getDate();
                        var hour = updateDate.getHours() < 10 ? '0' + updateDate.getHours() : updateDate.getHours();
                        var minute = updateDate.getMinutes() < 10 ? '0' + updateDate.getMinutes() : updateDate.getMinutes();
                        var second = updateDate.getSeconds() < 10 ? '0' + updateDate.getSeconds() : updateDate.getSeconds();
                        applicant.updateTime = updateDate.getFullYear() + '-'
                            + month + '-' + day + ' ' + hour + ':' + minute
                            + ':' + second;
                        var positions = [];
                        applicant.appliedPositions.forEach(function(position){
                            if(!!position.positionName){
                                positions.push(position.positionName);
                            }
                        });
                        applicant.positions = positions.join(',');
                        var graduateDate = convertGMTtoDate(applicant.graduationDate);
                        if(null !== graduateDate){
                            var graduateMonth = graduateDate.getMonth() < 10 ? '0' + graduateDate.getMonth():graduateDate.getMonth();
                            var graduateDay = graduateDate.getDate() < 10 ? '0' + graduateDate.getDate() : graduateDate.getDate();
                            applicant.graduationDateForDisplay = graduateDate.getFullYear() + '-' +
                                graduateMonth + '-' + graduateDay;
                        }
                        console.log(applicant.positions);
                        console.log(applicant.updated);
                    });
                    console.log(res.data);
                    $scope.myData.data = res.data;
                }
                /*if(res){
                    console.log(res.data);
                    $scope.myData.data = res.data;
                }*/else{
                    console.log('rep failed');
                }
            })
        };

    $scope.cancelPosition = function() {
        $scope.positionId = null;
        $scope.applicantName = null;
        $scope.applicantJobType = null;
        $scope.applicantSchool = null;
        $scope.fromDate = null;
        $scope.toDate = null;
    };

    $scope.entersearch = function(e) {
        var keycode = window.event?e.keyCode:e.which;
        if(keycode==13){
            $scope.searchApplicant();
        }
    };

    // ui.bootstrap.datepickerPopup
    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function() {
        $scope.dt = null;
    };

    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };

    $scope.toggleMin = function() {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open1 = function() {
        $scope.popup1.opened = true;
    };

    $scope.open2 = function() {
        $scope.popup2.opened = true;
    };

    $scope.setDate = function(year, month, day) {
        $scope.dt = new Date(year, month, day);
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
        opened: false
    };

    $scope.popup2 = {
        opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [
        {
            date: tomorrow,
            status: 'full'
        },
        {
            date: afterTomorrow,
            status: 'partially'
        }
    ];

    function getDayClass(data) {
        var date = data.date,
            mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0,0,0,0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
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

angular.module('backendMaintain').controller('seekerUpdate', ['instance', '$scope', '$http', '$uibModal', '$uibModalInstance', 'toaster',
    function (instance, $scope, $http, $uibModal, $uibModalInstance, toaster) {
        var copyObjectData = function(oldData){
            var dataForEdit = [];
            _.times(oldData.length, function(n){
                dataForEdit.push(_.cloneDeep(oldData[n]));
            });
            return dataForEdit;
        }

        $scope.seeker = _.cloneDeep(instance.applicantEntity);
        $scope.submit = function(isValid){
            if(isValid){
                $http.put('/api/v1/applicant/'+ $scope.seeker._id, $scope.seeker).success(function (data){
                    console.log('s');
                    $uibModalInstance.close('ok');
                    toaster.pop('success', 'update success');
                    instance.refreshForCreateOrUpdate(null);
                }).error(function(){
                    console.log('2');
                    toaster.pop('error', 'update fail,try again');
                });
            }
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        };
    }
]);

angular.module('backendMaintain').controller('seekerCreate', ['instance','$scope', '$http', '$uibModal', '$uibModalInstance', 'toaster',
    function (instance, $scope, $http, $uibModal, $uibModalInstance, toaster) {
        $scope.submit = function(isValid){
            if(isValid){
                $http.post('/api/v1/applicant', $scope.seeker).success(function (data){
                    $uibModalInstance.close('ok');
                    toaster.pop('success', 'Create success');
                    instance.refreshForCreateOrUpdate($scope.seeker);
                }).error(function(){
                    console.log('2');
                    toaster.pop('error', 'Create fail,try again');
                })
            }

        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        };
    }
]);

angular.module('backendMaintain').controller('InfoController',
    ['$scope', '$uibModal', '$uibModalInstance', '$filter', '$interval', 'selectedRow',
        function ($scope, $uibModal, $uibModalInstance, $filter, $interval, selectedRow) {

            $scope.selectedRow = selectedRow;

            $scope.ok = function () {
                $scope.selectedRow = null;
                $uibModalInstance.close();
            };

            $scope.cancel = function () {
                $scope.selectedRow = null;
                $uibModalInstance.dismiss('cancel');
            };
        }
    ]);
