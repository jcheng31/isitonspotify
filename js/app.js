function TrackViewModel() {
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
        var spotifySearchEndpoint = "http://ws.spotify.com/search/1/track.json?q=";
        var searchTargetUrl = spotifySearchEndpoint + self.givenTrackName();
        $.ajax(searchTargetUrl).done(function(data) {
            self.retrievedTracks(data.tracks);
            self.searchCompleted(true);

            var foundTracks = data.tracks.length > 0;
            if (!foundTracks) {
                return;
            }

            var track = data.tracks[0];
            var trackTitle = track.name;
            var trackArtist = track.artists[0].name;

            var album = track.album;
            var rawAvailabilityString = album.availability.territories;
            var countryCodes = rawAvailabilityString.split(" ");

            var countries = [];
            for (var i = 0; i < countryCodes.length; i++) {
                var countryCode = countryCodes[i];
                var country = countryDictionary[countryCode];
                countries.push(country);
            }

            self.selectedTrack({
                title: trackTitle,
                artist: trackArtist,
                album: album.name,
                numberOfRegions: countries.length,
                regions: countries.sort()
            });
        });
    };

    self.toggleRegions = function() {
        $("#region-list").slideToggle();
    };
}

$(function() {
    var viewModel = new TrackViewModel();
    ko.applyBindings(viewModel);
});
