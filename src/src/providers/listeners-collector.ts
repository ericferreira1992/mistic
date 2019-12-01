import { Injectable } from "../inject/injectable";

@Injectable({ single: true })
export class ListenersCollector {
    private listenersSubscribed: ListenerSubscribed[] = [];

    public subscribe(target: HTMLElement, eventName: string, callback: (e?: any) => void): () => void {
        if (target) {
            let subscribed = new ListenerSubscribed({
                target,
                eventName,
                realCallback: callback
            });
            subscribed.callback = (e) => {
                if (subscribed.beforeListen) subscribed.beforeListen();
                callback(e);
                if (subscribed.afterListen) subscribed.afterListen();
            }

            subscribed.target.addEventListener(subscribed.eventName, subscribed.callback);
            this.listenersSubscribed.push(subscribed);
            
            return () => this.unsubscribe(subscribed);
        }
        return () => {};
    }

    public unsubscribe(subscribed: ListenerSubscribed) {
        if (subscribed) {
            subscribed.target.removeEventListener(subscribed.eventName, subscribed.callback);
        }
        this.listenersSubscribed = this.listenersSubscribed.filter(x => x === subscribed);
    }

    public unsubscribeAll(){
        let toUnsubscribe = this.listenersSubscribed.pop();
        while(toUnsubscribe){
            if (toUnsubscribe.target)
                toUnsubscribe.target.removeEventListener(toUnsubscribe.eventName, toUnsubscribe.callback);
            
            toUnsubscribe = this.listenersSubscribed.pop();
        }
    }

    public unsubscribeAllFromElement(target: HTMLElement) {
        if (target) {
            let listToUnsubscribe  = this.listenersSubscribed.filter(x => x.target === target);
            if (listToUnsubscribe.length) {
                for(let toUnsubscribe of listToUnsubscribe) {
                    if (toUnsubscribe.target){
                        toUnsubscribe.target.removeEventListener(toUnsubscribe.eventName, toUnsubscribe.callback);
                    }
                }
                this.listenersSubscribed = this.listenersSubscribed.filter(x => !listToUnsubscribe.some(y => x === y));
            }
        }
    }

    public addActionsInElementsListeners(element: HTMLElement, before: () => void, after: () => void) {
        if (before || after) {
            let subscribed = this.listenersSubscribed.find(x => x.target === element);
            if (subscribed) {
                subscribed.beforeListen = before;
                subscribed.afterListen = after;
            }
        }
    }
}

export class ListenerSubscribed {
    public target: HTMLElement;
    public eventName: string;
    public callback: (e: any) => void;
    public realCallback: (e: any) => void;

    beforeListen: () => void;
    afterListen: () => void;

    constructor(obj: Partial<ListenerSubscribed>) {
        Object.assign(this, obj);
    }
}