angular.module('modal', ['ui.bootstrap']);

var ModalDemoCtrl = function ($scope, $modal, $log) {
    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: 'modal.html',
            controller: ModalInstanceCtrl,
            resolve: {
                record: function () {
                    return $scope.record;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
};

var ModalInstanceCtrl = function ($scope, $modalInstance, record) {
};