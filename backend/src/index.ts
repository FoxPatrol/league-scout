import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const PORT = process.env.SERVER_PORT ?? 3000;
const server_dir = `http://localhost:${PORT}`
const app: Express = express();

// Enable CORS
app.use(cors());

// Dynamically all import routes in ./routes
const routePath = path.join(__dirname, 'routes');
fs.readdirSync(routePath).forEach((file) => {
  if (file.endsWith('.js') || file.endsWith('.ts')) {
    const route = require(path.join(routePath, file)).default;
    app.use('/', route);

    // Log route information
    //console.log(`Mounting routes from ${file}:`);
    Object.keys(route.stack).forEach((key) => {
      const routeLayer = route.stack[key];
      const methods = Object.keys(routeLayer.route.methods).join(', ');
      const path = routeLayer.route.path;
      console.log(`(${methods}) ${server_dir}${path} `);
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on ${server_dir}`);
});