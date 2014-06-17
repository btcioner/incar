// Generated on 2014-01-17 using generator-angular-fullstack 1.2.4
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      appMsite: 'msite',
      appWsite: 'wsite',
      dist: 'dist',
      distMsite: 'dist/msite',
      distWsite: 'dist/wsite'
    },
    express: {
      options: {
        port: process.env.PORT || 80
      },
      dev: {
        options: {
          script: 'server.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'dist/server.js',
          node_env: 'production'
        }
      }
    },

    typescript: {
      wservice_motor: {
        src: ['wservice/motor/**/*.ts'],
        dest: 'wservice/motor.js',
        options: {
          module: 'commonjs',
          sourceMap: true,
          basePath: "motor/",
          comments: true,
          target: "ES5"
        }
      },
      msite_wxapp:{
        src: ['msite/mscripts/wxapp/*.ts'],
        dest: 'msite/mscripts/wxapp.js',
        options: {
            module: 'commonjs',
            sourceMap: true,
            basePath: "wxapp/",
            comments: true,
            target: "ES5"
        }
      }
    },

    less:{
        options:{
            paths: ['msite/mstyles']
        },
        msite_bootstrap : {
            files: { 'msite/mstyles/bootstrap.css': 'msite/mstyles/bootstrap.less' }
        }
    },

    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    watch: {
      js: {
        files: ['<%= yeoman.appMsite %>/mscripts/{,*/}*.js', '<%= yeoman.appWsite %>/js/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      styles: {
        files: ['<%= yeoman.appMsite %>/mstyles/{,*/}*.css', '<%= yeoman.appWsite %>/css/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '<%= yeoman.appMsite %>/mviews/{,*//*}*.{html,jade}',
          '<%= yeoman.appWsite %>/{,*//*}*.{html,jade}',
          '{.tmp/msite,<%= yeoman.appMsite %>}/mstyles/{,*//*}*.css',
          '{.tmp/wsite,<%= yeoman.appWsite %>}/css/{,*//*}*.css',
          '{.tmp/msite,<%= yeoman.appMsite %>}/mscripts/{,*//*}*.js',
          '{.tmp/wsite,<%= yeoman.appWsite %>}/js/{,*//*}*.js',
          '<%= yeoman.appMsite %>/mimages/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.appWsite %>/img/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
      
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server.js',
          'api/**/*.{js,json}',
          'config/**/*.{js,json}',
          'mservice/**/*.{js,json}',
          'wservice/**/*.{js,json}'
        ],
        tasks: ['newer:jshint:server', 'express:dev'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      server: {
        options: {
          jshintrc: '.svr.jshintrc'
        },
        src: [ 'api/{,*/}*.js',
            'config/{,*/}*.js',
            'core/{,*/}*.js',
            'mservice/{,*/}*.js', '!mservice/html/{,*/}*.js',
            'wservice/{,*/}*.js', '!wservice/motor.js']
      },
      sites: [
      //  '<%= yeoman.appMsite %>/mscripts/{,*/}*.js'
      //  , '<%= yeoman.appWsite %>/js/{,*/}*.js'
      ]
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/api/*',
            '<%= yeoman.dist %>/config/*',
            '<%= yeoman.dist %>/mservice/*',
            '<%= yeoman.dist %>/wservice/*',
            '<%= yeoman.distMsite %>/mviews/*',
            '<%= yeoman.distMsite %>/mscripts/*',
            '<%= yeoman.distMsite %>/mstyles/*',
            '<%= yeoman.distMsite %>/mimages/*',
            '<%= yeoman.distWsite %>/*',
            '<%= yeoman.distWsite %>/js/*',
            '<%= yeoman.distWsite %>/css/*',
            '<%= yeoman.distWsite %>/img/*',
            '!<%= yeoman.dist %>/.git*',
          ]
        }]
      },
      tmp: '.tmp',
      typescript: [
//        'wservice/{,*/}*.js',
//        'wservice/{,*/}*.js.map'
        'wservice/motor.js',
        'wservice/motor.js.map',
        'msite/mscripts/wxapp.js',
        'msite/mscripts/wxapp.js.map'
      ],
      less: [ 'msite/mstyles/bootstrap.css']
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    'bowerInstall': {
      target: {
        src: ['<%= yeoman.appMsite %>/mviews/*.html'
          , '<%= yeoman.appWsite %>/{,*/}*.html'],
        ignorePath: ['<%= yeoman.appMsite %>/', '<%= yeoman.appWsite %>/']
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.distMsite %>/mscripts/{,*/}*.js',
            '<%= yeoman.distMsite %>/mstyles/{,*/}*.css',
            '<%= yeoman.distMsite %>/mimages/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.distMsite %>/mstyles/fonts/*',
            '<%= yeoman.distWsite %>/js/{,*/}*.js',
            '<%= yeoman.distWsite %>/css/{,*/}*.css',
            '<%= yeoman.distWsite %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.distWsite %>/css/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      msite: {
        html: ['<%= yeoman.appMsite %>/mviews/{,*/}*.html'],
        options: {
          dest: '<%= yeoman.distMsite %>/mview'
        }
      },
      wsite: {
          html: ['<%= yeoman.appWsite %>/{,*/}*.html'],
          options: {
            dest: '<%= yeoman.distWsite %>'
          }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.distMsite %>/mviews/{,*/}*.html', '<%= yeoman.distWsite %>/{,*/}*.html'],
      css: ['<%= yeoman.distMsite %>/mstyles/{,*/}*.css', '<%= yeoman.distWsite %>/css/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.distMsite %>', '<%= yeoman.distWsite %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.appMsite %>/mimages',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.distMsite %>/mimages'
        },{
          expand: true,
          cwd: '<%= yeoman.appWsite %>/img',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.distWsite %>/img'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.appMsite %>/mimages',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.distMsite %>/mimages'
        }, {
            expand: true,
            cwd: '<%= yeoman.appWsite %>/img',
            src: '{,*/}*.svg',
            dest: '<%= yeoman.distWsite %>/img'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          //collapseWhitespace: true,
          //collapseBooleanAttributes: true,
          //removeCommentsFromCDATA: true,
          //removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.appMsite %>/mviews',
          src: ['*.html', 'mpartials/*.html'],
          dest: '<%= yeoman.distMsite %>/mviews'
        }, {
          expand: true,
          cwd: '<%= yeoman.appWsite %>',
          src: ['{,*/}*.html', '{,*/}partials/*.html'],
          dest: '<%= yeoman.distWsite %>'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.distMsite %>/mviews/*.html', '<%= yeoman.distWsite %>/{,*/}*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.appMsite %>',
          dest: '<%= yeoman.distMsite %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'components/**/*',
            'mimages/{,*/}*.{webp}',
            'mstyles/fonts/**/*'
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '<%= yeoman.appMsite %>/mviews',
          dest: '<%= yeoman.distMsite %>/mviews',
          src: ['**/*.jade', '**/*.html']
        }, {
          expand: true,
          cwd: '.tmp/msite/images',
          dest: '<%= yeoman.distMsite %>/mimages',
          src: ['generated/*']
        }, {
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server.js',
            'config/**/*',
            'mservice/**/*',
            'wservice/**/*',
            'api/**/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.appMsite %>/mstyles',
        dest: '.tmp/msite/mstyles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin'
      ]
    }

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css',
    //         '<%= yeoman.app %>/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'express:prod', 'open', 'express-keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'bowerInstall',
      'concurrent:server',
      'autoprefixer',
      'express:dev',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'bowerInstall',
    'useminPrepare',
    // 'concurrent:dist',
    'copy:styles',
    'imagemin',
    'svgmin',
    'htmlmin',

    'autoprefixer',
    // 'concat',
    'ngmin',
    'copy:dist',
    'cdnify',
    // 'cssmin',
    // 'uglify',
    'rev',
    'usemin',
    'typescript',
    'less'
  ]);

  grunt.registerTask('default', [
    'newer:jshint'
    ,'build'
  ]);

  grunt.loadNpmTasks('grunt-contrib-less');
};
