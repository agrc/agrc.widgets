window.dojoConfig = {
    baseUrl: './',
    packages: [
        {
            name: 'agrc',
            location: '.'
        }, {
            name: 'dojo',
            location: 'bower_components/dojo'
        }, {
            name: 'dijit',
            location: 'bower_components/dijit'
        }, {
            name: 'dojox',
            location: 'bower_components/dojox'
        }, {
            name: 'esri',
            location: 'vendor/esri'
        }, {
            name: 'stubmodule',
            location: 'bower_components/stubmodule/src',
            main: 'stub-module'
        }, {
            name: 'spin',
            location: 'bower_components/spinjs',
            main: 'spin'
        }
    ],
    has: {'dojo-undef-api': true}
};