/*
 * original JS code from darkwire.io
 * translated to typescript for Deskreen app
 * */

/* eslint-disable no-console */
import http, { Server } from 'http';
import express from 'express';
import Koa from 'koa';
import Io from 'socket.io';
import cors from 'kcors';
import Router from 'koa-router';
import crypto from 'crypto';
import koaStatic from 'koa-static';
import koaSend from 'koa-send';
import getPort from 'get-port';
// eslint-disable-next-line import/no-cycle
import DarkwireSocket from './darkwireSocket';
import pollForInactiveRooms from './inactiveRooms';
import getStore from './store';

import Logger from '../utils/logger';

const log = new Logger('app/server/index.ts');

let isDev;
try {
  // eslint-disable-next-line global-require
  isDev = require('electron-is-dev');
} catch (e) {
  isDev = true;
}

const app = new Koa();

const router = new Router();

const store = getStore();

app.use(cors());
app.use(router.routes());

function setStaticFileHeaders(
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>
) {
  ctx.set({
    'strict-transport-security': 'max-age=31536000',
    'X-Frame-Options': 'deny',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Feature-Policy':
      "geolocation 'none'; vr 'none'; payment 'none'; microphone 'none'",
  });
}

const clientDistDirectory = isDev
  ? `${__dirname}/../client/build`
  : `${__dirname}/client/build`;

if (clientDistDirectory) {
  app.use(async (ctx, next) => {
    setStaticFileHeaders(ctx);
    await koaStatic(clientDistDirectory)(ctx, next);
  });

  app.use(async (ctx) => {
    setStaticFileHeaders(ctx);
    await koaSend(ctx, 'index.html', { root: clientDistDirectory });
  });
} else {
  app.use(async (ctx) => {
    ctx.body = { ready: true };
  });
}

const protocol = http;

const server = protocol.createServer(app.callback());
const io = Io(server, {
  pingInterval: 20000,
  pingTimeout: 5000,
  serveClient: false,
});

const getRoomIdHash = (id: string) => {
  return crypto.createHash('sha256').update(id).digest('hex');
};

io.on('connection', async (socket) => {
  const { roomId } = socket.handshake.query;

  const roomIdHash = getRoomIdHash(roomId);

  let room = await store.get('rooms', roomIdHash);
  room = JSON.parse(room || '{}');

  // eslint-disable-next-line no-new
  new DarkwireSocket({
    roomIdOriginal: roomId,
    roomId: roomIdHash,
    socket,
    room,
  });
});

const init = async (PORT: number) => {
  pollForInactiveRooms();

  return server.listen(PORT, () => {
    log.info(`Signaling server is online at port ${PORT}`);
  });
};

class SignalingServer {
  private static instance: SignalingServer;

  public expressApp: express.Application;

  public server: Server;

  public port: number;

  constructor() {
    this.expressApp = express();
    this.server = new Server();
    this.port = 3131;
  }

  public async start(): Promise<Server> {
    this.port = await getPort({ port: 3131 });
    this.server = await init(this.port);
    log.info(`Deskreen signaling server started at port: ${this.port}`);
    return this.server;
  }

  public stop(): void {
    this.server.close();
  }

  public static getInstance(): SignalingServer {
    if (!SignalingServer.instance) {
      SignalingServer.instance = new SignalingServer();
    }

    return SignalingServer.instance;
  }
}

export const getIO = () => io;

export default SignalingServer.getInstance();
