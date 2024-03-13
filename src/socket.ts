import { WebSocket } from "ws";
import { randomUUID } from "crypto";
import { Packet, PacketMethod } from "./packet.js";
import EventEmitter from "events";

declare interface Socket {
  on(event: 'request', listener: RequestCallback): this;
  on(event: 'message', listener: MessageCallback): this;
}

class Socket extends EventEmitter {
  sock: WebSocket;
  packetID: number;
  sessionID: string;
  markedAsDestroyable: boolean;
  onMessageCallbacks: Array<MessageCallback>;
  constructor(socket: WebSocket) {
    super();
    this.sock = socket;
    this.packetID = 0;
    this.sessionID = randomUUID();
    this.markedAsDestroyable = false;
    this.onMessageCallbacks = [];
    socket.on("close", () => {
      this.markedAsDestroyable = true;
    });

    socket.on("message", (ev) => {
      console.log("[YELLOWNET] raw msg recieved : " + ev.toString())
      let packet = Packet.fromString(ev.toString());
      if(packet?.method == PacketMethod.REQ) {
        this.emit('request', packet, this)
        return;
      }
      this.emit('message', packet, this)
    });
  }
  /**
   * Sends a packet to the client
   * @param packet The packet to send
   */
  sendPacket(packet: Packet) {
    try {
      this.sock.send(packet.toString());
      this.packetID += 1;
    } catch (error) {
      // Something happened...
    }
  }

  terminate(reason?: string) {
    this.markedAsDestroyable = true;
    // Send disconnect packet
    this.sendPacket(
      new Packet(
        this.packetID.toString(),
        PacketMethod.SYS,
        "server_disconnect",
        reason || "disconnected"
      )
    );
  }
}

interface MessageCallback {
  (message: Packet, socket: Socket): void
};

interface RequestCallback {
  (request: Packet, socket: Socket): AnswerPacket
};

class AnswerPacket extends Packet {
  constructor(requestPacket: Packet, response: string) {
    super(requestPacket.id as string, PacketMethod.ASW, requestPacket.resource, response)
  }
}

export { Socket, AnswerPacket };
