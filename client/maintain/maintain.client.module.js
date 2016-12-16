(function (app) {
    'use strict';
    app.registerModule('maskerModule',[]);
    app.registerModule('backendMaintain', ['core', 'ui.bootstrap', 'ui.grid', 'ui.grid.pagination', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping', 'ng.ueditor', 'toaster', 'ui.select', 'ngCookies']);
    app.registerModule('companyIntroduction',[
        'ng.ueditor',
        'ngSanitize',
        'ngAnimate',
        'maskerModule'
    ]);
    app.registerModule('companyTemplate',[
        'ngAnimate',
        'ui.grid',
        'ui.grid.edit',
        'ui.grid.cellNav',
        'ui.grid.resizeColumns',
        'ui.grid.selection',
        'ui.grid.autoResize'
    ]);
    app.registerModule('positionIntroduction',[
        'ngAnimate',
        'ui.grid',
        'ui.grid.cellNav',
        'ui.grid.resizeColumns',
        'ui.grid.selection',
        'ui.grid.autoResize'
    ]);
    app.registerModule('userManagement',[
        'ngAnimate',
        'ui.grid',
        'ui.grid.cellNav',
        'ui.grid.resizeColumns',
        'ui.grid.selection',
        'ui.grid.autoResize'
    ]);
    app.registerModule('dictionaryMaintain', [
      'ui.grid',
      'ui.grid.cellNav',
      'ui.grid.edit',
      'ui.grid.selection',
      'ui.grid.autoResize'
    ]);

    app.registerModule('home', [
      'ui.bootstrap'
    ]);
}(ApplicationConfiguration));
