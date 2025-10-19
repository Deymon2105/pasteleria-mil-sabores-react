// Configuración de Karma (karma.conf.js)
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'test/**/*.spec.js'
    ],
    browsers: ['PhantomJS'],
    singleRun: true,
    preprocessors: {},
    reporters: ['progress', 'dots'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    concurrency: Infinity
  });
};
