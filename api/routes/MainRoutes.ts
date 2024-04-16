import * as express from 'express';
import UserRoutes from './UserRoutes';
import { Paths } from '../models/ApiRoutes';

const MainRoutes: express.Router = express.Router();

MainRoutes.use(Paths.ApiRoute, UserRoutes)

export default MainRoutes;
