angular.module("Challenge", ['ui.bootstrap'])
	.controller("ChallengeController", ChallengeCtrl);

ChallengeCtrl.$inject = ["$http", "$scope", "$location", "$window", "$modal", "$log"];

function ChallengeCtrl($http, $scope, $location, $window, $modal, $log) {
	var cCtrl = this;

	console.log("Controller loaded!", $scope);
	cCtrl.welcomeMessage = "Tracking Numbers";
	
	$http.get($location.absUrl() + 'api/v1/records')
		.then( (response) => {
			console.log("resp", response);
			$scope.records = response.data.records;
		});

	$scope.clickLink = function(record) {
		console.log("clicked!", record);
		$scope.selectedRecord = record;
		$scope.open();
	};

	$scope.open = function () {

		var modalInstance = $modal.open({
		  templateUrl: 'html/modal.html',
		  controller: ModalInstanceCtrl,
		  resolve: {
			record: function () {
			  return $scope.selectedRecord;
			}
		  }
		});
	
		modalInstance.result.then(function () {
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	};
	
}

var ModalInstanceCtrl = function ($scope, $modalInstance, record, $window) {
	console.log("# record", record);
	$scope.record = record;
	$scope.selected = {
	  record: $scope.record
	};
  
	$scope.track = function () {
		$window.open($scope.record.tracking_url);
		// $modalInstance.close($scope.selected.item);
	};
  
	$scope.cancel = function () {
	  $modalInstance.dismiss('cancel');
	};
  };