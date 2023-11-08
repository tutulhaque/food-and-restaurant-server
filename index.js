const express = require('express');
const cors = require('cors');
require('dotenv').config()


const app= express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z9xqo9p.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const categoryCollection = client.db('FoodStore').collection('category');
    const foodCollection = client.db('FoodStore').collection('food');
    const addToCart = client.db('FoodStore').collection('cart');
    // Send a ping to confirm a successful connection

    // User insert
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
  })
    // User Insert
    app.get('/food/:id', async(req,res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await foodCollection.findOne(query);
      res.send(result);

  })
   // pagination
   app.get('/foodsCount', async (req,res) => {
    const count = await foodCollection.estimatedDocumentCount();
    res.send({count});
  })
    // Insert food
    app.post('/foods', async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
  })
  app.put('/food/:id', async(req,res) => {
    const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert:true};
      const updatedFood = req.body;
      const food = {
          $set:{
            name: updatedFood.name,
            category: updatedFood.category,
            price: updatedFood.price,
            quantity:updatedFood.quantity,
            description:updatedFood.description,
            origin:updatedFood.origin,
            photo: updatedFood.photo
          }
      }
      const result = await foodCollection.updateOne(filter,food,options)
      res.send(result);

  })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
    res.send("Food and apprearl making server is running")
})
app.listen(port, () => {
    console.log(`Food Server is running on port: ${port}`)

})