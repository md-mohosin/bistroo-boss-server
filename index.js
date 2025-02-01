const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()

const jwt = require('jsonwebtoken');

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


        const usersCollection = client.db('bistrooBossDB').collection('users')
        const menuCollection = client.db('bistrooBossDB').collection('menu')
        const reviewsCollection = client.db('bistrooBossDB').collection('reviews')
        const cartCollection = client.db('bistrooBossDB').collection('carts')




        // MIDDLEWARES
        const varifyToken = (req, res, next) => {
            console.log('inside varify token', req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unauthorized access' })
            }

            const token = req.headers.authorization.split(' ')[1]

            jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(401).send({ message: 'forbidden access' })
                }
                req.decoded = decoded;
                next()
            })
        }



        // USER VARIFY ADMIN AFTER VARIFY TOKEN
        const varifyAdmin = async (req, res, next) => {
            const email = req.decoded.email
            // console.log(email);
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            console.log('user', user);
            const isAdmin = user.role === 'admin';
            console.log('isadmin and email', isAdmin, email);
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden acces' })
            }
            next()
        }





        // JWT RELETED API
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCES_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })





        // USERS DATA
        app.post('/users', async (req, res) => {
            const user = req.body
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already taken', insertedId: null })
            }
            const result = usersCollection.insertOne(user)
            res.send(result)
        })



        app.patch('/users/admin/:id', varifyToken, varifyAdmin, async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }

            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)

        })



        app.get('/users', varifyToken, varifyAdmin, async (req, res) => {

            const result = await usersCollection.find().toArray()
            res.send(result)
        })


        app.get('/users/admin/:email', varifyToken, async (req, res) => {
            const email = req.params.email;
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'unauthorized access' })
            }

            const query = { email: email }
            const user = await usersCollection.findOne(query)
            console.log(user, email);
            let admin = false
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin })
        })


        app.delete('/users/:id', varifyToken, varifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })




        // MENU DATA
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray()
            res.send(result)
        })


        app.post('/menu', varifyToken, varifyAdmin, async (req, res) => {
            const item = req.body
            const result = await menuCollection.insertOne(item)
            res.send(result)
        })



        app.delete('/menu/:id', varifyToken, varifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: id }
            const result = await menuCollection.deleteOne(query)
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



        app.get('/carts', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await cartCollection.find(query).toArray()
            res.send(result)
        })



        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = cartCollection.deleteOne(query)
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