module.exports = function (grunt) {
    var bumpFiles = [
        'package.json',
        'package-lock.json',
        'bower.json'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles,
                pushTo: 'origin'
            }
        },
        connect: {
            uses_defaults: {}
        },
        esri_slurp: {
            options: {
                version: '3.13'
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
        },
        jasmine: {
            main: {
                src: [],
                options: {
                    vendor: [
                        'bower_components/jasmine-favicon-reporter/vendor/favico.js',
                        'bower_components/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'bower_components/jasmine-jsreporter/jasmine-jsreporter.js',
                        'widgets/tests/SetUpTests.js',
                        'bower_components/dojo/dojo.js',
                        'widgets/tests/jasmineAMDErrorChecking.js'
                    ],
                    specs: [
                        'widgets/tests/spec/*.js',
                        'modules/tests/spec/*.js'
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            main: {
                src: [
                    'widgets/**/*.js',
                    'modules/**/*.js',
                    'resources/**/*.js',
                    'Gruntfile.js',
                    'agrc.profile.js'
                ]
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            files: [
                '**',
                '!_SpecRunner.html',
                '!**/node_modules/**',
                '!**/bower_components/**',
                '!**/vendor/**'
            ],
            tasks: [
                'jasmine:main:build',
                'amdcheck',
                'eslint'
            ],
            options: {
                livereload: true
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
        'eslint',
        'connect',
        'jasmine:main:build',
        'watch'
    ]);

    grunt.registerTask('travis', [
        'if-missing:esri_slurp:travis',
        'eslint',
        'connect',
        'jasmine'
    ]);
};
