/**
 * Created by CHENGJA2 on 6/22/2016.
 */
angular.module('positionIntroduction').controller('positionController', ['$scope', '$http', 'uiGridConstants','$uibModal', 'i18nService', 'instance', 'toaster', '$rootScope', function ($scope, $http, uiGridConstants,$uibModal, i18nService, instance, toaster, $rootScope) {
    var vm = $scope.vm = {};
    vm.collapsed = false;
    i18nService.setCurrentLang("zh-cn");

    const TIP_NO_DATA_SELECT = "请至少选中一行";
    const TIP_ONLY_ONE_ROW_SELECT = "请只选中一行记录进行操作";
    const TIP_PUBLISH_SUCCESS = "发布成功";
    const TIP_PUBLISH_FAILED = "发布失败，请重试";
    const TIP_STOP_PUBLISH_SUCCESS = "停止发布成功";
    const TIP_ACTIVE_SELECT = "无法删除发布中的职位";
    const TIP_DELETE_SUCCESS = "删除成功";
    const TIP_DELETE_FAILED = "删除失败";
    const TIP_STOP_PUBLISH_FAILED = "停止发布失败，请重试";
    const TIP_UPDATE_SUCCESS = "更新成功";
    const TIP_UPDATE_FAILED = "更新失败，请重试";
    const PUBLISHED = "已发布";
    const NOT_PUBLISH = "待发布";

    $scope.getPositionForSelectShow = function(){
            $http.get('/api/v1/position?sort=order').success(function(data){
            $scope.selectForShow = data;
        });
    };
    $scope.getPositionForSelectShow();

    $scope.myAppScopeProvider = {
        showInfo : function(row) {
            instance.applicantEntity = $scope.gridApi.grid.selection.lastSelectedRow.entity;
            $uibModal.open({
                templateUrl: 'client/maintain/views/position/positionTemplate.html',
                controller: 'positionUpdate',
                size: 'lg',
                backdrop: 'static'
            });
        }
    };

    $scope.myDataGrid = {
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
        {field: 'order', enableFiltering: true, type:'number',allowCellFocus:false, displayName:'序号'},
        {field: 'name', enableFiltering: true, allowCellFocus:false, displayName:'职位名称'},
        {field: 'jobType', allowCellFocus:false, displayName:'职位类别'},
        {field: 'count',allowCellFocus:false, displayName:'招聘人数', visible:false},
        {field: 'workAddr', allowCellFocus:false, displayName:'工作地点', visible:false},
        {field: 'money', allowCellFocus:false, displayName:'薪资', visible:false},
        {field: 'welfareForShow',displayName:'福利标签', allowCellFocus:false, visible:false},
        {field: 'experience', allowCellFocus:false, displayName:'工作经验', visible:false},
        {field: 'certificate', allowCellFocus:false, displayName:'学历', visible:false},
        {field: 'updateTime', allowCellFocus:false,displayName: '更新时间'},
        {field: 'browseCount', allowCellFocus:false,displayName: '浏览次数'},
        {field: 'applyCount', allowCellFocus:false,displayName: '投递人数'},
        {field: 'successMessage', allowCellFocus:false,displayName: '回复信息',visible:false},
        {field: 'status', enableFiltering: true, allowCellFocus:false, displayName:'状态'}
    ];

    $scope.myDataGrid.multiSelect = true;
    $scope.myDataGrid.modifierKeysToMultiSelect = true;
    //$scope.myDataGrid.noUnselect = true;

    $scope.myDataGrid.columnDefs = positionIntroductionGridColumnDefs;

    $scope.myDataGrid.onRegisterApi = function( gridApi ) {
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

    $scope.getData = function(){
            $http.get('/api/v1/position?sort=order').then(function(res){
            if(res){
                res.data.forEach(function (position) {
                  var welfaresObjs = [];
                  position.welfare.forEach(function (w, i) {
                    var welfaresObj = {value : w}
                    welfaresObjs.push(welfaresObj);
                  });
                  position.welfareForShow = position.welfare.join(',');
                  position.welfare = welfaresObjs;

                  var updateDate = convertGMTtoDate(position.updated);
                  var month = updateDate.getMonth() < 10 ? '0' + updateDate.getMonth() : updateDate.getMonth();
                  var day = updateDate.getDate() < 10 ? '0' + updateDate.getDate() : updateDate.getDate();
                  var hour = updateDate.getHours() < 10 ? '0' + updateDate.getHours() : updateDate.getHours();
                  var minute = updateDate.getMinutes() < 10 ? '0' + updateDate.getMinutes() : updateDate.getMinutes();
                  var second = updateDate.getSeconds() < 10 ? '0' + updateDate.getSeconds() : updateDate.getSeconds();
                  position.updateTime = updateDate.getFullYear() + '-'
                      + month + '-' + day + ' ' + hour + ':' + minute
                      + ':' + second;
                  position.status = (position.status == "ACTIVE") ? PUBLISHED : NOT_PUBLISH;
                })
                $scope.myDataGrid.data = res.data;
            }else{
                console.log('rep failed');
            }
        });

        $http.get('/api/v1/dictionary?query='+JSON.stringify({category : '职位类型'}))
             .then(function (result) {
               instance.allPositionTypes = result.data.map(function (data) {
                 return data.value;
               });
               $scope.allPositionTypes = instance.allPositionTypes;
             });
        $http.get('/api/v1/dictionary?query='+JSON.stringify({category : '福利项目'}))
             .then(function (result) {
               instance.allWelfareTypes = result.data.map(function (data) {
                 return {value : data.value};
               });
             });
    };

    $scope.getData();

    $scope.batchUpdateTypes = [
      {field : 'successMessage', display : '回复信息'}
    ];
    $scope.batchUpdate = function () {
      if($scope.gridApi.grid.selection.selectedCount == 0){
          toaster.pop('error', TIP_NO_DATA_SELECT);
          return;
      }
      if(!$scope.batchUpdateType || !$scope.batchUpdateValue){
          toaster.pop('error', '请填写要批量更新的字段和内容');
          return;
      }
      $scope.gridApi.selection.getSelectedRows().forEach(function (row) {
        row[$scope.batchUpdateType] = $scope.batchUpdateValue;
        row.updated = Date.now();
        postionAssembler(row);
        $http.put('/api/v1/position/'+ row._id, row).success(function (data){
            instance.refreshForCreateOrUpdate(null);
        });
      });
      toaster.pop('success', TIP_UPDATE_SUCCESS);
    };
    
    $scope.createPosition = function(){
        $uibModal.open({
            templateUrl: 'client/maintain/views/position/positionTemplate.html',
            controller: 'positionCreate',
            size: 'lg',
            backdrop: 'static'
        });
    };

    $scope.updatePosition = function(){
        if($scope.gridApi.grid.selection.selectedCount != 1){
            toaster.pop('error', TIP_ONLY_ONE_ROW_SELECT);
        }else{
            //console.log($scope.gridApi.grid.selection.lastSelectedRow.entity);
            instance.applicantEntity = $scope.gridApi.grid.selection.lastSelectedRow.entity;
            $uibModal.open({
                templateUrl: 'client/maintain/views/position/positionTemplate.html',
                controller: 'positionUpdate',
                size: 'lg',
                backdrop: 'static'
            });
        }
    };

    $scope.copyPosition = function(){
        if($scope.gridApi.grid.selection.selectedCount != 1){
            toaster.pop('error', TIP_ONLY_ONE_ROW_SELECT);
        }else{
            // var row = $scope.gridApi.grid.selection.lastSelectedRow.entity;
            // console.log(row);
            // $http.post('/api/v1/position', row).success(function (data){
            //     // $uibModalInstance.close('ok');
            //     // toaster.pop('success', 'Create success');
            //     instance.refreshForCreateOrUpdate(null);
            // }).error(function(){
            //     console.log('2');
            //     toaster.pop('error', 'Create fail,try again');
            // });
            instance.applicantEntity = $scope.gridApi.grid.selection.lastSelectedRow.entity;
            $uibModal.open({
                templateUrl: 'client/maintain/views/position/positionTemplate.html',
                controller: 'positionCopy',
                size: 'lg',
                backdrop: 'static'
            });
        }
    };

    instance.refreshForCreateOrUpdate = function(position){
        if(position != null){
            $scope.myDataGrid.data.push(position);
            //$scope.gridApi.core.notifyDataChange("all");
            //$scope.gridApi.core.refreshRows();
            //$scope.gridApi.core.queueRefresh();
            //$scope.gridApi.core.refresh(true);
        }else{
            $scope.getData();
        }
            $scope.getData();
    };

    $scope.publishJob = function(){
        if($scope.gridApi.grid.selection.selectedCount == 0){
            toaster.pop('error', TIP_NO_DATA_SELECT);
        }else {
            $.confirm({
                title: '确定发布所有选中的职位？',
                content: false,
                confirmButton:'确定',
                cancelButton:'取消',
                confirmButtonClass: 'btn-info',
                cancelButtonClass: 'btn-default',
                theme:'black',
                keyboardEnabled:true,
                confirm: function(){
                    var rows = $scope.gridApi.selection.getSelectedRows()
                    //console.log(rows);
                    $http.put('/api/position/publish', rows).success(function (data) {
                        toaster.pop('success', TIP_PUBLISH_SUCCESS);
                        instance.refreshForCreateOrUpdate(null);
                    }).error(function () {
                        toaster.pop('error', TIP_PUBLISH_FAILED);
                        instance.refreshForCreateOrUpdate(null);
                    });
                    $scope.gridApi.selection.clearSelectedRows();
                },
                cancel: function(){
                }
            });
        }
    };

    $scope.stopPublish = function(){
        if($scope.gridApi.grid.selection.selectedCount == 0){
            toaster.pop('error', TIP_NO_DATA_SELECT);
        }else {
            $.confirm({
                title: '确定停止发布所有选中的职位？',
                content: false,
                confirmButton:'确定',
                cancelButton:'取消',
                confirmButtonClass: 'btn-info',
                cancelButtonClass: 'btn-default',
                theme:'black',
                keyboardEnabled:true,
                confirm: function(){
                    var rows = $scope.gridApi.selection.getSelectedRows()
                    //console.log(rows);
                    $http.put('/api/position/stoppublish', rows).success(function(data){
                        toaster.pop('success', TIP_STOP_PUBLISH_SUCCESS);
                        instance.refreshForCreateOrUpdate(null);
                    }).error(function(){
                        toaster.pop('error', TIP_STOP_PUBLISH_FAILED);
                        instance.refreshForCreateOrUpdate(null);
                    });
                    $scope.gridApi.selection.clearSelectedRows();
                },
                cancel: function(){
                }
            });
        }
    };

    $scope.preview = function (){
        if($scope.gridApi.grid.selection.selectedCount != 1){
            toaster.pop('error', TIP_ONLY_ONE_ROW_SELECT);
        }else {
            var row = $scope.gridApi.grid.selection.lastSelectedRow.entity;
            var previewPage = "/position/detail/" + row._id;
            var modalScope = $rootScope.$new();
            modalScope.page = previewPage;
            var modalInstance = $uibModal.open({
                templateUrl: '/client/maintain/views/position/positionPreview.html',
                size: 'md',
                //backdrop: 'static',
                scope:modalScope
            });
        }
        //$http.get('/api/v1/position?query={"status": "ACTIVE"}').then(function(res){
        //    console.log(res);
        //})
        //    window.open('/client/maintain/views/position/positionPreview.html?page='+previewPage);

    };

    $scope.deletePosition = function(){
        if($scope.gridApi.grid.selection.selectedCount != 1){
            toaster.pop('error', TIP_ONLY_ONE_ROW_SELECT);
        }


        else {
            if($scope.gridApi.grid.selection.lastSelectedRow.entity.status == PUBLISHED){
                toaster.pop('warning',TIP_ACTIVE_SELECT)
            }
            else{
                $.confirm({
                    title: '确定删除所有选中的职位？',
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
                        $http.delete('/api/v1/position/' + row._id).success(function(data){
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
        }
    };

    $scope.searchPosition = function (){
        var criteria = {};
        var fromDate = $scope.fromDate;
        var toDate = $scope.toDate;
        // toDate: hour+23, min+59, sec+59
        if(_.isDate(toDate)) {
            toDate.setHours(23);
            toDate.setMinutes(59);
            toDate.setSeconds(59);
        }
        if(!_.isEmpty($scope.positionName)){
            criteria.name = $scope.positionName;
        }
        if(!_.isEmpty($scope.positionJobType)){
            criteria.jobType = {$regex: $scope.positionJobType,$options:"$i"};
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
            $http.get('/api/v1/position?sort=order&query='+JSON.stringify(criteria)).then(function(res){
            if(res){
                res.data.forEach(function (position) {
                    var welfaresObjs = [];
                    position.welfare.forEach(function (w, i) {
                        var welfaresObj = {value : w};
                        welfaresObjs.push(welfaresObj);
                    });
                    position.welfareForShow = position.welfare.join(',');
                    position.welfare = welfaresObjs;

                    var updateDate = convertGMTtoDate(position.updated);
                    var month = updateDate.getMonth() < 10 ? '0' + updateDate.getMonth() : updateDate.getMonth();
                    var day = updateDate.getDate() < 10 ? '0' + updateDate.getDate() : updateDate.getDate();
                    var hour = updateDate.getHours() < 10 ? '0' + updateDate.getHours() : updateDate.getHours();
                    var minute = updateDate.getMinutes() < 10 ? '0' + updateDate.getMinutes() : updateDate.getMinutes();
                    var second = updateDate.getSeconds() < 10 ? '0' + updateDate.getSeconds() : updateDate.getSeconds();
                    position.updateTime = updateDate.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
                    position.status = (position.status == "ACTIVE") ? PUBLISHED : NOT_PUBLISH;
                });
                $scope.myDataGrid.data = res.data;
            }else{
                  console.log('rep failed');
            }
        });
    };

    $scope.cancelPosition = function() {
        $scope.positionName = null;
        $scope.positionJobType = null;
        $scope.fromDate = null;
        $scope.toDate = null;
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
    }
}]);

function positionEditInit(instance, $scope) {
  $scope.allPositionTypes = instance.allPositionTypes;
  $scope.allWelfareTypes = instance.allWelfareTypes;
  $scope.allCertificateTypes = ['','大专及以上','本科及以上','硕士及以上','博士及以上'];

  $scope._simpleConfig = {
      //这里可以选择自己需要的工具按钮名称,此处仅选择如下五个
      toolbars: [
                ['source', '|', 'undo', 'redo', '|',
                    'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
                    'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc',
                     '|',
                    'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                     'indent', '|',
                    'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify'
                    ]
      ],
      //focus时自动清空初始化时的内容
      autoClearinitialContent: true,
      //关闭字数统计
      wordCount: false,
      //关闭elementPath
      elementPathEnabled: false,
      autoHeightEnabled: false,
      scaleEnabled: false,
      zIndex : 1300

  };
}

function postionAssembler(position) {
  position.updated = Date.now();

  var welfares = [];
  if (position.welfare) {
    position.welfare.forEach(function (w) {
      welfares.push(w.value);
    });
  }
  position.welfare = welfares;
  return position;
}

angular.module('positionIntroduction').controller('positionCreate', ['instance','$scope', '$http', '$uibModal', '$uibModalInstance', 'toaster',
    function (instance, $scope, $http, $uibModal, $uibModalInstance, toaster) {
        positionEditInit(instance, $scope);

        const TIP_CREATE_SUCCESS = "创建成功";
        const TIP_CREATE_FAILED = "创建失败，请重试";

        $scope.selected = {};
        $scope.submit = function(isValid){
            if(isValid){
                updateOtherPositions($scope.position);
                instance.refreshForCreateOrUpdate(null);
                postionAssembler($scope.position);
                $http.post('/api/v1/position', $scope.position).success(function (data){
                    $uibModalInstance.close('ok');
                    toaster.pop('success', TIP_CREATE_SUCCESS);
                    instance.refreshForCreateOrUpdate(null);
                }).error(function(){
                    toaster.pop('error', TIP_CREATE_FAILED);
                })
            }

        };
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        };
        function updateOtherPositions(position){
            $http.get('/api/v1/position?sort=order')
                .then(function (results) {
                    debugger;
                    var positionList = results.data;
                    var isExist = false;
                    if (positionList !=null && positionList.length>0){
                        for(var i=0;i<positionList.length;i++){
                            var result = positionList[i];
                            if(result.order === position.order && result._id !== position._id){
                                isExist = true;
                                break;
                            }
                        }
                    }
                    if(isExist){
                        var arr = [];
                        arr.push(position.order);
                        for(var i=0;i<positionList.length;i++){
                            var result = positionList[i];
                            if(result._id !== position._id){
                                var needAddOne = false;
                                for(var j=0;j<arr.length;j++){
                                    if(result.order === arr[j]) {
                                        needAddOne = true;
                                        break;
                                    }
                                }
                                if(needAddOne){
                                    result.order = result.order + 1;
                                    $http.put('/api/v1/position/'+ result._id, result).success(function (data){
                                    }).error(function(){
                                    });
                                }
                                arr.push(result.order);
                            }
                        }
                    }
                });
        }
    }
]);

angular.module('positionIntroduction').controller('positionUpdate', ['instance', '$scope', '$http', '$uibModal', '$uibModalInstance', 'toaster',
    function (instance, $scope, $http, $uibModal, $uibModalInstance, toaster) {
        positionEditInit(instance, $scope);
        const TIP_UPDATE_SUCCESS = "更新成功";
        const TIP_UPDATE_FAILED = "更新失败，请重试";

        var copyObjectData = function(oldData){
            var dataForEdit = [];
            _.times(oldData.length, function(n){
                dataForEdit.push(_.cloneDeep(oldData[n]));
            });
            return dataForEdit;
        }
        $scope.position = _.cloneDeep(instance.applicantEntity);
        $scope.submit = function(isValid){
            if(isValid){
                //search order if exist
                updateOtherPositions($scope.position);
                instance.refreshForCreateOrUpdate(null);
                postionAssembler($scope.position);
                $http.put('/api/v1/position/'+ $scope.position._id, $scope.position).success(function (data){
                    console.log('s');
                    $uibModalInstance.close('ok');
                    toaster.pop('success', TIP_UPDATE_SUCCESS);
                    instance.refreshForCreateOrUpdate(null);
                }).error(function(){
                    console.log('2');
                    toaster.pop('error', TIP_UPDATE_FAILED);
                });
            }
        }
        function updateOtherPositions(position){
            $http.get('/api/v1/position?sort=order')
                .then(function (results) {
                    debugger;
                    var positionList = results.data;
                    var isExist = false;
                    if (positionList !=null && positionList.length>0){
                        for(var i=0;i<positionList.length;i++){
                            var result = positionList[i];
                            if(result.order === position.order && result._id !== position._id){
                                isExist = true;
                                break;
                            }
                        }
                    }
                    if(isExist){
                        var arr = [];
                        arr.push(position.order);
                        for(var i=0;i<positionList.length;i++){
                            var result = positionList[i];
                            if(result._id !== position._id){
                                var needAddOne = false;
                                for(var j=0;j<arr.length;j++){
                                   if(result.order === arr[j]) {
                                       needAddOne = true;
                                       break;
                                   }
                                }
                                if(needAddOne){
                                    result.order = result.order + 1;
                                    $http.put('/api/v1/position/'+ result._id, result).success(function (data){
                                    }).error(function(){
                                    });
                                }
                                arr.push(result.order);
                            }
                        }
                    }
                });
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        };
    }
]);


angular.module('positionIntroduction').controller('positionCopy', ['instance', '$scope', '$http', '$uibModal', '$uibModalInstance', 'toaster',
        function (instance, $scope, $http, $uibModal, $uibModalInstance, toaster) {
            positionEditInit(instance, $scope);
            const TIP_COPY_SUCCESS = "复制成功";
            const TIP_COPY_FAILED = "复制失败，请重试";

            var copyObjectData = function(oldData){
                var dataForEdit = [];
                _.times(oldData.length, function(n){
                    dataForEdit.push(_.cloneDeep(oldData[n]));
                });
                return dataForEdit;
            }
            $scope.position = _.cloneDeep(instance.applicantEntity);
            $scope.submit = function(isValid){
                if(isValid){
                    postionAssembler($scope.position);
                    $scope.position.status = 'INACTIVE';
                    $scope.position.applyCount = 0;
                    $scope.position.browseCount = 0;
                    $http.post('/api/v1/position', $scope.position).success(function (data){
                        $uibModalInstance.close('ok');
                        toaster.pop('success', TIP_COPY_SUCCESS);
                        instance.refreshForCreateOrUpdate(null);
                    }).error(function(){
                        toaster.pop('error', TIP_COPY_FAILED);
                    });
                }
            }
            $scope.cancel = function () {
                $uibModalInstance.close('cancel');
            };
        }
]);
