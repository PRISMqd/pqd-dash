declare module "potrace" {
  export const Potrace: any;
}

declare module "pngjs" {
  export class PNG {
    width: number;
    height: number;
    data: Uint8Array;
    constructor(options?: Record<string, unknown>);
    static sync: {
      read(buffer: Buffer): PNG;
      write(png: PNG): Buffer;
    };
  }
}
