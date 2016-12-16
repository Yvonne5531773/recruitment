/**
 * Created by ZOUDA on 6/21/2016.
 */
angular.module('companyIntroduction').filter(
  'to_trusted', ['$sce', function ($sce) {
      return function (text) {
          return $sce.trustAsHtml(text);
      }
  }]
);

angular.module('companyIntroduction').controller('companyEdit', ['$scope', '$uibModalInstance', '$http', 'toaster', 'instance', '$sce', function ($scope, $uibModalInstance, $http, toaster, instance,$sce) {
    $scope.entity = instance.entity ? instance.entity : {};

    $scope.cancel = function () {
        $uibModalInstance.close('cancel');
    };
    $scope.showInput = function () {
        alert($scope.content);
    };
    $scope.submit = function (valid) {
        if (!valid) return;
        //$scope.entity.type = 'companyIntroduction';
        if(_.indexOf(instance.sequences, $scope.entity.sequence)>-1){
            $scope.alertMsg = "Duplicate sequence number";
            return;
        }
        if ($scope.entity._id) {
            $http.put('/api/v1/CompanyInfoSegment/' + $scope.entity._id, $scope.entity).success(function (data) {
                $uibModalInstance.close('ok');
                toaster.pop('success', 'Update success');
                instance.loadData();
            }).error(function () {
                toaster.pop('error', 'Create fail,try again');
            })
        }
        else {
            $http.post('/api/v1/CompanyInfoSegment', $scope.entity).success(function (data) {
                $uibModalInstance.close('ok');
                toaster.pop('success', 'Create success');
                instance.loadData();
            }).error(function () {
                toaster.pop('error', 'Create fail,try again');
            });
        }
    };

    $scope.closeAlert = function (index) {
        $scope.alertMsg = null;
    };
}]);
