/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo ticketsys scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/ticketsys scripts/init.mongo.js
 * MLab:
 *   mongo mongodb://user:pwd@xxx.mlab.com:33533/ticketsys scripts/init.mongo.js
 */

db.tickets.remove({});

const ticketDB = [
    {
      id: 1, name: 'HuangYifan', phoneNumber: '123456', 
      created: new Date('2018-08-15 18:40:33'),
    },
    {
      id: 2, name: 'Ada', phoneNumber: '654321', 
      created: new Date('2018-08-16 18:40:33'), 
    },
  ];

db.tickets.insertMany(ticketDB);
const count = db.tickets.count();
print('Inserted', count, 'tickets');

db.counters.remove({ _id: 'tickets' });
db.counters.insert({ _id: 'tickets', current: count });

db.tickets.createIndex({ id: 1 }, { unique: true });
db.tickets.createIndex({ name: 1 });
db.tickets.createIndex({ phoneNumber: 1 });
db.tickets.createIndex({ created: 1 });

db.blacklist.createIndex({name: 1});
db.blacklist.createIndex({phoneNumber: 1});