import express, { Express } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { env } from 'process';
import { MongoDBConnector } from '@db/connector';

MongoDBConnector.getInstance().connect();

const PORT = env.SERVER_PORT ?? 3000;
const server_dir = `http://localhost:${PORT}`;
const app: Express = express();

// Enable CORS
app.use(cors());

// Dynamically all import routes in ./routes
const routePath = path.join(__dirname, 'routes');
fs.readdirSync(routePath).forEach((file) => {
  if (file.endsWith('.js') || file.endsWith('.ts')) {
    //console.log(`Mounting routes from ${file}:`);
    const route = require(path.join(routePath, file)).default;
    app.use('/', route);

    // Log route information
    Object.keys(route.stack).forEach((key) => {
      const routeLayer = route.stack[key];
      const methods = Object.keys(routeLayer.route.methods).join(', ');
      const path = routeLayer.route.path;
      console.log(`(${methods}) ${server_dir}${path} `);
    });
  }
});

app.listen(PORT, async () => {
  console.log(`Server started on ${server_dir}`);
});
