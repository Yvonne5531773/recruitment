(function () {
    'use strict';
    angular.module('companyIntroduction').controller('CompanyIntroductionController', CompanyIntroductionController);
    CompanyIntroductionController.$inject = ['$scope', '$state', '$http', '$uibModal', 'instance', 'toaster'];

    function CompanyIntroductionController($scope, $state, $http, $uibModal, instance, toaster) {
        if(instance.msg){
            toaster.pop(instance.msg.type, instance.msg.content);
            instance.msg = null;
        }
        $scope.companyIntroductions= [];
        $scope.pageTitle = $state.current.data.name;
        $scope.allSegmentTypes = [];
        $scope.segmentType = localStorage.getItem('segmentType') ? localStorage.getItem('segmentType') : '';
        $scope.loadData = function () {
            localStorage.setItem('segmentType',$scope.segmentType);
            $http({
                method: 'GET',
                url: '/api/v1/companyInfoSegment?query='+encodeURIComponent(JSON.stringify({'type' : $scope.segmentType}))+'&sort='+encodeURIComponent(JSON.stringify({'sequence':1}))
            }).success(function (companyIntroductionSegments, status, headers) {
                $scope.companyIntroductions = companyIntroductionSegments;
            });
        };

        $scope.createCompanyIntroduction = function () {
            instance.sequences = _.map($scope.companyIntroductions, 'sequence');
            instance.entity = {
                'type' : $scope.segmentType
            };
            if(!_.isEmpty($scope.companyIntroductions)){
                instance.entity.isFlow = $scope.companyIntroductions[0].isFlow;
            }
            var sequenceList = _.map($scope.companyIntroductions, 'sequence');
            if(!_.isEmpty(sequenceList)){
                instance.entity.sequence = _.max(sequenceList)+1;
            }else{
                instance.entity.sequence = 1;
            }
            $state.go('companySegmentCreate',{type:$scope.segmentType});
        };

        $scope.updateCompanyIntroduction = function (entity) {
            instance.sequences = _.pull(_.map($scope.companyIntroductions, 'sequence'), entity.sequence);
            instance.entity = _.clone(entity);
            // $uibModal.open({
            //     templateUrl: 'client/maintain/views/company/companyForm.html',
            //     controller: 'companyEdit',
            //     size: 'lg'
            // });
            instance.sequences = _.pull(_.map($scope.companyIntroductions, 'sequence'), entity.sequence);
            instance.entity = _.clone(entity);
            $state.go('companySegmentEdit',{id:entity._id});
        };

        $scope.deleteCompanyIntroduction = function(entity){
            if(!_.isEmpty(entity)){
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
                        $http.delete('/api/v1/companyInfoSegment/'+ entity._id).success(function (data){
                            toaster.pop('success', 'delete success');
                            for (var i = 0; i < $scope.companyIntroductions.length; i++) {
                                if (typeof($scope.companyIntroductions[i]._id) != 'undefined' && $scope.companyIntroductions[i]._id == entity._id) {
                                    $scope.companyIntroductions.splice(i, 1);
                                    break;
                                } }
                        }).error(function(){
                            toaster.pop('error', 'delete fail,try again');
                        });
                    },
                    cancel: function(){
                    }
                });
            }
        };

        $scope.changeCompanySegmentLayout = function(){
            if(!_.isEmpty($scope.companyIntroductions)){
                $http.put('/api/companyInfoSegment/changeCompanySegmentLayout?segmentType='+$scope.segmentType, {'isFlow' : !$scope.companyIntroductions[0].isFlow}).success(function (data) {
                    toaster.pop('success', 'Update success');
                    $scope.loadData();
                }).error(function () {
                    toaster.pop('error', 'Create fail,try again');
                })
            }

        };

        instance.loadData = $scope.loadData;

        $http.get('/api/v1/dictionary?query=' + JSON.stringify({category: '公司信息类型'})).then(function (result) {
            $scope.allSegmentTypes = result.data.map(function (data) {
                return data.value;
            });
            if(!_.isEmpty($scope.allSegmentTypes)){
               // $scope.segmentType =$scope.allSegmentTypes[0];
                $scope.loadData();
            }

        });
    }


})();
