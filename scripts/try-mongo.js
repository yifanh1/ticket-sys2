const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/ticketsys';
let client;
let db;
async function connectToDb() {
    client = new MongoClient(url, { useNewUrlParser: true });
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db();
}

// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';

// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';

async function testInit(db) {
    console.log('\n--- test DB init ---');
    const collection = db.collection('groceries');
    const counters = db.collection('counters');
    const chip = { id: 1, name: 'potato chips', price: 3, shelf: 'D', quantity: 20 };
    const pumpkin = { id: 2, name: 'pumpkin', price:6, shelf: 'A', quantity: 10};
    const milk = {id: 3, name: 'meiji milk', price:4, shelf: 'A', quantity: 15};
    const groceries = [chip, pumpkin, milk];
    const result = await collection.insertMany(groceries);
    console.log('Result of init-insert (inserted Id):\n', result.insertedCount);
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ name: 1 });
    await collection.createIndex({ price: 1 });
    await collection.createIndex({ shelf: 1 });
    await collection.createIndex({ quantity: 1 });
    await counters.remove({ _id: 'groceries'});
    const count = await collection.count();
    await counters.insertOne({ _id: 'groceries', current:  count});
    console.log('groceries count: ', count)
    return;
    
  }
async function testRead(db) {
    console.log('\n--- test DB read ---');
    const collection = db.collection('groceries');
    const result = await collection.find({ shelf: 'A'}).toArray();
    console.log('Result of find shelf = A:\n', result);
    return;
}
async function getNextCount(name) {
    const result = await db.collection('counters').findOneAndUpdate(
        {_id: name},
        {$inc: {current: 1}},
        { returnOriginal: false},
    );
    return result.value.current;
}
async function testInsert(db) {
    console.log('\n--- test DB Insert ---');
    const collection = db.collection('groceries');
    const apple = { name: 'apples', price: 3, shelf: 'E', quantity: 20 };
    apple.id = await getNextCount('groceries');
    const result = await collection.insertOne(apple);
    console.log('Result of insert apple:\n', result.insertedId);
    return;
}

async function testUpdate(db) {
    console.log('\n--- test DB Update ---');
    const collection = db.collection('groceries');
    const result = await collection.updateOne(
        {name : 'pumpkin'},
        {$inc: {quantity: -1}});
    console.log('Result of update quantity of pumpkin:\n', result.result);
    return;
}
async function testDelete(db) {
    console.log('\n--- test DB Delete ---');
    const collection = db.collection('groceries');
    const result = await collection.deleteOne({shelf : 'D'});
    console.log('Result of delete shelf D:\n', result.deletedCount);
    return;
}
async function cleanUpDb(db) {
    console.log('\n***** Cleaning Up *****');
    const collection = db.collection('groceries');
    const result = await collection.deleteMany();
    console.log('Result of clean up all groceries\n', result.deletedCount);
    return;
}

async function testFunction() {
    try {
        await connectToDb();
        await testInit(db);
        await testRead(db);
        await testInsert(db);
        await testUpdate(db);
        await testDelete(db);
        await cleanUpDb(db);
        // connectToDb();
        // testInit(db);
        // testRead(db);
        // testInsert(db);
        // testUpdate(db);
        // testDelete(db);
        // cleanUpDb(db);
        return 0;
    } catch (err) {
        console.log('ERROR', err);
        return 1;
    } finally{
        client.close();
    }
}
testFunction();