/* jshint camelcase:false */
module.exports = function(grunt) {
    var osx = 'OS X 10.10';
    var windows = 'Windows 8.1';
    var browsers = [{

        // OSX
        browserName: 'safari',
        platform: osx
    }, {


        // Windows
        browserName: 'firefox',
        platform: windows
    }, {
        browserName: 'chrome',
        platform: windows
    }, {
        browserName: 'internet explorer',
        platform: windows,
        version: '11'
    }, {
        browserName: 'internet explorer',
        platform: 'Windows 8',
        version: '10'
    }, {
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '9'
    }];

    var sauceConfig = {
        urls: ['http://127.0.0.1:8000/_SpecRunner.html'],
        tunnelTimeout: 20,
        build: process.env.TRAVIS_JOB_ID,
        browsers: browsers,
        testname: 'atlas',
        maxRetries: 10,
        maxPollRetries: 10,
        'public': 'public',
        throttled: 3,
        sauceConfig: {
            'max-duration': 10800
        }
    };
    var secrets;
    var bumpFiles = [
        'package.json',
        'bower.json'
    ];
    try {
        secrets = grunt.file.readJSON('secrets.json');
        sauceConfig.username = secrets.sauce_name;
        sauceConfig.key = secrets.sauce_key;
    } catch (e) {
        // swallow for build server
    }

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
                version: '3.11'
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
                        'widgets/tests/jasmineAMDErrorChecking.js',
                        'widgets/tests/jsReporterSanitizer.js'
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
        'saucelabs-jasmine': {
            all: {
                options: sauceConfig
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
                'jasmine:main:build',
                'amdcheck',
                'jshint'
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
        'jshint',
        'connect',
        'jasmine:main:build',
        'watch'
    ]);

    grunt.registerTask('sauce', [
        'jasmine:main:build',
        'connect',
        'saucelabs-jasmine'
    ]);

    grunt.registerTask('travis', [
        'if-missing:esri_slurp:travis',
        'jshint',
        'sauce'
    ]);
};