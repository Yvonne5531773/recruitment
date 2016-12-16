/**
 * Created by HUGO on 5/16/2016.
 */
'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var appliedPositionSchema = new Schema({
    positionId: {
        type: String,
        default: ''
    },
    positionName: {
        type: String,
        default: ''
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
});

var ApplicantSchema = new Schema({
    wechatOpenId:{
        type: String,
        default: ''
    },
    created: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        default: '',
        trim: true
    },
    school: {
      type: String
    },
    major: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    educationalBackground: {
        type: String,
        default: ''
    },
    qq: {
        type: String,
        default: ''
    },
    /* upload files if need */
    updated: {
        type: Date,
        default: Date.now
    },
    photoName: {
        type: String,
        default: ''
    },
    appliedPositions: [appliedPositionSchema],
    graduationDate: {
        type: Date
    }
});

mongoose.model('Applicant', ApplicantSchema);

