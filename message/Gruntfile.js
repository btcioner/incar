/**
 * Created by LM on 14-4-15.
 */
module.exports = function(grunt) {
    grunt.initConfig({
        //从文件 package.json 文件中读取项目的配置，并存储到 pkg 属性中。
        //这样我们可以通过 pkg 属性来引用 package.json 文件中的配置
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('default', ['jshint']);
};