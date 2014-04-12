$(function() {
	var spotifySearchEndpoint = "http://ws.spotify.com/search/1/track.json?q=";
	
	var viewModel = {
		givenTrackName: ko.observable(""),
		trackTitle: ko.observable(""),
		trackArtist: ko.observable(""),
		trackAvailability: ko.observable("")
	};

	ko.applyBindings(viewModel);
});
