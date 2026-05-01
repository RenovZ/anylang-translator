export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  show(message: string, duration = 3000): void {
    const notification = this.createNotificationElement(message);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, duration);
  }

  private createNotificationElement(message: string): HTMLElement {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      background: #1f2937;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 2147483647;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    `;
    notification.textContent = message;
    return notification;
  }
}

export default NotificationManager.getInstance();
