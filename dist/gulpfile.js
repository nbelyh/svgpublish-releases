const { src, dest } = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
const eslint = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');

exports.default = function() {
  return src('vp-script/*.js')
    .pipe(sourcemaps.init())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
	.pipe(concat('vp-script-111.111.111.js'))
    .pipe(dest('.'))
    .pipe(uglify())
	.pipe(rename('vp-script-111.111.111.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('.'));
}
