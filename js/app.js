$(function() {
    var spotifySearchEndpoint = "http://ws.spotify.com/search/1/track.json?q=";

    var viewModel = {
        givenTrackName: ko.observable(""),
        selectedTrack: ko.observable({}),
        retrievedTracks: ko.observableArray([]),
        getTrackAvailability: function(formElement) {
            var searchTargetUrl = spotifySearchEndpoint + this.givenTrackName();
            var that = this;
            $.ajax(searchTargetUrl).done(function(data) {
                var retrievedTracks = data.tracks.length > 0;
                if (!retrievedTracks) {
                    return;
                }

                var track = data.tracks[0];
                var trackTitle = track.name;
                var trackArtist = track.artists[0].name;

                var album = track.album;
                var rawAvailabilityString = album.availability.territories;
                var availability = rawAvailabilityString.split(" ");

                that.selectedTrack({
                	title: trackTitle,
                	artist: trackArtist,
                	regions: availability
                });
            });
        }
    };

    ko.applyBindings(viewModel);
});
