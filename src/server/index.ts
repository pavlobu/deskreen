/*
 * original JS code from darkwire.io
 * translated to typescript for Deskreen app
 * by Pavlo (Paul) Buidenkov
 * */

import http from 'http';
import Koa from 'koa';
import crypto from 'crypto';
import { Server } from 'socket.io';
import cors from 'kcors';
import Router from 'koa-router';
import koaStatic from 'koa-static';
import koaSend from 'koa-send';
import detectPort from 'detect-port';
import config from '../common/config';
import startPollForInactiveRooms from './startPollForInactiveRooms';
import Logger from '../main/utils/LoggerWithFilePrefix';
import SocketsIPService from './socketsIPService';
import socketIOServerStore from './store/socketIOServerStore';
import DarkwireSocket from './darkwireSocket';
import getStore from './store';
import { getDeskreenGlobal } from '../main/helpers/getDeskreenGlobal';
import getMyLocalIpV4 from '../main/helpers/getMyLocalIpV4';
import { getClientViewerDistPath } from './getClientViewerDistPath';

const { hostname, primaryPort, backupPort } = config;

const getRoomIdHash = (id: string): string => {
  return crypto.createHash('sha256').update(id).digest('hex');
};

const ioHandleOnConnection = (socket): void => {
  const { roomId } = socket.handshake.query;
  const store = getStore();

  setTimeout(async () => {
    if (!getDeskreenGlobal().roomIDService.isRoomIDTaken(roomId)) {
      socket.emit('NOT_ALLOWED');
      setTimeout(() => {
        socket.disconnect(true);
      }, 1000);
      return;
    }
    const roomIdHash = getRoomIdHash(roomId);

    let room = await store.get('rooms', roomIdHash);
    room = JSON.parse(room || '{}');

    new DarkwireSocket({
      roomIdOriginal: roomId,
      roomId: roomIdHash,
      socket,
      room,
    });
    // }
  }, 500); // timeout 500 millisecond for throttling malicious connections
};

function setStaticFileHeaders(
  ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>,
): void {
  ctx.set({
    'strict-transport-security': 'max-age=31536000',
    'X-Frame-Options': 'deny',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Feature-Policy': "geolocation 'none'; vr 'none'; payment 'none'; microphone 'none'",
    // 'Cache-Control': 'max-age=0', // make browser get fresh files and make new connection when client connected
  });
}

class DeskreenSignalingServer {
  log = new Logger(__filename);

  server = {} as unknown as http.Server;

  hostname: string;

  primaryPort: number;

  backupPort: number;

  port: number;

  app: Koa | undefined;

  clientDistDirectory: string;

  constructor() {
    const localIp = getMyLocalIpV4();
    this.hostname = localIp || String(hostname);
    this.primaryPort = parseInt(primaryPort as unknown as string, 10);
    this.backupPort = parseInt(backupPort as unknown as string, 10);

    this.port = this.primaryPort;
    this.clientDistDirectory = getClientViewerDistPath();

    if (!this.clientDistDirectory) {
      this.log.error('Client viewer bundle is missing. Remote connections will fail.');
    }

    this.init();
  }

  init(): void {
    this.app = new Koa();
    const router = new Router();

    this.app.use(cors());
    this.app.use(router.routes());

    const clientDistDirectory = this.clientDistDirectory;

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
    const io = new Server(this.server, {
      pingInterval: 20000,
      pingTimeout: 5000,
      serveClient: false,
    });

    io.sockets.on('connection', (socket) => {
      const socketId = socket.id;

      const clientIp = socket.request.socket.remoteAddress;
      SocketsIPService.setIPOfSocketID(socketId, clientIp || '');
    });

    io.on('connection', (socket) => {
      ioHandleOnConnection(socket);
    });

    socketIOServerStore.setServer(io);
  }

  async start(): Promise<http.Server> {
    startPollForInactiveRooms();
    this.server = await this.callListenOnHttpServer();
    return this.server;
  }

  listenCallback() {
    return () => {
      this.log.info(`Deskreen CE signaling server is online at port ${this.port}`);
      this.log.info(`🌐 Server available at http://${this.hostname}:${this.port}`);
    };
  }

  async callListenOnHttpServer(): Promise<http.Server> {
    return new Promise<http.Server>((resolve, reject) => {
      const tryListen = (port: number): void => {
        // Remove any previous error listeners
        this.server.removeAllListeners('error');

        // Set up error handler
        this.server.once('error', async (error: NodeJS.ErrnoException) => {
          if (
            error.code === 'EADDRINUSE' &&
            (port === this.primaryPort || port === this.backupPort)
          ) {
            // Primary port is already in use, try backup
            this.log.error(`Port ${port} is already in use`);
            this.log.warn(`Port ${primaryPort} is in use. Trying backup port ${backupPort}...`);

            try {
              const detectedBackupPort = await detectPort(backupPort);

              if (backupPort === detectedBackupPort) {
                this.log.info(`Backup port ${backupPort} is available.`);
                this.port = backupPort;
                tryListen(backupPort);
              } else {
                const errorMsg = `Both primary port ${primaryPort} and backup port ${backupPort} are in use`;
                this.log.error(`Error: ${errorMsg}`);
                // reject(new Error(errorMsg));
                this.port = await detectPort();
                tryListen(this.port);
              }
            } catch (err) {
              this.log.error('An unexpected error occurred while detecting ports:', err);
              reject(err);
            }
          } else {
            // Some other error or backup port is also in use
            this.log.error(`Failed to start server on port ${port}:`, error);
            reject(error);
          }
        });

        // Attempt to listen on all interfaces (0.0.0.0) to allow both local and local network access
        this.server.listen(port, '0.0.0.0', () => {
          this.listenCallback()();
          resolve(this.server);
        });
      };

      // Start with the primary port
      tryListen(this.port);
    });
  }

  stop(): void {
    this.server.close();
  }
}

export const signalingServer = new DeskreenSignalingServer();
