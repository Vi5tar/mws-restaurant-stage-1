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

//watches files for changes
gulp.task('watch', () => {
  return gulp.watch('/*.html', ['copy-html'])
})

//concat and minify js
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
gulp.task('default', gulp.parallel('copy-html', 'copy-images', ))
