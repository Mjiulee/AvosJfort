// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var avosExpressCookieSession = require('avos-express-cookie-session');
// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

//启用cookie
app.use(express.cookieParser('MyAvosJfortCookieSecure'));
//使用avos-express-cookie-session记录登录信息到cookie。
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }}));

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', {title:'avostest', message: 'Congrats, you just set up your app!' });
});

app.get('/login', function(req, res) {
  res.render('login', {title:'登录'});
});

app.post('/login', function(req, res) {
	AV.User.logIn(req.body.username, req.body.password).then(function() {
      //登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
      console.log('signin successfully: %j', AV.User.current());
      //跳转到profile页面。
      res.redirect('/profile');
    },function(error) {
      //登录失败，跳转到登录页面
      res.render('404', {title:'错误'});
  });
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

app.get('/signup', function(req, res) {
  res.render('signup', {title:'注册'});
});

app.post('/signup', function(req, res) {
  var user = new AV.User();
  user.set("username", req.body.username);
  user.set("password", req.body.password);

  user.signUp(null, {
    success: function(user) {
      // Hooray! Let them use the app now.
      res.redirect('/profile');
    },
    error: function(user, error) {
      // Show the error message somewhere and let the user try again.
      alert("Error: " + error.code + " " + error.message);
    }
  });
});

app.get('/newpost',function(req,res){
  res.render('newpost', {title:'注册'});
});

app.post('/newpost',function(req,res){
  var UserPost = AV.Object.extend("UserPost");// 创建AV.Object子类.
  var userPost = new UserPost();// 创建该类的一个实例
  // 保存数据
  userPost.set('title',req.body.title);
  userPost.set('content',req.body.content);
  
  var fs = require('fs');
  var iconFile = req.files.image;
  if(iconFile){
    fs.readFile(iconFile.path, function(err, data){
      if(err){
        return res.send("读取文件失败");
      }
      var base64Data = data.toString('base64');
      var theFile = new AV.File(iconFile.name, {base64: base64Data});
      theFile.save().then(function(theFile){
        //res.send("上传成功！");
        userPost.set('image',theFile.get('url'));
      });
    });
  }
  userPost.save(null, {
    success: function(gameScore) {
      res.send("发表成功！");
    }
  });
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();