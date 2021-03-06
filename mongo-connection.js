const { MongoClient } = require('mongodb');

class Connection {
  static async connectToMongo() {
    if (this.client) {
      return this.client;
    }

    this.client = await MongoClient.connect(this.url, this.options);
    return this.client;
  }
}

Connection.client = null;
Connection.url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}`
  + `@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}?retryWrites=true&w=majority`;
Connection.options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = { Connection };
