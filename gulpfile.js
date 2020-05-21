const { series, parallel, src, dest } = require('gulp');
const stripDebug = require('gulp-strip-debug');
const strip = require('gulp-strip-comments');
const mergeStream =   require('merge-stream');
 
function cleanServerCode(cb) {
    mergeStream(
    src('src/node/**/*.js')
        .pipe(stripDebug())
        .pipe(strip())
        .pipe(dest('server/'))
    );
    cb();
}

function copyAllButJSAngular(cb) {
    src(['src/angular/**/*.*', '!src/angular/**/*.js'])
    // src('src/angular/**/*.*')
    .pipe(dest('public/'));
    cb();
}

function cleanAngularCode(cb) {
    mergeStream(
    src('src/angular/js/*.js')
        .pipe(stripDebug())
        .pipe(strip())
        .pipe(dest('public/js'))
    );
    cb();
}
exports.build = series(cleanServerCode, copyAllButJSAngular, cleanAngularCode);
exports.default = exports.build;