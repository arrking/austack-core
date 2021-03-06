'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

var analytics = 'e69238dd29a746cb5cd3e0e99c0a3f4d';

module.exports = function (options) {
  gulp.task('partials', function () {
    return gulp.src([
        options.src + '/app/**/*.html',
        options.tmp + '/serve/app/**/*.html'
      ])
      .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
      .pipe($.angularTemplatecache('templateCacheHtml.js', {
        module: 'austackApp',
        root: 'app'
      }))
      .pipe(gulp.dest(options.tmp + '/partials/'));
  });

  gulp.task('html', ['inject', 'partials'], function () {
    var partialsInjectFile = gulp.src(options.tmp + '/partials/templateCacheHtml.js', {
      read: false
    });
    var partialsInjectOptions = {
      starttag: '<!-- inject:partials -->',
      ignorePath: options.tmp + '/partials',
      addRootSlash: false
    };

    var htmlFilter = $.filter('*.html');
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets;

    return gulp.src(options.tmp + '/serve/*.html')
      .pipe($.inject(partialsInjectFile, partialsInjectOptions))
      .pipe(assets = $.useref.assets())
      .pipe($.rev())
      .pipe(jsFilter)
      .pipe($.ngAnnotate())
      .pipe($.uglify({
        preserveComments: $.uglifySaveLicense
      })).on('error', options.errorHandler('Uglify'))
      .pipe(jsFilter.restore())
      .pipe(cssFilter)
      .pipe($.csso())
      .pipe(cssFilter.restore())
      .pipe(assets.restore())
      .pipe($.useref())
      .pipe($.revReplace())
      .pipe(htmlFilter)
      .pipe($.replace('<!-- analytics -->', analytics))
      .pipe($.minifyInline())
      .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true,
        conditionals: true
      }))
      .pipe(htmlFilter.restore())
      .pipe(gulp.dest(options.dist + '/'))
      .pipe($.size({
        title: options.dist + '/',
        showFiles: true
      }));
  });

  // Only applies for fonts from bower dependencies
  // Custom fonts are handled by the "other" task
  gulp.task('fonts', function () {
    return gulp.src($.mainBowerFiles())
      .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
      .pipe($.flatten())
      .pipe(gulp.dest(options.dist + '/fonts/'));
  });

  gulp.task('icons', function () {
    return gulp.src('bower_components/material-design-icons/sprites/**/*')
      .pipe($.filter('**/*.svg'))
      .pipe(gulp.dest(options.dist + '/assets/'));
  });

  gulp.task('socket', function () {
    return gulp.src('node_modules/socket.io-client/**/*')
      .pipe(gulp.dest(options.dist + '/socket.io-client'));
  });

  gulp.task('other', function () {
    return gulp.src([
        options.src + '/**/*',
        '!' + options.src + '/app',
        '!' + options.src + '/app/**/*',
        '!' + options.src + '/**/*.{html,css,js,scss}'
      ])
      .pipe(gulp.dest(options.dist + '/'));
  });

  gulp.task('clean', function (done) {
    $.del([options.dist + '/', options.tmp + '/'], done);
  });

  gulp.task('build', ['config', 'html', 'fonts', 'icons', 'other', 'socket']);
};
