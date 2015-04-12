// gulpfile
var autoprefixer = require('gulp-autoprefixer');
var browserify   = require('browserify');
var browserSync  = require('browser-sync');
var gulp         = require('gulp');
var less         = require('gulp-less');
var source       = require('vinyl-source-stream');
var sourcemaps   = require('gulp-sourcemaps');
var watchify     = require('watchify');

var config       = require('./client/config');
var bundleLogger = require('./client/utils/bundleLogger');
var handleErrors = require('./client/utils/handleErrors');


gulp.task('watch', ['setWatch', 'browserSync'], function() {
  gulp.watch(config.less.watch, ['less']);
  gulp.watch(config.markup.src, ['markup']);
});

gulp.task('svgs', function() {
  return gulp.src(config.svgs.src)
    .pipe(gulp.dest(config.svgs.dest));
});

gulp.task('setWatch', function() {
  global.isWatching = true;
});

gulp.task('markup', function() {
  return gulp.src(config.markup.src)
    .pipe(gulp.dest(config.markup.dest));
});

gulp.task('less', function() {
  return gulp.src(config.less.src)
    .pipe(sourcemaps.init())
    .pipe(less())
    .on('error', handleErrors)
    .pipe(autoprefixer({cascade: false, browsers: ['last 2 versions']}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.less.dest));
});

gulp.task('browserSync', ['build'], function() {
  browserSync(config.browserSync);
});

gulp.task('build', ['browserify', 'markup', 'less']);

gulp.task('default', ['watch']);

gulp.task('browserify', function(callback) {

  var bundleQueue = config.browserify.bundleConfigs.length;

  var browserifyThis = function(bundleConfig) {

    var bundler = browserify({
      // Required watchify args
      cache: {}, packageCache: {}, fullPaths: false,
      // Specify the entry point of your app
      entries: bundleConfig.entries,
      // Add file extentions to make optional in your requires
      extensions: config.extensions,
    });

    var bundle = function() {
      // Log when bundling starts
      bundleLogger.start(bundleConfig.outputName);

      return bundler
        .bundle()
        // Report compile errors
        .on('error', handleErrors)
        // Use vinyl-source-stream to make the
        // stream gulp compatible. Specifiy the
        // desired output filename here.
        .pipe(source(bundleConfig.outputName))
        // Specify the output destination
        .pipe(gulp.dest(bundleConfig.dest))
        .on('end', reportFinished);
    };

    if(global.isWatching) {
      // Wrap with watchify and rebundle on changes
      bundler = watchify(bundler);
      // Rebundle on update
      bundler.on('update', bundle);
    }

    var reportFinished = function() {
      // Log when bundling completes
      bundleLogger.end(bundleConfig.outputName);

      if(bundleQueue) {
        bundleQueue--;
        if(bundleQueue === 0) {
          // If queue is empty, tell gulp the task is complete.
          // https://github.com/gulpjs/gulp/blob/master/docs/API.md#accept-a-callback
          callback();
        }
      }
    };

    return bundle();
  };
  // Start bundling with Browserify for each bundleConfig specified
  config.browserify.bundleConfigs.forEach(browserifyThis);
});
