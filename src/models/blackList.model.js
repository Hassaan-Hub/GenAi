const mongoose = require('mongoose');

const userBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required"]
    },
}, { timestamps: true });

const userBlackListModel = mongoose.model('userBlackList', userBlackListSchema);

module.exports = userBlackListModel;