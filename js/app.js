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
	this.album = new App.Models.Album(track.album);
};

App.Models.Album = function(album) {
	this.name = album.name;
	this.image = "";
	if (album.images.length > 0) {
		this.image = album.images[album.images.length - 1].url;
	}

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

App.ViewModels.MainViewModel = function() {
	var self = this;

	self.givenName = ko.observable("");
	self.submittedName = ko.observable("");

	self.queryType = ko.observable("");
	self.isTrack = ko.computed(function() {
		return self.queryType() === 'track';
	});

	self.selectedItem = ko.observable(null);

	self.retrievedItems = ko.observableArray([]);
	self.itemOnSpotify = ko.computed(function() {
		return self.retrievedItems().length > 0;
	});

	self.searchCompleted = ko.observable(false);

	self.search = function(formElement) {
		if (self.queryType() == 'track') {
			self.getTrackAvailability(formElement);
		} else {
			self.getAlbumAvailability(formElement);
		}
	};

	self.getAlbumAvailability = function(formElement) {
		self.searchCompleted(false);
		self.retrievedItems([]);
		self.selectedItem(null);
		if (self.givenName().length === 0) {
			return;
		}

		self.submittedName(self.givenName());
		var spotifySearchEndpoint = "https://api.spotify.com/v1/search?type=album&q=";
		var searchTargetUrl = spotifySearchEndpoint + '"' + self.givenName() + '"';

		$.ajax(searchTargetUrl).done(function(data) {
			var parsedAlbums = [];
			for (var i = 0; i < data.albums.items.length; i++) {
				var json = data.albums.items[i];
				var model = new App.Models.Album(json);
				parsedAlbums.push(model);
			}

			self.retrievedItems(parsedAlbums);
			self.searchCompleted(true);

			var foundAlbums = data.albums.items.length > 0;
			if (!foundAlbums) {
				return;
			}

			self.selectedItem(parsedAlbums[0]);
		});
	};


	self.getTrackAvailability = function(formElement) {
		self.searchCompleted(false);
		self.retrievedItems([]);
		self.selectedItem(null);
		if (self.givenName().length === 0) {
			return;
		}

		self.submittedName(self.givenName());
		var spotifySearchEndpoint = "https://api.spotify.com/v1/search?type=track&q=";
		var searchTargetUrl = spotifySearchEndpoint + '"' + self.givenName() + '"';
		
		$.ajax(searchTargetUrl).done(function(data) {
			var parsedTracks = [];
			for (var i = 0; i < data.tracks.items.length; i++) {
				var rawTrack = data.tracks.items[i];
				var newModel = new App.Models.Track(rawTrack);
				parsedTracks.push(newModel);
			}
			self.retrievedItems(parsedTracks);

			self.searchCompleted(true);

			var foundTracks = data.tracks.items.length > 0;
			if (!foundTracks) {
				return;
			}

			var track = parsedTracks[0];
			self.selectedItem(track);
		});
	};

	self.toggleRegions = function() {
		$("#region-list").slideToggle();
	};

	self.toggleAlternatives = function() {
		if (self.retrievedItems().length <= 1) {
			return;
		}
		$("#alternatives").slideToggle();
	};

	self.selectAlternative = function(alternative) {
		self.toggleAlternatives();
		self.selectedItem(alternative);
	};
};

$(function() {
	var viewModel = new App.ViewModels.MainViewModel();
	ko.applyBindings(viewModel);
	viewModel.queryType.subscribe(function(value) {
		viewModel.searchCompleted(false);
	}, null, 'beforeChange');
});
