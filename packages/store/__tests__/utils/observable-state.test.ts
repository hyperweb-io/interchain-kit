import { ObservableState } from '../../src/utils';


describe('ObservableState', () => {
  it('notifies listeners on state change', () => {
    const state = new ObservableState({ count: 0 });
    const listener = jest.fn();
    state.subscribe(listener);
    state.proxy.count = 1;
    expect(listener).toHaveBeenCalledWith({ count: 1 });
  });

  it('unsubscribes listeners', () => {
    const state = new ObservableState({ count: 0 });
    const listener = jest.fn();
    const unsubscribe = state.subscribe(listener);
    unsubscribe();
    state.proxy.count = 2;
    expect(listener).not.toHaveBeenCalledWith({ count: 2 });
  });

  it('notifies selector listeners only on selected change', () => {
    const state = new ObservableState({ a: 1, b: 2 });
    const selector = (s: any) => s.a;
    const listener = jest.fn();
    state.subscribeWithSelector(selector, listener);
    state.proxy.b = 3;
    expect(listener).toHaveBeenCalledTimes(1); // only initial
    state.proxy.a = 5;
    expect(listener).toHaveBeenCalledTimes(2); // changed
  });
}); 