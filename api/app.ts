import express from 'express';
import MainRoutes from './routes/MainRoutes';
import { Paths } from './models/ApiRoutes';

const app = express();

app.use(MainRoutes);

const PORT = Paths.ApiPort;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
