import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDatabase, disconnectDatabase } from "../src/core/database";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  mongoServer = await MongoMemoryServer.create();
  await connectDatabase(mongoServer.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await disconnectDatabase();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
