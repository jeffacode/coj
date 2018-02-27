var express = require("express");
var router = express.Router();
var problemService = require("../services/problemService");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json(); // 只需要json解析器

// 在/api/v1开头的情况下如果再跟/problems，
// 调用problemService服务的getProblems方法，
// 它会返回一个Promise对象，当这个对象resolve的时候，
// 会发回一个problems，res用json方式将它返回给请求者
router.get("/problems", function (req, res) {
    problemService.getProblems()
        .then(function(problems) {
            res.json(problems);
        });
});

// 处理client只要传回一个problem的请求
router.get("/problems/:id", function (req, res) {
    var id = req.params.id;
    problemService.getProblem(+id)
        .then(problem => res.json(problem)); // +id是将字符串转成整型
});

// 处理client添加一个problem的请求
// 用jsonParser将请求解析为一个JSON对象，
// 此时req.body就是新问题的JSON对象
// 但它只有name, desc和difficulty，需要服务器自行添加id
router.post("/problems", jsonParser, function (req, res) {
    problemService.addProblem(req.body)
        .then(problem => res.json(problem))
        .catch(error =>res.status(400).send("Problem name already exists!"))
});

module.exports = router; // 将这个router export出去就能供server来用了