import { AdminGateway } from './admin.gateway';

describe('AdminGateway', () => {
  it('emitNewReport broadcasts to server', () => {
    const gateway = new AdminGateway({} as any, {} as any);
    (gateway as any).server = { emit: jest.fn() };

    gateway.emitNewReport({ x: 1 });
    expect((gateway as any).server.emit).toHaveBeenCalledWith('new-report', { x: 1 });
  });

  it('disconnects if no token provided', async () => {
    const jwt: any = { verify: jest.fn() };
    const userService: any = { findById: jest.fn() };
    const gateway = new AdminGateway(jwt, userService);
    const client: any = {
      id: 's1',
      handshake: { auth: {}, headers: {} },
      data: {},
      disconnect: jest.fn(),
    };
    await gateway.handleConnection(client);
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('accepts admin token and sets client data', async () => {
    const jwt: any = { verify: jest.fn().mockReturnValue({ sub: '1' }) };
    const userService: any = { findById: jest.fn().mockResolvedValue({ isAdmin: true }) };
    const gateway = new AdminGateway(jwt, userService);
    const client: any = {
      id: 's2',
      handshake: { auth: { token: 't' }, headers: {} },
      data: {},
      disconnect: jest.fn(),
    };
    await gateway.handleConnection(client);
    expect(client.data.userId).toBe(1);
    expect(client.disconnect).not.toHaveBeenCalled();
  });
});

