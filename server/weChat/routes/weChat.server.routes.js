'use strict';

module.exports = function (app) {
  // Root routing
  var weChatController = require('../controllers/weChat.server.controller');

 /* // Define error pages
  app.route('/server-error').get(weChatController.renderServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/!*').get(weChatController.renderNotFound);*/

  // Define application route
  //app.route('/weChat/companyIntroduction').get(weChatController.companyIntroduction);
  app.route('/homePage').get(weChatController.homePage);
  app.route('/weChat/companyIndex').get(weChatController.companyIndex);
  app.route('/weChat/company/:segmentType').get(weChatController.companyIntroduction);
};