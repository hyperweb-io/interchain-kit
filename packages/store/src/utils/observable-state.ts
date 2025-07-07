
type Listener<T> = (state: T) => void;
type Selector<T, S> = (state: T) => S;
type SelectorListener<S> = (selected: S) => void;

export class ObservableState<T extends object> {
  private listeners: Set<Listener<T>> = new Set();
  private selectorListeners: Set<{ selector: Selector<T, any>, listener: SelectorListener<any>, prev: any }> = new Set();
  private _state: T;
  public proxy: T;

  constructor(initialState: T) {
    this._state = { ...initialState };
    this.proxy = new Proxy(this._state, {
      set: (target, prop, value) => {
        // @ts-ignore
        target[prop] = value;
        this.notify();
        return true;
      },
      deleteProperty: (target, prop) => {
        // @ts-ignore
        delete target[prop];
        this.notify();
        return true;
      }
    });
  }

  subscribe(listener: Listener<T>) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeWithSelector<S>(selector: Selector<T, S>, listener: SelectorListener<S>) {
    let prev = selector(this._state);
    const wrapper = { selector, listener, prev };
    this.selectorListeners.add(wrapper);
    listener(prev);
    return () => this.selectorListeners.delete(wrapper);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this._state);
    }
    for (const wrapper of this.selectorListeners) {
      const next = wrapper.selector(this._state);
      if (next !== wrapper.prev) {
        wrapper.prev = next;
        wrapper.listener(next);
      }
    }
  }
}

// Usage example:
// const state = new ObservableState({ count: 0 });
// state.subscribe(s => console.log(s));
// state.proxy.count = 1;