var App = {};
App.Models = {};
App.ViewModels = {};

App.Models.Track = function(track) {
	this.title = track.name;

	var artists = [];
	for (var i = 0; i < track.artists.length; i++) {
		artists.push(track.artists[i].name);
	}
	this.artist = artists.join(", ");

	var album = track.album;
	this.album = new App.Models.Album(track.album)
};

App.Models.Album = function(album) {
	this.name = album.name;

	var countryCodes = album.available_markets;

	var countries = [];
	for (var i = 0; i < countryCodes.length; i++) {
		var countryCode = countryCodes[i];
		var country = countryDictionary[countryCode];
		countries.push(country);
	}

	this.numberOfRegions = countries.length;
	this.regions = countries.sort();
};

App.ViewModels.TrackViewModel = function() {
	var self = this;

	self.givenTrackName = ko.observable("");
	self.submittedTrackName = ko.observable("");

	self.selectedTrack = ko.observable({});

	self.retrievedTracks = ko.observableArray([]);
	self.trackOnSpotify = ko.computed(function() {
		return self.retrievedTracks().length > 0;
	});
	self.trackNotOnSpotify = ko.computed(function() {
		return !self.trackOnSpotify();
	});

	self.searchCompleted = ko.observable(false);


	self.getTrackAvailability = function(formElement) {
		self.searchCompleted(false);
		if (self.givenTrackName().length === 0) {
			return;
		}

		self.submittedTrackName(self.givenTrackName());
		var spotifySearchEndpoint = "https://api.spotify.com/v1/search?type=track&q=";
		var searchTargetUrl = spotifySearchEndpoint + '"' + self.givenTrackName() + '"';
		
		$.ajax(searchTargetUrl).done(function(data) {
			var parsedTracks = [];
			for (var i = 0; i < data.tracks.items.length; i++) {
				var rawTrack = data.tracks.items[i];
				var newModel = new App.Models.Track(rawTrack);
				parsedTracks.push(newModel);
			}
			self.retrievedTracks(parsedTracks);

			self.searchCompleted(true);

			var foundTracks = data.tracks.items.length > 0;
			if (!foundTracks) {
				return;
			}

			var track = parsedTracks[0];
			self.selectedTrack(track);
		});
	};

	self.toggleRegions = function() {
		$("#region-list").slideToggle();
	};

	self.toggleAlternateTracks = function() {
		if (self.retrievedTracks().length <= 1) {
			return;
		}
		$("#alternate-tracks").slideToggle();
	};

	self.selectAlternateTrack = function(alternateTrack) {
		self.toggleAlternateTracks();
		self.selectedTrack(alternateTrack);
	};
};

$(function() {
	var viewModel = new App.ViewModels.TrackViewModel();
	ko.applyBindings(viewModel);
});
