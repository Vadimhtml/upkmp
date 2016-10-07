var gulp = require('gulp'),
    gulpMyth = require('gulp-myth'),
    gulpUglify = require('gulp-uglify'),
    gulpConcat = require('gulp-concat'),
    gulpPug = require('gulp-pug'),
    gulpStylus = require('gulp-stylus'),
    gulpHtmlmin = require('gulp-htmlmin'),
    buildPath = './build',
    realFavicon = require ('gulp-real-favicon'),
    fs = require('fs'),
    FAVICON_DATA_FILE = 'faviconData.json';;

function wrapPipe(taskFn) {
    return function (done) {
        var onSuccess = function () {
            done();
        };
        var onError = function (err) {
            done(err);
        };
        var outStream = taskFn(onSuccess, onError);
        if (outStream && typeof outStream.on === 'function') {
            outStream.on('end', onSuccess);
        }
    }
}

gulp.task('default', ['styl', 'pug', 'assets'], function (cb) {
    cb();
});

gulp.task('watch', ['default'], function () {
    gulp.watch('./src/**/*.styl', ['styl']);
    gulp.watch('./src/**/*.pug', ['pug']);
    // gulp.watch('./src/**/*.js', ['js']);
    // gulp.watch(['./src/**/*.jpg', './src/**/*.png', './src/**/*.gif'], ['assets']);
});

gulp.task('styl', wrapPipe(function (success, error) {
    return gulp.src('./src/**/*.styl')
        .pipe(gulpStylus().on('error', error))
        .pipe(gulpMyth({compress: true}).on('error', error))
        .pipe(gulp.dest(buildPath));
}));

gulp.task('pug', wrapPipe(function (success, error) {
    return gulp.src('./src/**/*.pug')
        .pipe(gulpPug().on('error', error))
        .pipe(gulp.dest(buildPath));
}));

// gulp.task('js', wrapPipe(function (success, error) {
//     return gulp.src(['./node_modules/jquery/dist/jquery.min.js', './src/**/*.js'])
//         .pipe(gulpConcat('index.js').on('error', error))
//         .pipe(gulpUglify().on('error', error))
//         .pipe(gulp.dest(buildPath));
// }));

gulp.task('assets', wrapPipe(function (success, error) {
    return gulp.src(['./src/**/*.jpg', './src/**/*.png', './src/**/*.gif', './src/**/*.svg'])
        .pipe(gulp.dest(buildPath));
}));

gulp.task('generate-favicon', ['default'], function(done) {
    realFavicon.generateFavicon({
        masterPicture: 'src/Header__Logo.svg',
        dest: buildPath,
        iconsPath: '/',
        design: {
            ios: {
                pictureAspect: 'backgroundAndMargin',
                backgroundColor: '#4477cc',
                margin: '14%',
                assets: {
                    ios6AndPriorIcons: false,
                    ios7AndLaterIcons: false,
                    precomposedIcons: false,
                    declareOnlyDefaultIcon: true
                }
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#2d89ef',
                onConflict: 'override',
                assets: {
                    windows80Ie10Tile: false,
                    windows10Ie11EdgeTiles: {
                        small: false,
                        medium: true,
                        big: false,
                        rectangle: false
                    }
                }
            },
            androidChrome: {
                pictureAspect: 'backgroundAndMargin',
                margin: '17%',
                backgroundColor: '#4477cc',
                themeColor: '#ffffff',
                manifest: {
                    name: 'Сайт УПК-МП',
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                },
                assets: {
                    legacyIcon: false,
                    lowResolutionIcons: false
                }
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#4477cc'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

gulp.task('assemble', ['generate-favicon'], function() {
    gulp.src([ './build/**/*.html' ])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulpHtmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(buildPath));
});