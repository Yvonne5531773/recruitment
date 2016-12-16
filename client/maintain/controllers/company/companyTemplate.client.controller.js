(function () {
  'use strict';
  angular.module('companyTemplate').filter('segmentTypeFilter', function() {

    return function (input, map) {
      if (!_.isEmpty(input) && !_.isEmpty(map)) {
        for (var i = 0; i < map.length; i++) {
          if (map[i]['id'] == input) {
            return map[i]['displayName'];
          }
        }
      } else {
        return _.isEmpty(input)? '' : input;
      }
    };

    /*var typeHash = {
      'companyIntroduction': '公司介绍',
      'companyEnvironment': '工作环境',
      'companyActivities' : '公司活动',
      'companyWelfare' : '薪资福利',
      'promotionIntroduction' : '学习成长'
    };

    return function(input) {
      if (!input){
        return '';
      } else {
        return typeHash[input];
      }
    };*/
  });

  angular.module('companyTemplate').controller('CompanyTemplateController', CompanyTemplateController);
  CompanyTemplateController.$inject = ['$scope', '$state', '$http', 'toaster', '$window'];

  function CompanyTemplateController($scope, $state, $http, toaster, $window){

    /*var informationTypeList = [{
      'displayName' : '公司介绍',
      'id' : 'companyIntroduction'
    },{
      'displayName' : '工作环境',
      'id' : 'companyEnvironment'
    },{
      'displayName' : '公司活动',
      'id' : 'companyActivities'
    },{
      'displayName' : '薪资福利',
      'id' : 'companyWelfare'
    },{
      'displayName' : '学习成长',
      'id' : 'promotionIntroduction'
    }];*/
    var informationTypeList = [{
      'displayName' : '',
      'id' : ''
    }];

    var operationTemplate = '<div class="ui-grid-cell-contents"><i class="fa fa-trash-o blue" ng-click="grid.appScope.deleteTemplate(row.entity)" style="cursor: pointer;"></i>&nbsp;&nbsp;<i class="fa fa-fw fa-eye" ng-click="grid.appScope.viewTemplate(row.entity)" style="cursor: pointer;"></i></div>';

    var companyTemplateGridColumnDefs = [
      {name: '模版名', field:'name',  width: '180', enableCellEdit: false, enableColumnMenu: false},
      {name: '类型', field:'type',  width: '180', enableColumnMenu: false, enableCellEdit: true, cellFilter: 'segmentTypeFilter :editDropdownOptionsArray', editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownValueLabel: 'displayName', editDropdownOptionsArray: informationTypeList},
      {name: '操作', width: '180',enableCellEdit: false, cellTemplate:operationTemplate, enableColumnMenu: false}
    ];

    $scope.companyTemplateGrid = {
      data: [],
      columnDefs: companyTemplateGridColumnDefs,
      onRegisterApi : function(gridApi){
        this.gridApi = gridApi;
        gridApi.edit.on.afterCellEdit($scope, function( rowEntity, colDef, newValue, oldValue) {
          if(newValue != oldValue) {
            var templates =  _.filter($scope.companyTemplateGrid.data, {'type' : newValue});
            if(!_.isEmpty(newValue) && templates.length>1){
              rowEntity.type = oldValue;
              toaster.pop('error', 'duplicate template type');
            }else{
              $http.put('/api/v1/companyTemplate/'+ rowEntity._id, rowEntity).success(function (data){
                toaster.pop('success', 'update success');
              }).error(function(){
                toaster.pop('error', 'update fail,try again');
              });
            }
          }
        });
      }
    };


    $scope.loadData = function(){
      $http({
        method: 'GET',
        url: '/api/v1/companyTemplate'
      }).success(function(companyTemplates, status, headers){
        $scope.companyTemplateGrid.data = companyTemplates;
      });
    };

    $scope.deleteTemplate = function(template){
      if(!_.isEmpty(template)){
        $.confirm({
          title: '确定要删除？',
          content: false,
          confirmButton:'确定',
          cancelButton:'取消',
          confirmButtonClass: 'btn-info',
          cancelButtonClass: 'btn-default',
          theme:'black',
          keyboardEnabled:true,
          confirm: function(){
            $http.delete('/api/v1/companyTemplate/'+ template._id).success(function (data){
              toaster.pop('success', 'delete success');
              for (var i = 0; i < $scope.companyTemplateGrid.data.length; i++) {
                if (typeof($scope.companyTemplateGrid.data[i]._id) != 'undefined' && $scope.companyTemplateGrid.data[i]._id == template._id) {
                  $scope.companyTemplateGrid.data.splice(i, 1);
                  break;
                }
              }
            }).error(function(){
              toaster.pop('error', 'delete fail,try again');
            });
          },
          cancel: function(){
          }
        });
      }
    };

    $scope.viewTemplate = function(template){
      if(!_.isEmpty(template)){
        $window.open(template.url);
      }
    };

    $http.get('/api/v1/dictionary?query=' + JSON.stringify({category: '公司信息类型'})).then(function (result) {
      var allSegmentTypes = result.data.map(function (data) {
        return data.value;
      });
      _.forEach(allSegmentTypes, function(segmentType){
        informationTypeList.push({
          'displayName' : segmentType,
          'id' : segmentType
        });
      });
      informationTypeList.push({
        'displayName' : '招聘行程',
        'id' : '招聘行程'
      });
      $scope.loadData();
    });


  }

})();
