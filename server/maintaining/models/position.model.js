/**
 * Created by HUGO on 5/16/2016.
 */
'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PositionSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    order: {
        type: Number,
    },
    name: {
        type: String,
        default: '',
        trim: true
    },
    subject: {
        type: String,
        default: ''
    },
    count: {
        type: Number,
        default: 0
    },
    workAddr:{
      type: String,
      default:'ZhuHai'
    },
    money: {
      type: String,
      default: '20K'
    },
    description: {
        type: String,
        default: ''
    },
    descriptionDetail: {
        type: String,
        default: ''
    },
    welfare: {
        type: Array,
        default: ''
    },
    newWelfare: {
        type: String,
        default: ''
    },
    welfareForShow: {
        type: String,
        default: ''
    },
    jobType: {
        type: String,
        default: ''
    },
    experience: {
        type: String,
        default: ''
    },
    //xue li
    certificate:{
        type: String,
        default: ''
    },
    updated: {
        type: Date,
        default: Date.now
    },
    status:{
        type: String,
        default: 'INACTIVE'
    },
    jobRequire:{
        type: String,
        default:''
    },
    browseCount : {
      type : Number,
      default : 0
    },
    applyCount : {
      type : Number,
      default : 0
    },
    successMessage : {
      type : String,
      default : '申请成功/我们将稍后联系你'
    }
});

mongoose.model('Position', PositionSchema);
