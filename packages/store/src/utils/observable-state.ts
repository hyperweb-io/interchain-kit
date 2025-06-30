type Listener<T> = (state: T) => void;

export class ObservableState<T extends object> {
  private listeners: Set<Listener<T>> = new Set();
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

  notify() {
    for (const listener of this.listeners) {
      listener(this._state);
    }
  }
}

// Usage example:
// const state = new ObservableState({ count: 0 });
// state.subscribe(s => console.log(s));
// state.proxy.count = 1;