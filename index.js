const express = require('express')
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb')
const cors = require('cors')
const app = express()
const fileUpload = require('express-fileupload')
require('dotenv').config()
var bodyParser = require('body-parser')

const port = process.env.PORT || 5000
app.use(cors())
app.use(fileUpload())
app.use(express.json())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oq9xl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

async function run() {
  try {
    await client.connect()
    const database = client.db('VolunteerDatabase')
    const Events = database.collection('Events')
    const RegesterEvents = database.collection('RegesterEvents')

    app.get('/Events', async (req, res) => {
      const events = await Events.find().toArray()
      res.send(events)
    })

    app.post('/Events', async (req, res) => {
      const title = req.body.title
      const image = req.files.img
      const picData = image.data
      const encodedPic = picData.toString('base64')
      const imgBuffer = Buffer.from(encodedPic, 'base64')

      const newEvents = {
        title,
        img: imgBuffer,
      }

      const result = await Events.insertOne(newEvents)
      res.send(result)
    })

    //  update

    app.get('/Events/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const resutl = await Events.findOne(query)
      res.send(resutl)
    })

    app.post('/regesterEvent', async (req, res) => {
      const body = req.body
      const result = await RegesterEvents.insertOne(body)
      res.send(result)
    })

    app.get('/regesterEvent/:email', async (req, res) => {
      const query = req.params?.email
      const email = { email: query }
      // res.send(email)
      const result = await RegesterEvents.find(email).toArray()
      res.send(result)
    })

    app.get('/regesterEvent', async (req, res) => {
      const regEvent = await RegesterEvents.find().toArray()
      res.send(regEvent)
    })

    app.delete('/regesterEvent/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await RegesterEvents.deleteOne(query)
      res.send(result)
    })

    app.delete('/Events/:_id', async (req, res) => {
      const id = req.params._id
      const query = { _id: ObjectId(id) }
      const result = await RegesterEvents.deleteOne(query)
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      let query = {}
      const email = req.query.email
      if (email) {
        query = { email: email }
      }
      console.log(query)
      const result = await RegesterEvents.find(query).toArray()
      console.log(result)
      res.send(result)
    })
  } finally {
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('hello horld!!')
})

app.listen(port, () => {
  console.log('my port number is', port)
})
