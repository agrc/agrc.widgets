define([], function() {
        return [{
            label: "Terrain",
            layers: [{
                url: "http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Terrain/MapServer",
                opacity: 1
            }]
        }, {
            label: "Hybrid",
            layers: [{
                url: "http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Hybrid/MapServer",
                opacity: 1
            }]
        }, {
            label: "Streets",
            layers: [{
                url: "http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Vector/MapServer",
                opacity: 1
            }]
        }, {
            label: "Imagery",
            layers: [{
                url: "http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Imagery/MapServer",
                opacity: 1
            }]
        }, {
            label: "Topo",
            layers: [{
                url: "http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Topo/MapServer",
                opacity: 1
            }]
        }, {
            label: "Lite",
            layers: [{
                url: "http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Lite/MapServer",
                opacity: 1
            }]
        }, {
            label: "Hillshade",
            layers: [{
                url: "http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Hillshade/MapServer",
                opacity: 1
            }]
        }];
    });