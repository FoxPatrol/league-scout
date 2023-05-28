import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

// Define your routes
router
.get('/', (req: Request, res: Response) => {
  // Handle the GET request
  res.send('Hello home (get)!');
})
.post('/', (req: Request, res: Response) => {
  // Handle the POST request
  res.send('Hello home (post)!');
});

export default router;