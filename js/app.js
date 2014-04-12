function TrackViewModel() {
	var self = this;

    self.givenTrackName = ko.observable("");
    self.selectedTrack = ko.observable({});
    self.retrievedTracks = ko.observableArray([]);
    self.trackOnSpotify = ko.computed(function() {
        return self.retrievedTracks().length > 0;
    });

    self.getTrackAvailability = function(formElement) {
        var spotifySearchEndpoint = "http://ws.spotify.com/search/1/track.json?q=";
        var searchTargetUrl = spotifySearchEndpoint + this.givenTrackName();
        $.ajax(searchTargetUrl).done(function(data) {
        	self.retrievedTracks(data.tracks);
            var foundTracks = data.tracks.length > 0;
            if (!foundTracks) {
                return;
            }

            var track = data.tracks[0];
            var trackTitle = track.name;
            var trackArtist = track.artists[0].name;

            var album = track.album;
            var rawAvailabilityString = album.availability.territories;
            var availability = rawAvailabilityString.split(" ");

            self.selectedTrack({
                title: trackTitle,
                artist: trackArtist,
                regions: availability,
                numberOfRegions: availability.length
            });
        });
    };
}

$(function() {

    var viewModel = new TrackViewModel();

    ko.applyBindings(viewModel);
});
