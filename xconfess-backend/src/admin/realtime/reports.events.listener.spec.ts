import { ReportsEventsListener } from './reports.events.listener';

describe('ReportsEventsListener', () => {
  it('emits to gateway on report.created', () => {
    const gateway: any = { emitNewReport: jest.fn() };
    const listener = new ReportsEventsListener(gateway);
    listener.handleReportCreated({ reportId: 'r1' });
    expect(gateway.emitNewReport).toHaveBeenCalledWith({ reportId: 'r1' });
  });
});

