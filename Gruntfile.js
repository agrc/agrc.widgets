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
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        jshint: {
            files: [
                'widgets/**/*.js',
                'modules/**/*.js',
                'resources/**/*.js',
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
            tasks: [
                'jasmine:default:build',
                'jshint',
                'amdcheck'
            ],
            options: {
                livereload: true
            }
        },
        connect: {
            /* jshint -W106 */
            uses_defaults: {}
            /* jshint +W106 */
        },
        bump: {
            options: {
                files: [
                    'package.json',
                    'bower.json'
                ],
                commitFiles: ['-a'],
                push: false
            }
        },
        amdcheck: {
            dev: {
                options: {
                    removeUnusedDependencies: false
                },
                files: [{
                    src: [
                        'widgets/**/*.js',
                        'modules/**/*.js'
                    ]
                }]
            }
        }
    });

    // Register tasks.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-amdcheck');

    // Default task.
    grunt.registerTask('default', ['jshint', 'amdcheck', 'connect', 'watch', 'jasmine:default:build']);

    grunt.registerTask('travis', ['jshint', 'connect', 'jasmine:default']);
};