/// <reference types="miniprogram-api-typings" />

import type { Socket } from 'socket.io-client';

const io = require('weapp.socket.io/lib/weapp.socket.io');

declare const KARMA_PORT: number;
declare const KARMA_HOST: string;
export class IO {
  instance: Socket;
  constructor() {
    // 用 KARMA_HOST 而不是写死 localhost：微信模拟器里 localhost 常常解析不了
    this.instance = io(`http://${KARMA_HOST}:${KARMA_PORT}`);
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
