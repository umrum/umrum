/* globals module */

var PRODUCTION = process.env.NODE_ENV === 'production';

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
                banner: '<%= banner %>',
                screwIE8: true,
                sourceMap: false
            },
            core: {
                files: {
                    'public/js/core.min.js': [
                        'bower_modules/modernizr/modernizr.js',
                        'bower_modules/jquery/jquery.js',
                    ]
                }
            },
            site: {
                files: {
                    'public/js/site.min.js': [
                        'bower_modules/bootstrap/bootstrap.js',
                        'src/js/plugins/*.js',
                        'src/js/app/landing-page.js',
                        'src/js/app/chart.js'
                    ]
                }
            },
            application: {
                options: {
                    beautify: !PRODUCTION
                },
                files: {
                    'public/js/application.min.js': [
                        'bower_modules/react/react.min.js',
                        'compiled_jsx/components/*.js',
                    ]
                }
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            all: [
                'Gruntfile.js',
                'src/js/*.js',
                'server.js',
                'app/routes/*.js',
                'config/**/*.js',
                'tests/**/*.js'
            ]
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
        mochacli: {
            files: 'tests/',
            options: {
                reporter: 'spec',
                recursive: true,
                compilers: ['js:mocha-traceur'],
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
            fonts: {
                expand: true,
                cwd: 'bower_modules/fontawesome/fonts/',
                src: '*',
                dest: 'public/fonts'
            },
            bowerLess: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_modules/bootstrap/',
                        src: '*.less',
                        dest: '.less_compile'
                     },
                     {
                        expand: true,
                        cwd: 'bower_modules/fontawesome/less/',
                        src: '*',
                        dest: '.less_compile/font-awesome/'
                    }
                ]
            },
            srcLess: {
                expand: true,
                cwd: 'src/less/',
                src: '**',
                dest: '.less_compile'
            }
        },
        react: {
            compile: {
                files: [
                    {
                        expand: true,
                        cwd: 'app/src',
                        src: ['**/*.jsx'],
                        dest: 'compiled_jsx',
                        ext: '.js'
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
        watch: {
            less: {
                files: ['src/less/**'],
                tasks: ['_less'],
            },
            react: {
                files: ['app/src/**'],
                tasks: ['doReact'],
            },
            site: {
                files: ['src/js/**'],
                tasks: ['uglify:site'],
            },
        },
        concurrent: {
            server: {
                tasks: ['watch:less', 'watch:react', 'watch:site', 'nodemon:dev'],
                options: {
                    logConcurrentOutput: true
                }
            },
            build: {
                tasks: ['doLess', 'doReact', 'uglify:site']
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                watch: ['app'],
                ignore: ['app/src/**'],
                ext: '*'
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-bower-installer');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-concurrent');

    // private tasks
    grunt.registerTask('_less', ['copy:srcLess', 'less', 'autoprefixer']);
    grunt.registerTask('doLess', ['copy:bowerLess', '_less']);
    grunt.registerTask('doReact', ['react:compile', 'uglify:application']);


    grunt.registerTask('unittest', ['jshint', 'mochacli']);

    grunt.registerTask('install', ['bower:install', 'uglify:core', 'copy:imgs', 'copy:fonts']);
    grunt.registerTask('build', 'concurrent:build');

    grunt.registerTask('server', ['concurrent:server']);
};
