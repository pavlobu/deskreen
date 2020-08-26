/* eslint-disable no-console */
import { Server } from 'http';
// import express, { Request, Response, NextFunction } from 'express';
import express from 'express';
import getPort from 'get-port';
// import * as bodyParser from "body-parser";
// import express from "express";
// import { Routes } from "./routes";

class SignalingServer {
  private static instance: SignalingServer;

  public expressApp: express.Application;

  public count: number;

  public server: Server;

  public port: number;
  // public routePrv: Routes = new Routes();

  constructor() {
    this.expressApp = express();
    this.count = 0;
    this.config();
    this.server = new Server();
    this.port = 3131;
    // this.routePrv.routes(this.app);
  }

  public async start(): Promise<Server> {
    // this.port = await getRandomPort();
    this.port = await getPort({ port: 3131 });
    this.server = this.expressApp.listen(this.port);
    console.log(`\n\nDeskreen signaling server started at port: ${this.port}`);
    return this.server;
  }

  public stop(): void {
    this.server.close();
  }

  private config(): void {
    // support application/json type post data
    // this.app.use(bodyParser.json());
    // support application/x-www-form-urlencoded post data
    // this.app.use(bodyParser.urlencoded({ extended: false }));
    // responde with indented JSON string
    // this.app.set("json spaces", 2);
    this.expressApp.get('/', (_, res) => {
      this.count += 1;
      res.status(200);
      res.write('Deskreen signaling server is running');
      res.send();
    });
    this.expressApp.get('/favicon.ico', (_, res) => {
      res.status(204);
      res.send();
    });
  }

  public static getInstance(): SignalingServer {
    if (!SignalingServer.instance) {
      SignalingServer.instance = new SignalingServer();
    }

    return SignalingServer.instance;
  }
}

export default SignalingServer.getInstance();
