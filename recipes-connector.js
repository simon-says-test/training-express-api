const { ObjectID } = require('mongodb');
const { Connection } = require('./mongo-connection');
const { BadRequestException } = require('./errors');

let recipes;

/** Connect to database - call only once */ 
const establishConnection = async () => {
  const client = await Connection.connectToMongo();
  recipes = client.db('training-simon').collection('recipes');
};

const getMongoDbId = (id) => {
  try {
    return ObjectID(id);
  } catch (e) {
    throw new BadRequestException('Invalid ID supplied', e);
  }
};

const createRecipe = async (recipe) => {
  const result = await recipes.insertOne(recipe);
  return result.ops[0];
};

const deleteRecipe = async (id) => {
  const result = await recipes.deleteOne({ _id: getMongoDbId(id) });
  return { deletedCount: result.deletedCount };
};

const getRecipes = async (searchTerm) => {
  let criteria = {};
  if (searchTerm) {
    criteria = {
      $or: [
        { title: { $regex: `.*${searchTerm}.*`, $options: 'i' } },
        { shortDescription: { $regex: `.*${searchTerm}.*`, $options: 'i' } },
      ],
    };
  }
  return recipes.find(criteria).toArray();
};

const getRecipe = async (id) => recipes.findOne({ _id: getMongoDbId(id) });

const updateRecipe = async (id, recipe) => {
  const { _id, ...newRecipe } = recipe;
  const result = await recipes.updateOne({ _id: getMongoDbId(id) }, { $set: newRecipe });
  return { modifiedCount: result.modifiedCount };
};

module.exports = {
  createRecipe,
  establishConnection,
  deleteRecipe,
  getRecipes,
  getRecipe,
  updateRecipe,
};
