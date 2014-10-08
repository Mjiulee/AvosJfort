// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', {title:'avostest', message: 'Congrats, you just set up your app!' });
});

app.get('/login', function(req, res) {
  res.render('login', {title:'登录'});
});

app.post('/login', function(req, res) {
	AV.User.logIn(req.body.usename,req.body.password).then(function(){
			res.redirect('/profile');
		},
		function(error){
			res.redirect('login');
		}
	);
});

app.get('/profile', function(req, res) {
    // 判断用户是否已经登录
    if (AV.User.current()) {
      // 如果已经登录，发送当前登录用户信息。
      res.send(AV.User.current());
    } else {
      // 没有登录，跳转到登录页面。
      res.redirect('/login');
    }
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();