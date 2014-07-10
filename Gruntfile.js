/* globals module */

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                   '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                   '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                   '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                   ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            core: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'public/js/core.js.map'
                },
                files: {
                    'public/js/core.min.js': [
                        'bower_modules/modernizr/modernizr.js',
                        'bower_modules/jquery/jquery.js',
                    ]
                }
            },
            site: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'public/js/site.js.map'
                },
                files: {
                    'public/js/site.min.js': [
                        'src/js/plugins/*.js',
                        'bower_modules/bootstrap/bootstrap.js',
                        'src/js/app/landing-page.js',
                        'src/js/app/chart.js'
                    ]
                }
            },
            application: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'public/js/application.js.map'
                },
                files: {
                    'public/js/application.min.js': [
                        'bower_modules/handlebars/handlebars.runtime.js',
                        'bower_modules/ember/ember.js',
                        'src/js/app.js',
                        'src/js/views/dashboard.js',
                    ]
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true,
                    require: true,
                    module: true,
                    process: true,
                    console: true,
                    Ember: true
                }
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: [
                    'src/js/*.js',
                    'server.js',
                    'app/routes/*.js',
                    'app/config/*.js',
                    'tests/**/*.js'
                ]
            }
        },
        less: {
            production: {
                options: {
                    cleancss: true,
                    compress: true,
                },
                files: {
                    'public/css/main.min.css': ['.less_compile/bootstrap.less'],
                    'public/css/site.min.css': ['.less_compile/site.less'],
                    'public/css/admin.min.css': ['.less_compile/admin.less']
                }
            }
        },
        autoprefixer: {
            dist: {
                options: {
                    browsers: ['last 2 versions', '> 10%', 'ie 8']
                },
                files: {
                    'public/css/main.min.css': ['public/css/main.min.css'],
                    'public/css/site.min.css': ['public/css/site.min.css'],
                    'public/css/admin.min.css': ['public/css/admin.min.css']
                }
            }
        },
        copy: {
            imgs: {
                expand: true,
                cwd: 'src/img/',
                src: '**',
                dest: 'public/img'
            },
            fontawesome: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_modules/fontawesome/fonts/',
                        src: '*',
                        dest: 'public/fonts'
                    },
                    {
                        expand: true,
                        cwd: 'bower_modules/fontawesome/less/',
                        src: '*',
                        dest: '.less_compile/font-awesome/'
                    },
                ]
            },
            bootstrapLess: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_modules/bootstrap/',
                        src: '*.less',
                        dest: '.less_compile'
                    },
                    {
                        expand: true,
                        cwd: 'src/less/',
                        src: '**',
                        dest: '.less_compile'
                    }
                ]
            }

        },
        bower: {
            install: {
                options: {
                    install: true,
                    cleanup: true,
                    verbose: false,
                    targetDir: './bower_modules'
                }
            }
        },
        mochacli: {
            files: 'tests/',
            options: {
                reporter: 'spec',
                recursive: true,
                env: {
                    NODE_ENV: "test",
                    MONGO_URI: "mongodb://test:test123@ds053778.mongolab.com:53778/umrum-test",
                    NODE_PORT: "8000",
                    NODE_IP: "0.0.0.0",
                    GITHUB_ID: "SOME_GITHUB_ID",
                    GITHUB_SECRET: "SOME_GITHU_SECRET",
                    GITHUB_CALLBACK: "http://localhost:8000/auth/github/callback"
                }
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test']
            },
            less: {
                files: ['src/less/*.less'],
                tasks: ['mincss'],
            },
            js: {
                files: ['src/js/**/*.js'],
                tasks: ['minjs']
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    ext: '*',
                    watch: ['app', 'src'],
                    env: {
                        NODE_ENV: "dev",
                        MONGO_URI: "mongodb://test:test123@ds053778.mongolab.com:53778/umrum-test",
                        NODE_PORT: "8000",
                        NODE_IP: "0.0.0.0",
                        GITHUB_ID: "50e4a60802b87028b98f",
                        GITHUB_SECRET: "59a86c98576017e0fe9d56b667f5748368595b7d",
                        GITHUB_CALLBACK: "http://localhost:8000/auth/github/callback"
                    },
                    callback: function (nodemon) {
                        nodemon.on('log', function (e) {
                            grunt.log.writeln(e.colour);
                        });

                        nodemon.on('restart', function () {
                            grunt.log.subhead('Running compile task ... ');
                            grunt.util.spawn({
                                grunt: true,
                                args: ['_compile'],
                            }, function(err, result) {
                                grunt.log.debug(result.toString());
                                if (err || result.code !== 0) {
                                    grunt.log.write('Error while compiling')
                                             .error()
                                             .error(err);
                                }
                                grunt.log.subhead('Compile task: \u001b[32mOK');
                            });
                        });
                    }
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-bower-installer');

    // private tasks
    grunt.registerTask('_minjs', ['uglify']);
    grunt.registerTask('_lessc', ['copy:bootstrapLess', 'less', 'autoprefixer']);
    grunt.registerTask('_compile', ['copy-static', '_lessc', '_minjs']);

    grunt.registerTask('minjs', ['bower:install', '_minjs']);
    grunt.registerTask('mincss', ['bower:install', '_lessc']);
    grunt.registerTask('copy-static', ['copy:imgs', 'copy:fontawesome']);

    grunt.registerTask('compile', ['bower:install', '_compile']);

    grunt.registerTask('unittest', ['jshint', 'mochacli']);

    grunt.registerTask('server', ['compile', 'nodemon:dev']);
};
