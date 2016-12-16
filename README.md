# build
* bower install
* npm install
* gulp


程序入口文件：server.js  --> config/lib/app.js  -->  config/config.js
											    -->  config/lib/mongoose.js
											    -->  config/lib/exprss.js

client文件夹是：

config文件夹是：项目用到的express和mongoose等配置文件

public文件夹是：存放静态资源(css,img,js,...)的文件夹，暴露可以直接访问的. html页面中引用路径以“/”开始，映射到public文件夹。
	如要在html页面中引用public/css/position/base.css，src路径可以写出“/css/position/base.css”

server文件夹是：后台代码


手机端，新建一个页面，到能前台访问，需要添加和更改哪些文件（以招聘页面为例）：

1. 在server文件夹下，新建该模块为position，模块下再各自新建controller，routes，views文件夹

2. views文件夹下，新建html页面，如apply.server.view.html

3. routes文件夹下，新建position.route.js，映射访问路径和controller中的操作，如
	app.route('/position').get(postionController.index);
	即当访问host:port/position该路径时, 会去返回由postionController.index函数取得页面

4. controller文件夹下，新建position.controller.js，主要处理由前端传来的req，以及返回什么内容的res，
	这里可能会需要操作数据库。如：



html页面写在？angular那一套，前台那一套
静态资源放在哪里？

controller


全局路由配置
Data Modual写在：server/maintaining/models/ 下









插件介绍：

chalk.js 控制console输出字符串的颜色

compression.js 
consolidate.js 是一款javascript 模板引擎整合库.支持现今流行的多种模板引擎

lodash.js