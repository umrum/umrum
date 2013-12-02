/* global module:false */

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
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        files: {
          'assets/js/init.js': ['src/js/libs/modernizr-2.6.3.js'],
          'assets/js/main.js': ['src/js/libs/jquery-1.10.2.js', 'src/js/plugins/*.js', 'src/js/app/bootstrap.js', 'src/js/app/landing-page.js', 'src/js/app/admin.js']
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        files: {
          'assets/js/init.min.js': ['assets/js/init.js'],
          'assets/js/main.min.js': ['assets/js/main.js'],
          'assets/js/chart.min.js': ['src/js/app/chart.js']
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
          jQuery: true
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
          // paths: ['src/css', '_static/assets/less'],
          cleancss: true
        },
        files: {
          'assets/css/main.css': ['src/less/bootstrap.less'],
          'assets/css/site.css': ['src/less/site.less'],
          'assets/css/admin.css': ['src/less/admin.less']
        }
      }
    },
    autoprefixer: {
      dist: {
        options: {
          browsers: ['last 2 versions', '> 10%', 'ie 8']
        },
        files: {
          'assets/css/main.css': ['assets/css/main.css'],
          'assets/css/site.css': ['assets/css/site.css'],
          'assets/css/admin.css': ['assets/css/admin.css']
        }
      }
    },
    csso: {
      dist: {
        files : {
          'assets/css/main.min.css': ['assets/css/main.css'],
          'assets/css/site.min.css': ['assets/css/site.css'],
          'assets/css/admin.min.css': ['assets/css/admin.css']
        }
      }
    },
    mochacli: {
      files: 'tests/',
      options: {
        reporter: 'spec',
        recursive: true,
        env: {
          NODE_PORT: '8000',
          MONGO_URI: 'mongodb://test:test123@ds053778.mongolab.com:53778/umrum-test'
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
        tasks: ['less', 'autoprefixer', 'csso'],
      },
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['minjs']
      }
    },
    nodemon: {
      dev: {
        options: {
          file: 'server.js',
          args: ['-e js,html'],
          env: {
            NODE_PORT: '8000',
            MONGO_URI: 'mongodb://test:test123@ds053778.mongolab.com:53778/umrum-test'
          }
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-csso');
  //grunt.loadNpmTasks('grunt-imageoptim');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-nodemon');

  // Default task.
  grunt.registerTask('default', ['jshint', 'mochacli', 'less', 'autoprefixer', 'csso', 'concat', 'uglify']);
  grunt.registerTask('minjs', ['jshint', 'concat', 'uglify']);
  grunt.registerTask('unittest', ['jshint', 'mochacli']);
  grunt.registerTask('server', ['nodemon']);
};
