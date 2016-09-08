define([], function () {
    return [{
        label: 'Terrain',
        layers: [{
            url: window.location.protocol + '//basemaps.utah.gov/ArcGIS/rest/services/BaseMaps/Terrain/MapServer',
            opacity: 1
        }]
    }, {
        label: 'Hybrid',
        layers: [{
            url: window.location.protocol + '//basemaps.utah.gov/ArcGIS/rest/services/BaseMaps/Hybrid/MapServer',
            opacity: 1
        }]
    }, {
        label: 'Streets',
        layers: [{
            url: window.location.protocol + '//basemaps.utah.gov/ArcGIS/rest/services/BaseMaps/Vector/MapServer',
            opacity: 1
        }]
    }, {
        label: 'Imagery',
        layers: [{
            url: window.location.protocol + '//basemaps.utah.gov/ArcGIS/rest/services/BaseMaps/Imagery/MapServer',
            opacity: 1
        }]
    }, {
        label: 'Topo',
        layers: [{
            url: window.location.protocol + '//basemaps.utah.gov/ArcGIS/rest/services/BaseMaps/Topo/MapServer',
            opacity: 1
        }]
    }, {
        label: 'Lite',
        layers: [{
            url: window.location.protocol + '//basemaps.utah.gov/ArcGIS/rest/services/BaseMaps/Lite/MapServer',
            opacity: 1
        }]
    }, {
        label: 'Hillshade',
        layers: [{
            url: window.location.protocol + '//basemaps.utah.gov/ArcGIS/rest/services/BaseMaps/Hillshade/MapServer',
            opacity: 1
        }]
    }];
});
