/*global module:false*/
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            app: {
                src: [
                    'widgets/tests/SetUpTests.js'
                ],
                options: {
                    vendor: [
                        'http://serverapi.arcgisonline.com/jsapi/arcgis/3.4/'
                    ],
                    specs: [
                        // 'widgets/tests/spec/*.js',
                        // 'modules/tests/spec/*.js'
                        'widgets/tests/spec/SpecBaseMap.js',
                        'widgets/tests/spec/SpecFindAddress.js',
                        'modules/tests/spec/SpecString.js'
                    ]
                }
            }
        },
        jshint: {
            files: [
                // 'widgets/**/*.js',
                // 'modules/**/*.js'
                'widgets/tests/spec/SpecBaseMap.js',
                'widgets/map/BaseMap.js',
                'widgets/tests/spec/SpecFindAddress.js',
                'widgest/locate/SpecFindAddress.js',
                'modules/String.js',
                'modules/SpecString.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            files: [
                'widgets/**/*.js',
                'modules/**/*.js'
            ],
            tasks: ['jasmine:app:build', 'jshint']
        },
        connect: {
            uses_defaults: {}
        }
    });

    // Register tasks.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Default task.
    grunt.registerTask('default', ['jasmine:app:build', 'jshint', 'connect', 'watch']);
};