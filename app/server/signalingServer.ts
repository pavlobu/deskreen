/* eslint-disable no-console */
import http, { Server } from 'http';
import express from 'express';
import https from 'https';
import Koa from 'koa';
import Io from 'socket.io';
import cors from 'kcors';
import Router from 'koa-router';
import crypto from 'crypto';
// import koaStatic from 'koa-static';
import koaSend from 'koa-send';
import getPort from 'get-port';
// eslint-disable-next-line import/no-cycle
import Socket from './socket';
import pollForInactiveRooms from './inactive_rooms';
import getStore from './store';

let isDev;
try {
  // eslint-disable-next-line global-require
  isDev = require('electron-is-dev');
} catch (e) {
  isDev = true;
}

require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const app = new Koa();
// const PORT = process.env.PORT || 3001;

const router = new Router();

// const appName = process.env.HEROKU_APP_NAME ? process.env.HEROKU_APP_NAME : '';
// const isReviewApp = /-pr-/.test(appName);
// const siteURL = process.env.SITE_URL;

const store = getStore();

// if ((siteURL || env === 'development') && !isReviewApp) {
//   app.use(
//     cors({
//       origin: env === 'development' ? '*' : siteURL,
//       allowMethods: ['GET', 'HEAD', 'POST'],
//       credentials: true,
//     })
//   );
// }

app.use(cors());
app.use(router.routes());

const apiHost = process.env.API_HOST;
const cspDefaultSrc = `'self'${
  apiHost ? ` https://${apiHost} wss://${apiHost}` : ''
}`;

function setStaticFileHeaders(
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>
) {
  ctx.set({
    'strict-transport-security': 'max-age=31536000',
    'Content-Security-Policy': `default-src ${cspDefaultSrc} 'unsafe-inline'; img-src 'self' data:;`,
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
  app.use(async (ctx) => {
    setStaticFileHeaders(ctx);
    // await koaStatic(clientDistDirectory, {
    //   maxage: ctx.req.url === '/' ? 60 * 1000 : 365 * 24 * 60 * 60 * 1000, // one minute in ms for html doc, one year for css, js, etc
    // })(ctx, next);
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

const protocol = (process.env.PROTOCOL || 'http') === 'http' ? http : https;

const server = protocol.createServer(app.callback());
const io = Io(server, {
  pingInterval: 20000,
  pingTimeout: 5000,
  serveClient: false,
});

// Only use socket adapter if store has one
// if (store.hasSocketAdapter) {
//   io.adapter(store.getSocketAdapter());
// }

const roomHashSecret = process.env.ROOM_HASH_SECRET;

const getRoomIdHash = (id: string) => {
  if (env === 'development') {
    return id;
  }

  if (roomHashSecret) {
    return crypto.createHmac('sha256', roomHashSecret).update(id).digest('hex');
  }

  return crypto.createHash('sha256').update(id).digest('hex');
};

export const getIO = () => io;

io.on('connection', async (socket) => {
  const { roomId } = socket.handshake.query;

  const roomIdHash = getRoomIdHash(roomId);

  let room = await store.get('rooms', roomIdHash);
  room = JSON.parse(room || '{}');

  // eslint-disable-next-line no-new
  new Socket({
    roomIdOriginal: roomId,
    roomId: roomIdHash,
    socket,
    room,
  });
});

const init = async (PORT: number) => {
  pollForInactiveRooms();

  return server.listen(PORT, () => {
    console.log(`Signaling server is online at port ${PORT}`);
  });
};

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
    this.server = await init(this.port);
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
