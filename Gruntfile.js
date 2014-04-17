/* jshint camelcase:false */
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            'default': {
                src: [],
                options: {
                    vendor: [
                        'widgets/tests/SetUpTests.js',
                        'bower_components/dojo/dojo.js'
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
                ignores: [
                    'bower_components/**'
                ]
            }
        },
        watch: {
            files: [
                '**',
                '!_SpecRunner.html',
                '!**/node_modules/**',
                '!**/bower_components/**'
            ],
            tasks: ['jasmine:default:build', 'jshint'],
            options: {
                livereload: true
            }
        },
        connect: {
            uses_defaults: {}
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                commitFiles: ['-a'],
                push: false
            }
        }
    });

    // Register tasks.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-bump');

    // Default task.
    grunt.registerTask('default', ['jasmine:default:build', 'jshint', 'connect', 'watch']);

    grunt.registerTask('travis', ['jshint', 'connect', 'jasmine:default']);
};