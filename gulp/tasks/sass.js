"use strict";

const
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    gutil = require('gulp-util'),
    postcss = require('gulp-postcss');

//sass
gulp.task('sass', function() {
    return gulp.src('src/sass/app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['node_modules', 'node_modules/bootstrap-sass/assets/stylesheets','node_modules/slick-carousel/slick', 'node_modules/susy/sass']
        }).on('error', function(err) {
            gutil.log(gutil.colors.red(err.message));
            this.emit('end');
        }))
        .pipe(postcss([autoprefixer({
            browsers: ['last 2 versions', 'IOS 7']
        })]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src/css'));
});

