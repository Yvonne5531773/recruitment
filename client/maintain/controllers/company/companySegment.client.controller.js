/**
 * Created by ZOUDA on 6/21/2016.
 */

angular.module('companyIntroduction').controller('companySegment', ['$scope', '$http', 'toaster', 'instance', '$state', '$window', '$stateParams','maskerService', function ($scope, $http, toaster, instance, $state, $window, $stateParams,maskerService) {
    if ($stateParams.id) {
        if (!instance.entity) {
            $http.get('/api/v1/CompanyInfoSegment/'+ $stateParams.id)
                .success(function (data) {
                    $scope.entity = data;
                })
                .error(function () {
                    toaster.pop('error', 'Fail to get data from server.');
                });
        } else {
            $scope.entity = instance.entity;
        }
    } else if ($stateParams.type) {
        $scope.entity = instance.entity ? instance.entity : {};
        $scope.entity.type = $stateParams.type;
    }
    $scope.pageTitle = $state.current.data.name;
    $scope.editorConfig = {
        toolbars: [[
            'fullscreen', 'source', '|', 'undo', 'redo', '|',
            'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
            'directionalityltr', 'directionalityrtl', 'indent', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
            'link', 'unlink', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
            'simpleupload', 'insertimage', 'emotion', 'scrawl', 'attachment', 'map', 'pagebreak', 'template', 'background', 'horizontal',
            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
            'help', 'drafts'
        ]],
        initialFrameHeight: 480
    };

    $scope.back = function () {
        //$state.go('companyIntroduction');
        $window.history.back();
    };
    $scope.showInput = function () {
        alert($scope.content);
    };
    $scope.submit = function (valid) {
        if (!valid) return;
        maskerService.showMasker();
        //$scope.entity.type = 'companyIntroduction';
        if (_.indexOf(instance.sequences, $scope.entity.sequence) > -1) {
            $scope.alertMsg = "Duplicate sequence number";
            return;
        }
        if ($scope.entity._id) {
            $http.put('/api/v1/CompanyInfoSegment/' + $scope.entity._id, $scope.entity).success(function (data) {
                // instance.msg = {type: 'success', content: 'Update success'};
                // toaster.pop('success', 'Update success');
                // $window.history.back();
                // instance.loadData();
                // $window.history.back();
                maskerService.clearMasker();
                $scope.back();
            }).error(function () {
                maskerService.clearMasker();
                toaster.pop('error', 'Create fail,try again');
            })
        }
        else {
            $http.post('/api/v1/CompanyInfoSegment', $scope.entity).success(function (data) {
                //instance.msg = {type: 'success', content: 'Update success'};
                //toaster.pop('success', 'Create success');
                // $window.history.back();
                // instance.loadData();
                maskerService.clearMasker();
                $scope.back();
            }).error(function () {
                toaster.pop('error', 'Create fail,try again');
            });
        }
    };

    $scope.closeAlert = function (index) {
        $scope.alertMsg = null;
    };
}]);
