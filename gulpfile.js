let gulp = require('gulp')
let imageResize = require('gulp-image-resize')
let rename = require('gulp-rename')
let concat = require('gulp-concat')
let uglify = require('gulp-uglify-es').default
let cleanCSS = require('gulp-clean-css')

//reduces image quality to lowest quality
gulp.task('gulp-image-resize', () => {
  return gulp.src('images/*.jpg')
    .pipe(imageResize({
      quality: 0
    }))
    .pipe(rename((path) => { path.basename += '-low-quality' }))
    .pipe(gulp.dest('dist/images'))
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
  gulp.watch('js/**/*.js', gulp.parallel('scripts'))
})

//concat js
gulp.task('scripts', () => {
  return gulp.src('js/**/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'))
})

//concat and minify js for production build
gulp.task('scripts-dist', () => {
  return gulp.src('js/**/*.js')
    .pipe(concat('all.js'))
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
gulp.task('default', gulp.series('copy-html', 'copy-images', 'copy-sw', 'scripts', 'css', 'watch' ))
