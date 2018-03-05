var express = require("express");
var router = express.Router();
var problemService = require("../services/problemService");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json(); // 只需要json解析器

var node_rest_client = require('node-rest-client').Client;
var rest_client = new node_rest_client();

EXECUTOR_SERVER_URL = 'http://localhost:5000/build_and_run';
rest_client.registerMethod('build_and_run', EXECUTOR_SERVER_URL, 'POST');

// GET /api/v1/problems
router.get("/problems", function (req, res) {
    problemService.getProblems()
        .then(function(problems) {
            res.json(problems);
        });
});

// GET /api/v1/problems/:id
router.get("/problems/:id", function (req, res) {
    var id = req.params.id;
    problemService.getProblem(+id)
        .then(problem => res.json(problem)); // +id是将字符串转成整型
});

// POST /api/v1/problems
router.post("/problems", jsonParser, function (req, res) {
    problemService.addProblem(req.body)
        .then(problem => res.json(problem))
        .catch(error => res.status(400).send("Problem name already exists!"))
});

// POST /api/v1/build_and_run
router.post("/build_and_run", jsonParser, function (req, res) {
    const userCode = req.body.user_code;
    const lang = req.body.lang;
    console.log(lang + ': ' + userCode);

    // 收到client的代码后转发给executor server处理
    rest_client.methods.build_and_run(
        {
            data: { code: userCode, lang: lang },
            headers: { "Content-Type": "application/json" }
        }, (data, response) => {
            console.log("Received response from execution server: " + response);
            const text = `Build output: ${data['build']}
Execute output: ${data['run']}`;
            data['text'] = text;
            res.json(data); // 向client返回data
        }
    );
});

module.exports = router; // 将这个router export出去就能供server来用了