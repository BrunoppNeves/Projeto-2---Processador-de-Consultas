import express, { Request, Response } from 'express';
import { Paths ,Endpoint } from '../models/ApiRoutes';

const UserRoutes = express.Router().use(express.json());
 
 
UserRoutes.get(Endpoint.HELLO_WORLD, (req: Request, res: Response) => {
    const value: string = "HELLO WORLD!";

    return res.json({
        resultado: value,
    });
});

UserRoutes.post(Endpoint.VERIFY_QUERY, (req: Request, res: Response) => {
    const stringQuery: String = req.body.querySolicitada;
    
    
    return res.json({
        queryResponse : stringQuery
    })
});


export default UserRoutes;
