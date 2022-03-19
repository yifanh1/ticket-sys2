const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');
let db;
const url = 'mongodb://localhost/ticketsys';
const maxNumberOfTickets = 25;

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}
async function ticketList(){
  const tickets = await db.collection('tickets').find({}).toArray();
  return tickets;
}
async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

function ticketInfoValidate(ticket) {
  const errors = [];
  if (ticket.name.length < 3) {
    errors.push('Traveller name must be at least 3 characters long.')
  }
  if (ticket.phoneNumber.length < 6) {
    errors.push('Traveller phone number must be at least 6 characters.')
  }
  if (isNaN(ticket.phoneNumber)) {
    errors.push('Traveller phone number must only include numbers!')
  }
  return errors;
}
async function checkBlackList(ticket) {
  const findByNameRes = await db.collection('blacklist').find({name: ticket.name}).toArray();
  const findByPhoneNumRes = await db.collection('blacklist').find({phoneNumber: ticket.phoneNumber}).toArray();
  if (findByNameRes.length > 0 || findByPhoneNumRes.length > 0) return ['The traveller info is in blacklist!'];
  else return [];
}
const GraphQLDate = new GraphQLScalarType({
    name: 'GraphQLDate',
    description: 'A Date() type in GraphQL as a scalar',
    serialize(value) {
      return value.toISOString();
    },
    parseValue(value) {
      return new Date(value);
    },
    parseLiteral(ast) {
      return (ast.kind == Kind.STRING) ? new Date(ast.value) : undefined;
    },
  });

  const resolvers = {
    Query: {
        ticketList
    },
    Mutation: {
        ticketAdd,
        ticketDelete,
        blackAdd,
    },
    GraphQLDate,
  };

  async function ticketAdd(_, { ticket }) {
      // check if there's tickets
      const count = await db.collection('tickets').count();
      if (count >= maxNumberOfTickets) return {status: false, errors: ['No More Seats!']};
      // check the input to see if it's valid
      const errors = ticketInfoValidate(ticket);
      if (errors.length > 0) return {status: false, errors: errors};
      // check the traveller info to see if it's in black list.
      const black = await checkBlackList(ticket);
      if (black.length > 0) return {status: false, errors: black};
      // all passed -> create ticket
      ticket.created = new Date();
      ticket.id = await getNextSequence('tickets');
      const result = await db.collection('tickets').insertOne(ticket);
      const savedTicket = await db.collection('tickets').find({_id: result.insertedId}).toArray();
      if (savedTicket.length > 0) return {status: true, errors:[]};
      else return {status: false, errors:['unknown error in database']};
  }
  async function ticketDelete(_, { ticket }) {
      const errors = ticketInfoValidate(ticket);
      if (errors.length > 0) return {status: false, errors:errors};
      const result = await db.collection('tickets').deleteOne(ticket);
      if (result.deletedCount > 0) return {status: true, errors:[]};
      else return {status: false, errors: ['No matched records']};
  }
  async function blackAdd(_, { ticket }) {
      const errors = ticketInfoValidate(ticket);
      if (errors.length > 0) return {status: false, errors: errors};
      const result = await db.collection('blacklist').insertOne(ticket);
      const savedBlack = await db.collection('blacklist').find({_id: result.insertedId}).toArray();
      if (savedBlack.length > 0) return {status: true, errors:[]};
      else return {status: false, errors:['unknown error in database']};
  }
  const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
    resolvers,
  });
  
const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

async function startFunction() {
  try {
    await connectToDb();
    app.listen(5000, function () {
      console.log('BackEnd started on port 5000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
}
startFunction();