import { IO } from './platform';

export class StatusUpdater {
  private connectionText = 'never-connected';
  private testText = 'loading';
  private pingText = '';
  constructor(private socket: IO) {
    socket.on('connect', () => {
      this.updateConnectionStatus('connected');
    });
    socket.on('disconnect', () => {
      this.updateConnectionStatus('disconnected');
    });
    socket.on('reconnecting', (sec) => {
      this.updateConnectionStatus('reconnecting in ' + sec + ' seconds');
    });
    socket.on('reconnect', () => {
      this.updateConnectionStatus('reconnected');
    });
    socket.on('reconnect_failed', () => {
      this.updateConnectionStatus('reconnect_failed');
    });

    socket.on('info', () => this.updateBrowsersInfo([]));
    socket.on('disconnect', () => {
      this.updateBrowsersInfo([]);
    });

    socket.on('ping', () => {
      this.updatePingStatus('ping...');
    });
    socket.on('pong', (latency) => {
      this.updatePingStatus('ping ' + latency + 'ms');
    });
  }
  private updateBrowsersInfo(browsers: any[]) {}
  private updateBanner() {}

  private updateConnectionStatus(connectionStatus: string) {
    this.connectionText = connectionStatus || this.connectionText;
    this.updateBanner();
  }
  updateTestStatus(testStatus: string) {
    this.testText = testStatus || this.testText;
    this.updateBanner();
  }
  private updatePingStatus(pingStatus: string) {
    this.pingText = pingStatus || this.pingText;
    this.updateBanner();
  }
}
