import { WebSocket } from "ws";
import { randomUUID } from "crypto";
import { Packet, PacketMethod } from "./packet.js";
class Socket {
  sock: WebSocket;
  packetID: number;
  sessionID: string;
  markedAsDestroyable: boolean;
  onMessageCallbacks: Array<MessageCallback>;
  constructor(socket: WebSocket) {
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
      for (let i = 0; i < this.onMessageCallbacks.length; i++) {
        const callback = this.onMessageCallbacks[i];
        let packet = Packet.fromString(ev.toString());
        console.log(packet)
        if(packet && packet.valid){
          console.log(packet.toString())
            callback(
              packet, this
            );
        }
      }
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

  on(label: "message", callback: MessageCallback) {
    if (label == "message") {
      this.onMessageCallbacks.push(callback);
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
export { Socket };
