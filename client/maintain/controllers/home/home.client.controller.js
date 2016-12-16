angular.module('home').controller('homeController',['$scope','$http','$cookies', function ($scope, $http,$cookies) {

  var getApplicants = $http.get('/api/v1/applicant',{
                                 params :{
                                   sort : 'updated'
                                 }
                               });
  var getActivePositions = $http.get('/api/v1/position', {
    params : {
     query : {
       status : 'ACTIVE'
     }
    }
  });
  //applicant?query=%7B%22updated%22:%7B%7D%7D&sort=update
  function setScope(result) {
    $scope.rawData = result.data;
  }
  function formatApplicants() {
    var applicants = $scope.rawData;
    var map = {};
    var allPositions = [];
    var allDates = [];
    function formatDate(date) {
      var date = new Date(date);
      var year = date.getFullYear(),
          month = date.getMonth() + 1;
      date = year + '-' + (month < 10 ? ('0' + month) : month) + '-' + date.getDate();
      return date.substring(0,$scope.isByDay ? 10 : 7);
    }
    var fromDate = formatDate($scope.fromDate);
    var toDate = formatDate($scope.toDate);
    applicants.forEach(function (applicant) {
      var updatedDate = applicant.updated.substring(0,$scope.isByDay ? 10 : 7);
      if (updatedDate < fromDate || updatedDate > toDate) {
        return;
      }
      if (!~allDates.indexOf(updatedDate)) {
        allDates.push(updatedDate);
      }
      applicant.appliedPositions.forEach(function (position) {
        var positionName = position.positionName;
        if ($scope.showActive && !~$scope.activePositions.indexOf(positionName)) {
          return;
        }
        if (!~allPositions.indexOf(positionName)) {
          allPositions.push(positionName);
        }
        if (!map[positionName]) {
          map[positionName] = {};
          map[positionName][updatedDate] = 1;
        } else {
          if (map[positionName][updatedDate]) {
            map[positionName][updatedDate] = map[positionName][updatedDate] + 1;
          } else {
            map[positionName][updatedDate] = 1;
          }
        }
      });
    });
    $scope.map = map;
    $scope.allDates = allDates;
    $scope.allPositions = allPositions;
    return map;
  }


  function randerChart() {
    var map = $scope.map;
    var series = [];
    $scope.allPositions.forEach(function (positionName) {
      var data = [];
      $scope.allDates.forEach(function (date) {
        data.push(map[positionName][date] || 0);
      })
      series.push({
          name: positionName,
          type: 'bar',
          stack:'position',
          data: data
      });
    });

    var option = {
      tooltip : {
         trigger: 'axis',
         axisPointer : {
           type : 'shadow'
         }
      },
      title: {
          text: ''
      },
      xAxis : {
        data : $scope.allDates,
        name : '日期'
      },
      legend : {
        data :  $scope.allPositions
      },
      yAxis : [{
         type: 'value',
         scale: true,
         name: '人数'
      }],
      series: series
    };
    $scope.applyChart.setOption(option);
  }

  $scope.isByDay = false;
  $scope.show = '显示招聘中职位';
  $scope.showActive = false;
  $scope.toggleShow = function () {
    $scope.showActive = !$scope.showActive;
    $scope.show = $scope.showActive ? '显示全部职位' : '显示招聘中职位';
    $scope.applyChart = echarts.init(document.getElementById('applyChart'));
    $scope.change();
  }

  $scope.change = function () {
    formatApplicants()
    randerChart();
  }
  $scope.byMonth = function () {
    $scope.isByDay = false;
    $scope.change();
  }

  $scope.byDay = function () {
    $scope.isByDay = true;
    $scope.change();
  }

  $scope.datePickerOptions = {
    dateOptions : {
      formatYear: 'yy',
      startingDay: 1
    },
    format : 'yyyy年MM月dd日',
    popupFrom : {
      opened : false,
      open : function () {
        this.opened = true;
      }
    },
    popupTo : {
      opened : false,
      open : function () {
        this.opened = true;
      }
    }
  }

  $scope.fromDate = null;
  $scope.toDate = Date.now();

  $scope.init = function () {
    // 基于准备好的dom，初始化echarts实例
    $scope.applyChart = echarts.init(document.getElementById('applyChart'));
    getApplicants.then(setScope)
                 .then(formatApplicants)
                 .then(randerChart);
    getActivePositions.then(function (result) {
      $scope.activePositions = result.data.map(function (d) {
        return d.name;
      });
    })
    // 指定图表的配置项和数据


  }
}]);
