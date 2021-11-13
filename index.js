const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;


app.use(bodyParser.json());
app.use(cors());
app.use(express.json())


const uri = "mongodb+srv://fragranceDB:dijHhcmTG6Py8Pvm@cluster0.fzvfh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        console.log('database connected successfully');
        const database = client.db('fragrance');
        const usersCollection = database.collection('users')
        const productsCollection = database.collection('product')
        const perchaseCollection = database.collection('perchase')
        const reviewCollection = database.collection('review')




        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;

            }
            res.json({ admin: isAdmin })

        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', req.headers.authorization);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })




        app.get('/parchase', async (req, res) => {
            const email = req.query.email;
            const quary = { email: email }
            const cursor = perchaseCollection.find(quary)
            const listsItems = await cursor.toArray();
            console.log(listsItems);
            res.send(listsItems)
        })

        app.post('/parchase', async (req, res) => {
            const newPerchase = req.body;
            console.log('hitted', newPerchase);
            const result = await perchaseCollection.insertOne(newPerchase);

            res.json(result)
        });

        app.delete('/parchase/:_id', (req, res) => {
            perchaseCollection.deleteOne({ _id: ObjectId(req.params._id) })
                .then((result) => {
                    res.send(result.deletedCount > 0)
                })
        })






        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const product = await cursor.toArray();

            res.send(product)
        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json(result)
        });



        app.delete('/delete/:_id', (req, res) => {
            reviewCollection.deleteOne({ _id: ObjectId(req.params._id) })
                .then((result) => {
                    res.send(result.deletedCount > 0)
                })
        })



        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({})
            const product = await cursor.toArray();

            res.send(product)
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('running')
})

app.listen(port, () => {
    console.log('server running at port');
})
