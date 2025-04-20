export function safeSocketHandler<T>(handler: (socket: T, ...args: any[]) => Promise<void> | void) {
    return async (socket: T, ...args: any[]) => {
      try {
        await handler(socket, ...args);
      } catch (err) {
        console.error('Socket handler error:', err);
        (socket as any).emit('error', { message: 'Server error' });
      }
    };
  }