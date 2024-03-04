class Packet {
    id: string | number
    method: PacketMethod
    resource: string
    body: string
    valid: boolean = true;
    constructor(id: string, method: PacketMethod, resource: string, body: string) {
      this.id = id;
      this.method = method;
      if(typeof this.method != typeof PacketMethod) {
        this.valid = false
      }
      this.resource = resource;
      this.body = body;
    }
    /**
     * Stringifies the packet
     * @returns the stringified version of the packet
     */
    toString() {
      return `${this.id}.${this.method};${this.resource}|${this.body}`;
    }
  /**
   * Creates a packet from a raw String
   * @param  rawPacketString
   * @returns the parsed packet or null
   */
    static fromString(rawPacketString: string) {
        if (
          !rawPacketString.includes(".") ||
          !rawPacketString.includes(";") ||
          !rawPacketString.includes("|")
        ) {
          return null;
        }
      
        let elements = { ID: "", TYPE: "", RESOURCE: "", BODY: "" };
        let e: 'ID' | 'TYPE' | 'RESOURCE' | 'BODY' = "ID";
        let escape = false;
        for (let i = 0; i < rawPacketString.length; i++) {
          let c = rawPacketString.charAt(i);
          if (escape) {
            escape = false;
            elements[e] += c;
            continue;
          }
          if (c === "\\") {
            escape = true;
            continue;
          }
          if (e === "ID" && c === ".") {
            e = "TYPE";
            continue;
          }
          if (e === "TYPE" && c === ";") {
            e = "RESOURCE";
            continue;
          }
          if (e === "RESOURCE" && c === "|") {
            e = "BODY";
            continue;
          }
          elements[e] += c;
        }
        return new Packet(
          elements.ID,
          elements.TYPE as PacketMethod,
          elements.RESOURCE,
          elements.BODY
        );
      }
  }

enum PacketMethod {
    'SYS' = 'SYS',
    'GTW' = 'GTW',
    'REQ' = 'REQ',
    'ASW' = 'ASW',
    'MSG' = 'MSG'
}

export {
    Packet,
    PacketMethod
}