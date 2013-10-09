/*global module:false*/
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            app: {
                src: [],
                options: {
                    vendor: [
                        'widgets/tests/SetUpTests.js',
                        'http://js.arcgis.com/3.7/'
                    ],
                    specs: [
                        'widgets/tests/spec/*.js',
                        'modules/tests/spec/*.js'
                    ]
                }
            }
        },
        jshint: {
            files: [
                'modules/**/*.js',
                'resources/**/*.js',
                'widgets/**/*.js',
                'Gruntfile.js',
                'agrc.profile.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                ignores: ['resources/libs/*.js']
            }
        },
        watch: {
            files: [
                'modules/**/*.js',
                'resources/**/*.js',
                'widgets/**/*.js',
                'modules/**/*.html',
                'resources/**/*.html',
                'widgets/**/*.html',
                'modules/**/*.css',
                'resources/**/*.css',
                'widgets/**/*.css'
            ],
            tasks: ['jasmine:app:build', 'jshint'],
            options: {
                livereload: true
            }
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