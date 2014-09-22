/* jshint camelcase:false */
module.exports = function(grunt) {
    var bumpFiles = [
        'package.json',
        'bower.json'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            main: {
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
                    'bower_components/**',
                    'resources/libs/**'
                ]
            }
        },
        watch: {
            files: [
                '**',
                '!_SpecRunner.html',
                '!**/node_modules/**',
                '!**/bower_components/**',
                '!**/vendor/**'
            ],
            tasks: [
                'jasmine:default:build',
                'amdcheck',
                'jshint'
            ],
            options: {
                livereload: true
            }
        },
        connect: {
            uses_defaults: {}
        },
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles,
                pushTo: 'origin'
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
        },
        esri_slurp: {
            options: {
                version: '3.10'
            },
            dev: {
                options: {
                    beautify: true
                },
                dest: 'vendor/esri'
            },
            travis: {
                dest: 'vendor/esri'
            }
        }
    });

    // Register tasks.
    for (var key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) {
            grunt.loadNpmTasks(key);
        }
    }

    // Default task.
    grunt.registerTask('default', [
        'if-missing:esri_slurp:dev',
        'amdcheck',
        'jshint',
        'connect',
        'jasmine:main:build',
        'watch'
    ]);

    grunt.registerTask('travis', [
        'esri_slurp:travis',
        'jshint',
        'connect',
        'jasmine:main'
    ]);
};