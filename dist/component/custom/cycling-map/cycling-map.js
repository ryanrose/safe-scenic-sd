var server = 'https://sandiego.azurewebsites.net';
server = '/api';

Polymer({
    is: 'cycling-map',
    properties: {
        longitude: {
            type: Number,
            value: null,
            notify: true,
            reflectToAttribute: true,
            observer: '_coordinateUpdated'
        },
        latitude: {
            type: Number,
            value: null,
            notify: true,
            reflectToAttribute: true,
            observer: '_coordinateUpdated'
        },
        apiURL: {
            type: String,
            value: server + "/routes/getClosestRoutes.json",
            reflectToAttribute: true,
        },
        apiAddParticipantsURL: {
            type: String,
            value: server + "/routes/addParticipant",
            reflectToAttribute: true,
        },
        apiRemoveParticipantsURL: {
            type: String,
            value: server + "/routes/removeParticipant",
            reflectToAttribute: true,
        }
    },
    ready: function () {
        this.routes = [];
        this.autoDiscover();
    },
    _coordinateUpdated: function () {
        if (this.longitude && this.latitude) {
            this.setMapCenter();
        }

    },
    setMapCenter: function () {
        if (this.longitude && this.latitude) {
            var map = document.querySelector("google-map");
            map.longitude = this.longitude;
            map.latitude = this.latitude;
            this.updateRoutes();
        }
    },
    updateRoutes: function () {
        var _this = this;
        if (this.longitude && this.latitude) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    _this.routes = response;
                    _this.checkRouteDisplay();
                    
                }
            }
            xhr.open('GET', this.apiURL + '?lat=' + this.latitude + '&lng=' + this.longitude);
            xhr.send();
        }
    },
    autoDiscover: function() {
        if (!this.latitude && !this.longitude) {
            if (!navigator.geolocation) {
                console.log("Map will not load. Please enable geolocation.");
                return;
            }

            var _this = this;

            navigator.geolocation.getCurrentPosition(function (position) {
                _this.latitude = position.coords.latitude;
                _this.longitude = position.coords.longitude;
            });
        }
    },
    addClass: function(className, element) {
        var currentClass = element.className;
        if (currentClass.indexOf(className) < 0)
            element.className += " " + className;
    },
    removeClass: function (className, element) {
        var currentClass = element.className;
        if (currentClass.indexOf(className) >= 0) {
            var allClassInstances = new RegExp(className, 'g');
            element.className = element.className.replace(allClassInstances, className);
        }
           
    },
    checkRouteDisplay: function () {
        if (this.routes && this.routes.length > 0) {
            this.$.listTitle.innerHTML = "Bike Routes";
        }
    },
    openMapMarker: function (e) {
        var markerId = e.model.item.Id;
        var marker = document.querySelector("#marker" + markerId);
        marker.open = !marker.open;
    },
    toggleRouteGroup: function (e) {
        var icon = e.target;
        var markerId = e.model.item.Id;
        var apiUrl = "";
        if (icon.innerHTML == "close") {
            icon.innerHTML = "playlist_add";
            apiUrl = this.apiRemoveParticipantsURL;
        } else
        {
            icon.innerHTML = "close";
            apiUrl = this.apiAddParticipantsURL;
        }

        apiUrl += "?routeId=" + markerId;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log("call executed");
            }
        }
        xhr.open('GET', apiUrl);
        xhr.send();
    }
});