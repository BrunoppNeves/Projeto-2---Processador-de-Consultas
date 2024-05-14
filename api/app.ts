import express from 'express';
import cors from 'cors'; // Importe o pacote 'cors'
import MainRoutes from './routes/MainRoutes';
import { Paths } from './models/ApiRoutes';

const app = express();

// Use o middleware 'cors' para lidar com as políticas de CORS
app.use(cors());

app.use(MainRoutes);

const PORT = Paths.ApiPort;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
