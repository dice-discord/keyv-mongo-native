const EventEmitter = require("events");
const { MongoClient } = require("mongodb");

class KeyvMongo extends EventEmitter {
  constructor(uri, options) {
    super();

    this.uri = uri;
    this.options = {
      collection: options.collection || "keyv"
    };
    this.client = MongoClient.connect(uri, { useNewUrlParser: true });
    this.collection = this.client.db().collection(this.options.collection);
  }

  get(key) {
    return this.collection.findOne({ key }).then(doc => doc.value);
  }

  set(key, value, ttl) {
    const newDoc = {
      key,
      value
    };

    if (ttl) {
      newDoc.expiresAt = new Date(Date.now() + ttl);
    }

    return this.collection.updateOne({ key }, { $set: { value } }, { upsert: true });
  }

  delete(key) {
    if (typeof key !== "string") {
      return Promise.resolve(false);
    }

    return this.collection.deleteOne({ key }).then(() => Promise.resolve(true));
  }

  clear() {
    return this.collection.deleteMany({ key: new RegExp(`^${this.namespace}:`) }).then(() => undefined);
  }
}

module.exports = KeyvMongo;
