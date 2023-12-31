const express = require('express');
const cors = require('cors');
require('dotenv').config()
var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');


const app= express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin:['https://food-and-restaurant-f7f9f.web.app','http://localhost:5173'],
  credentials:true

}));
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
    const userCollection = client.db('FoodStore').collection('users');
    // Send a ping to confirm a successful connection



    // JWT-Auth related API
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log(user)
      const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'1h'})
      res
      .cookie('token',token,{
        httpOnly:true,
        secure:false
      })
      .send({success:true});
    })

    // Food my User
    app.get('/my-food-email', async (req, res) => {
      const userEmail = req.query.userEmail; 
      const query = { userEmail }; 
    
      try {
        const foodItems = await foodCollection.find(query).toArray();
        res.json(foodItems);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching cart items.' });
      }
    });
    // User insert
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
  })
    // User Insert
    // Food By User
    // food Query
     app.get('/foods', async(req,res) => {
      const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const cursor = foodCollection.find().skip(page*size).limit(size);
        console.log('pagination query',req.query);
        const result = await cursor.toArray();
        res.send(result);
    })
    // pagination
    app.get('/foodsCount', async (req,res) => {
      const count = await foodCollection.estimatedDocumentCount();
      res.send({count});
    })


    app.get('/food/:id', async(req,res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await foodCollection.findOne(query);
        res.send(result);

    })

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

    // add-Food
    app.get('/cart-by-email', async (req, res) => {
        const email = req.query.email; 
        const query = { email };
      
        try {
          const cartItems = await addToCart.find(query).toArray();
          res.json(cartItems);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'An error occurred while fetching cart items.' });
        }
      });

    //   app.post('/add-to-cart', async (req, res) => {
    //     const newCart = req.body;
    //     console.log(newCart);
    //     const result = await addToCart.insertOne(newCart);
    //     res.send(result);
    // })

    app.post('/add-to-cart', async (req, res) => {
        const newCart = req.body;
        console.log(newCart);
        const result = await addToCart.insertOne(newCart);
        res.send(result);
    })
    
    app.delete('/add-to-cart/:id', async(req,res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await addToCart.deleteOne(query);
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
    res.send("Food and Restaurant server is running")
})
app.listen(port, () => {
    console.log(`Food Server is running on port: ${port}`)

})