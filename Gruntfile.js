module.exports = function(grunt) {

  grunt.initConfig({
    eslint: {
      target: [
        'gulpfile.js',
        '.eslintrc.js',
        'backend/**/*.js'
      ]
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['eslint']);
};
