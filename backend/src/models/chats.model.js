const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({

    room_name : {
        type : String,
        default : null,
    },

    sender : {
        type : String,
        default : "unknown",
    },

    message : {
        type : String,
        default : null,
    },

    created_at : {
        type : Date,
        default : Date.now,
    },

   // two type user chat admin and user
    user_type : {
        type : String,
        enum : ["user", "admin"],
    },

});