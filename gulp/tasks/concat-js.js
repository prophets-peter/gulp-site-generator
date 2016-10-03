"use strict";

const
    gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    eslint = require('gulp-eslint');

gulp.task('concat-js', function() {
    const b = browserify({
        entries: 'src/js/app.js',
        debug: true
    }).transform('babelify', {presets: ['es2015', 'stage-2']});

    return b.bundle()
        .on('error', function(err) {
            gutil.log(gutil.colors.red(err.message));
            this.emit('end');
        })
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        // Add transformation tasks to the pipeline here.
        //.pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build/js/'));
});

gulp.task('eslint', function() {
    return gulp.src(['./src/js/**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
