'use strict'

const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const babel = require('gulp-babel')

const SRC = 'src/**/*.*'
const DEST = 'build'
const FINAL = 'main.js'

gulp.task('babel', function () {
  return gulp.src(SRC)
    .pipe(babel({
            presets: ['env']
          }))
    .pipe(gulp.dest(DEST))
})

gulp.task('nodemon', ['babel'], function () {
  nodemon({script: DEST + '/' + FINAL})
})

gulp.task('watch', function () {
  gulp.watch(SRC, ['babel'])
})

gulp.task('default', ['nodemon', 'watch'])