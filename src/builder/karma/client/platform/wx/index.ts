/// <reference types="miniprogram-api-typings" />

import type { Socket } from 'socket.io-client';

let io = require('weapp.socket.io/lib/weapp.socket.io');
export class IO {
  instance: Socket;
  constructor() {
    // todo 需要动态获取端口
    this.instance = io('http://localhost:9876');
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
