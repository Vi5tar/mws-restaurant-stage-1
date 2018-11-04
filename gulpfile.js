let gulp = require('gulp')
let imageResize = require('gulp-image-resize')
let rename = require('gulp-rename')
let concat = require('gulp-concat')
let uglify = require('gulp-uglify-es').default
let cleanCSS = require('gulp-clean-css')

//creates a blurry version of jpgs.
gulp.task('blur-image', () => {
  return gulp.src('img/*.jpg')
    .pipe(imageResize({
      width: 50,
      quality: 0
    }))
    .pipe(imageResize( {
      width: 800,
      height: 600,
      quality: 0,
      upscale: true,
      crop: true
    }))
    .pipe(rename((path) => { path.basename += '-blurry' }))
    .pipe(gulp.dest('dist/img'))
})

//moves html files to dist folder
gulp.task('copy-html', () => {
  return gulp.src('./*.html')
    .pipe(gulp.dest('./dist'))
})

//moves images to dist folder
gulp.task('copy-images', () => {
  return gulp.src('img/*')
    .pipe(gulp.dest('dist/img'))
})

//moves sw assets to dist folder
gulp.task('copy-sw', () => {
  return gulp.src(['./sw.js', './manifest.json'])
    .pipe(gulp.dest('./dist'))
})

//watches files for changes
gulp.task('watch', () => {
  gulp.watch('./*.html', gulp.parallel('copy-html'))
  gulp.watch(['./sw.js', './manifest.json'], gulp.parallel('copy-sw'))
  gulp.watch('css/**/*.css', gulp.parallel('css'))
  gulp.watch('js/**/*.js', gulp.series('scripts', 'scripts-restaurant'))
})

//concat index js
gulp.task('scripts', () => {
  return gulp.src(['js/main.js', 'js/dbhelper.js', 'js/idb-keyval/dist/idb-keyval-iife.js'])
    .pipe(concat('all1.js'))
    .pipe(gulp.dest('dist/js'))
})

//concat restaurant js
gulp.task('scripts-restaurant', () => {
  return gulp.src(['js/restaurant_info.js', 'js/dbhelper.js', 'js/idb-keyval/dist/idb-keyval-iife.js'])
    .pipe(concat('all2.js'))
    .pipe(gulp.dest('dist/js'))
})

//concat and minify index js for production build
gulp.task('scripts-dist', () => {
  return gulp.src(['js/main.js', 'js/dbhelper.js', 'js/idb-keyval/dist/idb-keyval-iife.js'])
    .pipe(concat('all1.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
})

//concat and minify restaurant js
gulp.task('scripts-restaurant-dist', () => {
  return gulp.src(['js/restaurant_info.js', 'js/dbhelper.js', 'js/idb-keyval/dist/idb-keyval-iife.js'])
    .pipe(concat('all2.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
})

//minify css
gulp.task('css', () => {
  return gulp.src('css/**/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'))
})

//default tasks
gulp.task('default', gulp.series('copy-html', 'copy-images', 'copy-sw', 'scripts', 'scripts-restaurant', 'css', 'watch' ))
