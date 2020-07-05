import "reflect-metadata";
import express from "express";
import bodyParser from 'body-parser';
import { createConnection } from "typeorm";
import cors from 'cors';
import * as fs from 'fs';
import expressJwt from 'express-jwt';

import expressGraphQL from 'express-graphql';
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { refreshToken } from './refresh_token';

(async () => {
  const app = express();
  const RSA_PUBLIC_KEY = fs.readFileSync('./public.key');
  const checkIfAuthenticated = expressJwt({
    secret: RSA_PUBLIC_KEY,
    algorithms: ['RS256']
  });

  app.use(
    cors({
      origin: "http://localhost:4200",
      credentials: true
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  await createConnection();

  app.route('/api/refresh_token').get(checkIfAuthenticated, refreshToken);
  app.use('/graphql', expressGraphQL({
    schema: await buildSchema({
      resolvers: [UserResolver]
    }),
    graphiql: true
  }));

  app.listen(3000, () => {
    console.log('express server started');
  });
})();
