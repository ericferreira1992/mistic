import { IScope } from "../../page/interfaces/scope.interface";
import { Page } from "../../page/page";
import { Dialog } from "../../dialog/classes/dialog";

export abstract class Directive {
    public selectors: string[];

    public selectorsApplied: {
        selector: string,
        content: any
    }[] = [];

    public all: Directive[] = [];

    public element?: HTMLElement;

    public scope: IScope;

    public render(action: () => void = null) {
        if (this.scope instanceof Page) {
            return this.scope.render(action);
        }
        else if (this.scope instanceof Dialog) {
            return this.scope.render(action);
        }
    }

    public compile(expression: string) {
        if (this.scope instanceof Page) {
            return this.scope.compile(expression);
        }
        else if (this.scope instanceof Dialog) {
            return this.scope.compile(expression);
        }
    }

    public get others() {
        return this.all.filter(x => x !== this);
    }

    constructor() {
    }

    /** Returns the value matched to the selector if it was entered */
    public getValueOfSelector(selector: string) {
        selector = this.pureSelector(selector);
        let selectorApplied = this.selectorsApplied.find(x => this.pureSelector(x.selector) === selector);
        if (selectorApplied) return selectorApplied.content;
        return null;
    }

    /** Change/Add the value matched to the selector if it was entered */
    public setValueOfSelector(selector: string, value: any) {
        let selectorApplied = this.selectorsApplied.find(x => this.pureSelector(x.selector) === this.pureSelector(selector));
        if (selectorApplied)
            selectorApplied.content = value;
        else {
            this.selectorsApplied.push({
                selector: selector,
                content: value,
            });
        }
    }

    /** Anothers directives can be applies in the same element. 
     * This method returns a directive searching for its selector name */
    public getDirectiveBySelector(selector: string) {
        selector = this.pureSelector(selector);
        return this.all.find(x => x.selectorsApplied.some(y => this.pureSelector(y.selector) === selector));
    }

    /** Return the selector without parentheses and bracket */
    public pureSelector(selector: string): string {
        return selector.replace(/\[|\(|\]|\)/g, '');
    }

    abstract resolve(selector: string, value: any): any;
    abstract onDestroy(selector: string, scope: IScope);
}

export class ResolverData {
    public selector: string;
    public content: any;
}