import { WebSocket, WebSocketServer } from "ws";
import { Socket } from "./socket.js";
import { Packet, PacketMethod } from "./packet.js";

/**
 * Creates a new instance of a YELLOWNET server (YLWN://)
 */
class YellownetServer {
  /**
   * The port of the server
   */
  port: number = 2278;
  /**
   * The server protocol (only websocket for now...)
   */
  protocol: "websocket";
  /**
   * The list of YELLOWNET sockets connected to the server
   */
  sockets: Array<Socket> = [];

  /**
   * The underlying server (websocket only for now...)
   */
  server: WebSocketServer;

  /**
   * Custom closing message
   */
  customCloseMessage: string = "server closed";
  /**
   * The connection callback
   */
  onSocketConnected: (socket: WebSocket) => void = () => {};

  constructor(config: {
    /**
     * The port of the server
     * @default 2278
     * */ 
    port?: number;
    /**
     * The underlying protocol to use
     * @default 'websocket'
     * */ 
    protocol?: "websocket";

  }) {
    if(!config) {
      config = {
        port: 2278,
        protocol: "websocket"
      }
    }
    this.port = config.port || 2278;
    this.protocol = config.protocol || "websocket";
    this.server = new WebSocketServer({
      port: this.port,
    });
    this.server.on("listening", () => {
      console.log("[YELLOWNET] Server listening")
    })
    this.server.on("connection", (socket) => {
      this.onSocketConnected(socket)
    });
    this.server.on("close", () => {
      this.sockets.forEach((socket) => {
        socket.terminate(this.customCloseMessage || "server closed");
      });
    });
  }

  addSocket(socket: Socket) {
    this.sockets.push(socket);
    socket.sendPacket(new Packet('0', PacketMethod.SYS, 'server_init', 'empty'))
  }

  removeSocketBySessionID(socketUID: string) {
    let socketIDX = this.sockets.findIndex((sock, idx) => {
      if (sock.sessionID == socketUID) {
        return idx;
      }
    });
    if (socketIDX == 0) {
      return false;
    }
    let socketToDestroy = this.sockets[socketIDX];
    socketToDestroy.markedAsDestroyable = true;
    socketToDestroy.terminate();
    this.sockets.splice(socketIDX, 1);
  }
}

export { YellownetServer };
