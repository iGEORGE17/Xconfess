import { AnonymousContextMiddleware } from '../src/middleware/anonymous-context.middleware';

describe('AnonymousContextMiddleware', () => {
  it('adds x-anonymous-context-id when req.user exists', () => {
    const mw = new AnonymousContextMiddleware();
    const req: any = { user: { id: 1 }, headers: {} };
    const res: any = {};
    const next = jest.fn();

    mw.use(req, res, next);

    expect(req.headers['x-anonymous-context-id']).toMatch(/^anon_[a-f0-9-]+$/);
    expect(req['anonymousContextId']).toMatch(/^anon_[a-f0-9-]+$/);
    expect(next).toHaveBeenCalled();
  });

  it('does not add header when unauthenticated', () => {
    const mw = new AnonymousContextMiddleware();
    const req: any = { headers: {} };
    const res: any = {};
    const next = jest.fn();

    mw.use(req, res, next);

    expect(req.headers['x-anonymous-context-id']).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});