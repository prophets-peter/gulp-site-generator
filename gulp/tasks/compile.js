"use strict";

var gulp = require("gulp"),
    Promise = require("bluebird"),
    compileRss = require("../lib/compile-rss"),
    compileHome = require("../lib/compile-home"),
    compilePages = require("../lib/compile-pages"),
    compileTags = require("../lib/compile-tags"),
    compileDates = require("../lib/compile-dates"),
    removeDir = require("../lib/remove-dir");

gulp.task("compile", ["content"], function (done) {
    var compilePromises = [];

    // pages
    compilePromises.push(new Promise(compilePages));

    // tags
    compilePromises.push(new Promise(compileTags));

    // dates
    compilePromises.push(new Promise(compileDates));

    // rss feed compilation
    compilePromises.push(new Promise(compileRss));

    // index page generation
    compilePromises.push(new Promise(compileHome));

    Promise.all(compilePromises)
        .then(function () {
            removeDir("./build/content");
            done();
        }, function () {
            // call done even if there are errors
            done();
        });
});

