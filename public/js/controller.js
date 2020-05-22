angular.module("Challenge", ['ui.bootstrap'])
	.controller("ChallengeController", ChallengeCtrl);

ChallengeCtrl.$inject = ["$http", "$scope", "$location", "$window", "$modal", "$log"];

function ChallengeCtrl($http, $scope, $location, $window, $modal, $log) {
	var cCtrl = this;

	void 0;
	cCtrl.welcomeMessage = "Tracking Numbers";

		$http.get($location.absUrl() + 'api/v1/records')
		.then( (response) => {
			void 0;
			$scope.records = response.data.records;
		});

	$scope.clickLink = function(record) {
		void 0;
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
			void 0;
		});
	};

	}

var ModalInstanceCtrl = function ($scope, $modalInstance, record, $window) {
	void 0;
	$scope.record = record;
	$scope.selected = {
	  record: $scope.record
	};

  	$scope.track = function () {
		$window.open($scope.record.tracking_url);
	};

  	$scope.cancel = function () {
	  $modalInstance.dismiss('cancel');
	};
  };