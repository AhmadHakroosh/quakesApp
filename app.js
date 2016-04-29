angular.module('quakesApp', [])

.controller('eventsCtrl', ['$scope', '$data', function ($scope, $data){

	//default url string
	$scope.url = 'http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=100&orderby=time&eventtype=earthquake';
	//a markers container to link the list of events with markers
	$scope.markers = [];

	//get the events
	getEvents($scope.url);

	//a function to retreive dates entered within the form, and send a new request with new parameters
	$scope.limitDates = function () {
		var start = $scope.startDate.getFullYear() + '-' + $scope.startDate.getMonth() + '-' + $scope.startDate.getDate();
		var end = $scope.endDate.getFullYear() + '-' + $scope.endDate.getMonth() + '-' + $scope.endDate.getDate();
		$scope.url += '&starttime=' + start + '&endtime=' + end;
		console.log($scope.url);
		getEvents($scope.url);
	}

	//main function of the application
	function getEvents (url) {
		//use the service $data to get data from a specific url
		$data.getEvents(url).then(function (response) {
			$scope.events = response;

			$('#map').height($(window).height() - $('nav').height());

			//create a new map element
			var map = new google.maps.Map(document.getElementById('map'), {
				center: { lat: 0, lng: 0 },
				zoom: 2
			});

			//add a marker for each event on the map
			$scope.events.forEach(function (event) {

				var marker = new google.maps.Marker({
					position : {lat: event.geometry.coordinates[1], lng: event.geometry.coordinates[0]},
					map: map,
	    			animation: google.maps.Animation.DROP,
	    			title: event.properties.title
				});

				//push the marker to the container
				$scope.markers[event.id] = marker;

				var contentString = '<div><p>This Earth Quake happened ' + event.properties.place + ", at: " + Date(event.properties.time).toString() + ".</p><p>Read more <a href='" + event.properties.url + "' target='_blank'>here</a></p>"
				//add an info window for each marker
				var infoWindow = new google.maps.InfoWindow({
					content: contentString
				});
				//on marker click, focus the related list item, display the info window and vice versa
				marker.addListener('click', toggleBounce);

				//on list item click, trigger the related marker
				$scope.toggleMarker = function () {
					google.maps.event.trigger($scope.markers[this.event.id], 'click');
				}

				function toggleBounce () {
					if (marker.getAnimation() !== null) {
						marker.setAnimation(null);
						infoWindow.close();
					} else {
						marker.setAnimation(google.maps.Animation.BOUNCE);
						infoWindow.open(map, marker);
						document.getElementById(event.id).focus();
					}
				}
			});
		});
	}
}])

//a service for retreiving data from a given url passed to the returned function
.factory('$data', ['$http', function ($http) {
	return {
		getEvents: function (url) {
			return $http.get(url).then(function (response) {
				return response.data.features;
			})
		}
	}
}]);