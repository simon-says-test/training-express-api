// Get dependencies
require('dotenv').config();  // This initialises environment variables from .env file
const express = require('express');
const logger = require('./logger');
const { NotFoundException } = require('./errors');
const errorHandler = require('./error-handler');
const RecipesConnector = require('./recipes-connector');

const app = express();

app.use(express.json()); // support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // support URL-encoded bodies
app.use(logger.logger);  // log every request

// creates a new recipe from the posted data in the request body
app.post('/recipes', async (req, res) => {
  const result = await RecipesConnector.createRecipe(req.body);
  // eslint-disable-next-line no-underscore-dangle
  res.setHeader('Location', `/${result._id}`);  // setting this header informs API consumer of where to find inserted record
  res.status(201);
  res.send(result);
});

// deletes the recipe with the ID supplied as a query parameter
app.delete('/recipes/:id', async (req, res) => {
  const result = await RecipesConnector.deleteRecipe(req.params.id);
  res.status(200);
  res.send(result);
});

// gets recipes according to search term in query parameter (if supplied)
app.get('/recipes', async (req, res) => {
  const searchTerm = req.query.search;
  const result = await RecipesConnector.getRecipes(searchTerm);
  res.status(200);
  res.send(result);
});

// gets the recipe with the ID supplied as a query parameter
app.get('/recipes/:id', async (req, res, next) => {
  try {
    const recipe = await RecipesConnector.getRecipe(req.params.id);
    if (!recipe) {
      throw new NotFoundException('recipe not found');
    }
    res.send(recipe);
  } catch (e) {
    next(e);  // pass exception to next middleware (error handler)
  }
});

// updates the recipe with the ID supplied as a query parameter according to the data in the request body
app.patch('/recipes/:id', async (req, res) => {
  res.send(await RecipesConnector.updateRecipe(req.params.id, req.body));
});

app.get('/', async (req, res) => {
  res.send('Please navigate to a valid operation');
});

app.use(logger.logger);
app.use(errorHandler.handler);

const connectToDataSources = async () => {
  await RecipesConnector.establishConnection();
};

module.exports = { app, connectToDataSources };
