/*global module:false*/
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            app: {
                src: ['src/app/tests/jasmineTestBootstrap.js',
                    'src/app/run.js'],
                options: {
                    specs: [
                        'widgets/tests/spec/*.js',
                        'modules/tests/spec/*.js'
                    ]
                }
            }
        },
        jshint: {
            files: [
                'widgets/**/*.js',
                'modules/**/*.js'
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