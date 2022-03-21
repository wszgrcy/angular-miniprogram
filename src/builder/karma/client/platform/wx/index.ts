/// <reference types="miniprogram-api-typings" />

import type { Socket } from 'socket.io-client';

let io = require('weapp.socket.io/lib/weapp.socket.io');
declare const KARMA_PORT: number;
export class IO {
  instance: Socket;
  constructor() {
    this.instance = io(`http://localhost:${KARMA_PORT}`);
  }
  on(data: string, callback: (...args: any[]) => void) {
    this.instance.on(data, (...args) => {
      callback(...args);
    });
  }
  emit(type: string, data: any) {
    this.instance.emit(type, data);
  }
}
