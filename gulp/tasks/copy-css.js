"use strict";

var gulp = require("gulp"),
    fs = require("fs"),
    minifyCSS = require("gulp-minify-css");

gulp.task("copy-css", function () {
    var siteData = JSON.parse(fs.readFileSync("./site.json", "utf8"));
    var styleSheet = "app.css";
    if (siteData.styleSheet) {
        styleSheet = siteData.styleSheet;
    }
    return gulp.src(["./src/css/**/*.css", "!./src/css/**/" + styleSheet])
        .pipe(minifyCSS())
        .pipe(gulp.dest("./build/css"));
});
