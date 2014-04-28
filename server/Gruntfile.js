/**
 * Created by LM on 14-4-15.
 */
'use strict';
module.exports = function(grunt) {
    grunt.initConfig({
        //从文件 package.json 文件中读取项目的配置，并存储到 pkg 属性中。
        //这样我们可以通过 pkg 属性来引用 package.json 文件中的配置
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['*.js','config/*.js','src/**/*.js'],
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint']);
};