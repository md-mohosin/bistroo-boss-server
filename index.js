const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config()

const app = express()

const port = process.env.PORT || 5000;


// MIDDLEWARE
app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b7lw2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();


        const menuCollection = client.db('bistrooBossDB').collection('menu')
        const reviewsCollection = client.db('bistrooBossDB').collection('reviews')
        const cartCollection = client.db('bistrooBossDB').collection('carts')


        // MENU DATA
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray()
            res.send(result)
        })





        // REVIEWS DATA
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray()
            res.send(result)
        })





        // CARTS DATA
        app.post('/carts', async (req, res) => {
            const cart = req.body;
            const result = await cartCollection.insertOne(cart)
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('BISTROO BOSS SERVER IS RUNNING')
})

app.listen(port, () => {
    console.log(`BISTROO BOSS SERVER IS RUNNING ON PORT : ${port}`);
})