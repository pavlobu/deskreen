/*
 * original JS code from darkwire.io
 * translated to typescript for Deskreen app
 * by Pavlo (Paul) Buidenkov
 * */

import http from 'http';
import express from 'express';
import Koa from 'koa';
import crypto from 'crypto';
import Io from 'socket.io';
import cors from 'kcors';
import Router from 'koa-router';
import koaStatic from 'koa-static';
import koaSend from 'koa-send';
import config from '../api/config';
// import getPort from 'get-port';
import pollForInactiveRooms from './pollForInactiveRooms';
import Logger from '../utils/LoggerWithFilePrefix';
import isProduction from '../utils/isProduction';
import SocketsIPService from './socketsIPService';
import socketIOServerStore from './store/socketIOServerStore';
import getDeskreenGlobal from '../utils/mainProcessHelpers/getDeskreenGlobal';
import DarkwireSocket from './darkwireSocket';
import getStore from './store';

const { port } = config;

const getRoomIdHash = (id: string) => {
  return crypto.createHash('sha256').update(id).digest('hex');
};

const ioHandleOnConnection = (socket: Io.Socket) => {
  const { roomId } = socket.handshake.query;
  const store = getStore();

  setTimeout(async () => {
    if (!getDeskreenGlobal().roomIDService.isRoomIDTaken(roomId)) {
      socket.emit('NOT_ALLOWED');
      setTimeout(() => {
        socket.disconnect();
      }, 1000);
    } else {
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
    }
  }, 500); // timeout 500 millisecond for throttling malitios connections
};

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
    // 'Cache-Control': 'max-age=0', // make browser get fresh files and make new connection when client connected
  });
}

class DeskreenSignalingServer {
  log = new Logger(__filename);

  expressApp: express.Application;

  server = ({} as unknown) as http.Server;

  port: number;

  app: Koa | undefined;

  constructor() {
    this.expressApp = express();
    this.port = parseInt((port as unknown) as string, 10);
    this.init();
  }

  init() {
    this.app = new Koa();
    const router = new Router();

    this.app.use(cors());
    this.app.use(router.routes());

    const clientDistDirectory = isProduction()
      ? `${__dirname}/client/build`
      : `${__dirname}/../client/build`;

    if (clientDistDirectory) {
      this.app.use(async (ctx, next) => {
        setStaticFileHeaders(ctx);
        await koaStatic(clientDistDirectory)(ctx, next);
      });

      this.app.use(async (ctx) => {
        setStaticFileHeaders(ctx);
        await koaSend(ctx, 'index.html', { root: clientDistDirectory });
      });
    } else {
      this.app.use(async (ctx) => {
        ctx.body = { ready: true };
      });
    }

    const protocol = http;

    this.server = protocol.createServer(this.app.callback());
    const io = Io(this.server, {
      pingInterval: 20000,
      pingTimeout: 5000,
      serveClient: false,
    });

    io.sockets.on('connection', (socket) => {
      const socketId = socket.id;
      const clientIp = socket.request.connection.remoteAddress;
      SocketsIPService.setIPOfSocketID(socketId, clientIp);
    });

    io.on('connection', (socket) => {
      ioHandleOnConnection(socket);
    });

    socketIOServerStore.setServer(io);
  }

  async start() {
    pollForInactiveRooms();
    this.port = parseInt((port as unknown) as string, 10);
    this.server = this.callListenOnHttpServer();
    return this.server;
  }

  callListenOnHttpServer() {
    const host = '::';
    
    return this.server.listen(this.port, host, () => {
      this.log.info(`Deskreen signaling server is online at ${host}:${this.port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EAFNOSUPPORT') {
        return this.server.listen(this.port, '0.0.0.0', () => {
          this.log.info(`Deskreen signaling server is online at 0.0.0.0:${this.port}`);
        });
      }
      throw err;
    });
  }

  stop(): void {
    this.server.close();
  }
}

const deskreenServer = new DeskreenSignalingServer();

export default deskreenServer;
