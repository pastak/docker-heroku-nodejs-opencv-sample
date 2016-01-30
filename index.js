'use strict'
const Koa = require('koa')
const app = new Koa()
const cv = require('opencv')
const Datauri = require('datauri')
const dUri = new Datauri()
const serve = require('koa-static')
const router = require('koa-router')()
const koaBody = require('koa-body')

router.post('/post', koaBody({multipart: true}), function *() {
  const uploadImagePath = this.request.body.files.file.path
  const uploadImageFileName = this.request.body.files.file.name
  this.body = yield (cb) => cv.readImage(uploadImagePath, function(err, im){
    im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
      if (err) {
        return cb(null, err)
      }
      for (let i=0; i < faces.length; i++) {
        const x = faces[i]
        im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2)
      }
      const buf = im.toBuffer()
      cb(null, dUri.format(uploadImageFileName, buf))
    })
  })
})

app.use(router.routes())
app.use(serve('./static'))

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
