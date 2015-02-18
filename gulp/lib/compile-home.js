(function () {
    "use strict";

    var gulp = require("gulp"),
        Promise = require('bluebird'),
        compileHandlebars = require("gulp-compile-handlebars"),
        rename = require("gulp-rename"),
        fs = require("fs"),
        path = require("path"),
        glob = require("globby"),
        moment = require("moment"),
        compileOptions = require("../lib/compile-options"),
        tags = require("../lib/tags"),
        resolvePaths = require("../lib/paths"),
        compileDrafts = require('../lib/drafts');

    module.exports.run = function(rootPath, done, error) {
        var siteData = JSON.parse(fs.readFileSync(rootPath + "/site.json", "utf8"));
        var gulpVersion = require("gulp/package").version;

        glob([rootPath + "/build/content/pages/*.json", rootPath + "/build/content/posts/*.json"], { cwd: rootPath }, function(err, files) {
            if (err) {
                error(err);
            } else {
                var posts = [];

                files.forEach(function(file) {
                    var fileData = JSON.parse(fs.readFileSync(file, "utf8"));

                    if (fileData.status && fileData.status === "draft" && !compileDrafts()) {
                        return;
                    }

                    var metaData = {
                        title: fileData.title,
                        description: resolvePaths.resolve(fileData.body, "."),
                        url: "./" + fileData.slug + "/",
                        tags: (fileData.tags ? tags.getTagsAsLinks(".", fileData.tags) : undefined),
                        date: fileData.date,
                        post_class: "post " + (/\/pages\//.test(file) ? 'page ' : '') + (fileData.tags ? tags.getTagClasses(fileData.tags) : fileData.slug),
                        meta: fileData
                    };

                    posts.push(metaData);
                });

                if (posts.length) {
                    posts.sort(function(a, b) {
                        return new Date(a.date).getTime() < new Date(b.date).getTime();
                    });

                    var templateData = {
                        date: moment().format("YYYY-MM-DD"),
                        resourcePath: ".",
                        generator: "Gulp " + gulpVersion,
                        meta_title: siteData.title,
                        url: ".",
                        site: siteData,
                        posts: posts,
                        body_class: "home-template",
                        rss: "." + siteData.rss
                    };

                    var promises = [];

                    if (siteData.maxItems && posts.length > siteData.maxItems) {
                        // how many pages do we need to create?
                        var totalPages = Math.ceil(posts.length / siteData.maxItems);

                        // shorten posts
                        var paginatedPosts = posts.splice(siteData.maxItems);

                        for (var i = 1; i < totalPages; i++) {
                            var pageNumber = i + 1;
                            var nextPosts = paginatedPosts.splice(0, siteData.maxItems);
                            promises.push(new Promise(function(resolve, reject) {
                                gulp.src(rootPath + "/src/templates/partials/loop.hbs")
                                    .pipe(compileHandlebars({ posts: nextPosts }, compileOptions(rootPath)))
                                    .pipe(rename("index.html"))
                                    .pipe(gulp.dest(rootPath + "/build/pagination/index/" + pageNumber))
                                    .on("error", reject)
                                    .on("end", function() {
                                        resolve();
                                    });
                            }));
                        }

                        // update template
                        templateData.nextUrl = './pagination/index';
                        templateData.totalPages = totalPages;
                    }

                    promises.push(new Promise(function(resolve, reject) {
                        gulp.src(rootPath + "/src/templates/index.hbs")
                            .pipe(compileHandlebars(templateData, compileOptions(rootPath)))
                            .pipe(rename("index.html"))
                            .pipe(gulp.dest(rootPath + "/build"))
                            .on("error", reject)
                            .on("end", resolve);
                    }));

                    Promise.all(promises)
                        .then(function () {
                            done();
                        }, function(err) {
                            error(err);
                        });
                } else {
                    done();
                }
            }
        });
    };
})();