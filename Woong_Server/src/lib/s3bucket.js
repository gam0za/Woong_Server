const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3-transform')
const shortid = require('shortid')
const moment = require('moment')
const _ = require('lodash')
const sharp = require('sharp')

aws.config.loadFromPath('../../config/credential.json')
const s3 = new aws.S3()

module.exports = {
  /*
  [Function multer]
  @param: which: String: folder name  ['newsfeeds, boards, libraries, reference']
  @param: options: Object: something have options is set up for this multer
  @return multer for router
  */
  multer: (which, options = {}) => {
    const date = {
      YYYY: moment().format('YYYY'),
      MM: moment().format('MM'),
    }
    let opt = {
      s3,
      bucket: 'moducampus.staging',
      CacheControl: 'max-age = 31536000',
      acl: 'public-read-write',
      key(req, file, cb) {
        cb(null, `${which}/${date.YYYY}/${date.MM}/${shortid.generate()}.${Date.now()}.${file.originalname.split('.').pop()}`)
      },
    }
    if (which === 'review') {
      opt = _.defaultsDeep({
        ...options,
        acl: 'public-read',
        shouldTransform: (req, file, cb) => {
          cb(null, /^image/i.test(file.mimetype))
        },
        transforms: [{
          id: 'original',
          key: (req, file, cb) => {
            cb(null, `${which}/${date.YYYY}/${date.MM}/${shortid.generate()}.${Date.now()}.${file.originalname.split('.').pop()}`)
          },
          transform: (req, file, cb) => {
            cb(null, sharp().png())
          },
        }, {
          id: 'thumbnail',
          key: (req, file, cb) => {
            cb(null, `${which}/${date.YYYY}/${date.MM}/${shortid.generate()}.${Date.now()}.${file.originalname.split('.').pop()}`)
          },
          transform: (req, file, cb) => {
            cb(null, sharp().resize(100, 100).jpeg())
          },
        }, {
          id: 'service',
          key: (req, file, cb) => {
            cb(null, `${which}/${date.YYYY}/${date.MM}/${shortid.generate()}.${Date.now()}.${file.originalname.split('.').pop()}`)
          },
          transform: (req, file, cb) => {
            cb(null, sharp().resize(616).jpeg())
          },
        }],
      }, opt)
    } else if (which === 'libraries' || which === 'reference') {
      
      delete options.acl
      opt = _.defaultsDeep({
        ...options,
        acl: 'public-read',
      }, opt)

    } else {
      throw new Error('S3 Image Associate Error')
    }
    return multer({ storage: multerS3(opt) })
  },
}