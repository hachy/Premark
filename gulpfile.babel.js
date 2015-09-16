import gulp from 'gulp'
import babel from 'gulp-babel'

gulp.task('es6', () => {
  return gulp.src('src/*.js')
  .pipe(babel())
  .pipe(gulp.dest('dist'))
})

gulp.task('copy', () => {
  return gulp.src([
    'src/*.html',
    'src/*.css'
  ])
  .pipe(gulp.dest('dist'))
})

gulp.task('default', ['es6', 'copy'])

gulp.task('watch', () => {
  gulp.watch('src/*', ['default'])
})
