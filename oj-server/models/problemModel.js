var mongoose = require('mongoose');

// 创建schema
var ProblemSchema = mongoose.Schema({
    id: Number,
    name: String,
    desc: String,
    difficulty: String
});

// 创建模型
var ProblemModel = mongoose.model('ProblemModel', ProblemSchema);

module.exports = ProblemModel;