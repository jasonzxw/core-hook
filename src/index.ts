const GET_SUFFIX = '_get';
const SET_SUFFIX = '_set';
const DELETE_SUFFIX = '_delete';
const APPLY_SUFFIX = '_apply'; 

/**
 * CoreHook is a utility class that provides hooks for object and function operations.
 */
class CoreHook{
    /**
     * A map to store hooks for different targets and types.
     */
    private static hooks: Map<string, Array<Function>> = new Map();

    /**
     * Registers a get hook for an object
     * @param target The target object to register the hook on.
     * @param callbackList An array of callback functions to be called when the hook is triggered.
     * @param before If true, the hook is called before the operation; if false, after.
     * @returns A proxy of the target with the get hook applied.
     */
    static registerGetHook<T extends object>(target: T,callbackList:Array<(target: object , key: string | symbol)=>void> , before: boolean = true): T {
        if (!target || typeof target !== 'object' && typeof target !== 'function') {
            throw new TypeError('Target must be an object.');
        }
        if (!Array.isArray(callbackList) || callbackList.length === 0) {
            throw new TypeError('Callback list must be a non-empty array.');
        }
        let suffixName = before ? GET_SUFFIX + String(true) : GET_SUFFIX + String(false);
        CoreHook.saveHooks(target, callbackList, suffixName);
        return new Proxy(target, {
            get(obj, prop) {
                if(before){
                    CoreHook.notifyHooks(target, suffixName, target, prop.toString());
                }
                let result = obj[prop as keyof T];
                if(!before){
                    CoreHook.notifyHooks(target, suffixName, target, prop.toString());
                }
                return result;
            }
        });
    }

    /**
     * @description Registers a set hook for an object.
     * @param target {object} The target object to register the hook on.
     * @param callbackList {Array<(target: object , key: string | symbol, value: any)>} An array of callback functions to be called when the hook is triggered.
     * @param before {boolean} If true, the hook is called before the operation; if false, after.
     * @returns 
     */
    static registerSetHook<T extends object>(target: T, callbackList: Array<(target: object , key: string | symbol, value: any)=>void>, before: boolean = true): T {
        if (!target || typeof target !== 'object' && typeof target !== 'function') {
            throw new TypeError('Target must be an object.');
        }
        if (!Array.isArray(callbackList) || callbackList.length === 0) {
            throw new TypeError('Callback list must be a non-empty array.');
        }
        let suffixName = before ? SET_SUFFIX + String(true) : SET_SUFFIX + String(false);
        CoreHook.saveHooks(target, callbackList, suffixName);
        return new Proxy(target, {
            set(obj, prop, value) {
                if(before){
                    CoreHook.notifyHooks(target, suffixName, target, prop.toString(), value);
                }
                obj[prop as keyof T] = value;
                if(!before){
                    CoreHook.notifyHooks(target, suffixName, target, prop.toString(), value);
                }
                return true;
            }
        });
    }

    /**
     * @description Registers a delete hook for an object.
     * @param target {object} The target object to register the delete hook on.
     * @param callbackList {Array<(target: object , key: string | symbol)>} An array of callback functions to be called when the hook is triggered.
     * @param before {boolean} If true, the hook is called before the operation; if false, after.
     * @returns 
     */
    static registerDeleteHook<T extends object>(target: T, callbackList: Array<(target: object , key: string | symbol)=>void>, before: boolean = true): T {
        if (!target || typeof target !== 'object' && typeof target !== 'function') {
            throw new TypeError('Target must be an object.');
        }
        if (!Array.isArray(callbackList) || callbackList.length === 0) {
            throw new TypeError('Callback list must be a non-empty array.');
        }
        let suffixName = before ? DELETE_SUFFIX + String(true) : DELETE_SUFFIX + String(false);
        CoreHook.saveHooks(target, callbackList, suffixName);
        return new Proxy(target, {
            deleteProperty(obj, prop) {
                if(before){
                    CoreHook.notifyHooks(target, suffixName, target, prop.toString());
                }
                delete obj[prop as keyof T];
                if(!before){
                    CoreHook.notifyHooks(target, suffixName, target, prop.toString());
                }
                return true;
            }
        });
    }

    /**
     * @description Registers an apply hook for a function.
     * @param target {Function} The target function to register the apply hook on.
     * @param callbackList {{Array<(target: Function, thisArg: any, args: any[])=>void>} An array of callback functions to be called when the hook is triggered.}
     * @param before {boolean} If true, the hook is called before the operation; if false, after.
     * @returns 
     */
    static registerApplyHook<T extends Function>(target: T, callbackList: Array<(target: Function, thisArg: any, args: any[])=>void> , before:boolean = true): T {
        if (!target || typeof target !== 'function') {
            throw new TypeError('Target must be a function.');
        }
        if (!Array.isArray(callbackList) || callbackList.length === 0) {
            throw new TypeError('Callback list must be a non-empty array.');
        }
        let suffixName = before ? APPLY_SUFFIX + String(true) : APPLY_SUFFIX + String(false);
        CoreHook.saveHooks(target, callbackList, suffixName);
        return new Proxy(target, {
            apply(target, thisArg, args) {
                if(before){
                    CoreHook.notifyHooks(target, suffixName, target, thisArg, args);
                }
                let result = Reflect.apply(target, thisArg, args);
                if(!before){
                    CoreHook.notifyHooks(target, suffixName, target, thisArg, args);
                }
                return result;
            }
        });
    }
    /**
     * @description Saves hooks for a target object or function.
     * @param target {object | Function} The target object or function to save hooks for.
     * @param callback {Array<Function>} An array of callback functions to be called when the hook is triggered.
     * @param type {string} The type of hook to save (e.g., '_get', '_set', '_delete', '_apply').
     */
    static saveHooks(target: object | Function, callback: Array<Function> , type: string): void {
        let name = this.getHookName(target, type);
        if (!this.hooks.has(name)) {
            this.hooks.set(name, []);
        }
        this.hooks.get(name)?.push(...callback);
    }

    /**
     * @description Notifies hooks for a target object or function.
     * @param target {object | Function} The target object or function to notify hooks for.
     * @param type {   string} The type of hook to notify (e.g., '_get', '_set', '_delete', '_apply').
     * @param args {any[]} The arguments to pass to the hook callbacks.
     */
    static notifyHooks(target: object | Function, type: string , ...args: any[]): void {
        const name = this.getHookName(target, type);
        if (this.hooks.has(name)) {
            this.hooks.get(name)?.forEach(callback => callback(...args));
        }
    }

    /**
     * @description Clears all before hooks for a target object
     */
    static clearGetBeforeHook(target: object): void {
        const name = JSON.stringify(target) + GET_SUFFIX + String(true);
        if (this.hooks.has(name)) {
            this.hooks.delete(name);
        } 
    }

    /**
     * @description Clears all after hooks for a target object
     * @param target {object} The target object to clear the after get hook for.
     */
    static clearGetAfterHook(target: object): void {
        const name = JSON.stringify(target) + GET_SUFFIX + String(false);
        if (this.hooks.has(name)) {
            this.hooks.delete(name);
        }
    }

    /**
     * @description Clears all before set hooks for a target object.
     * @param target {object} The target object to clear the before set hook for.
     */
    static clearSetBeforeHook(target: object): void {
        const name = JSON.stringify(target) + SET_SUFFIX + String(true);
        if (this.hooks.has(name)) {
            this.hooks.delete(name);
        }
    }

    /**
     * @description Clears all after set hooks for a target object.
     * @param target {object} The target object to clear the after set hook for.
     */
    static clearSetAfterHook(target: object): void {
        const name = JSON.stringify(target) + SET_SUFFIX + String(false);
        if (this.hooks.has(name)) {
            this.hooks.delete(name);
        }
    }

    /**
     * @description Clears all before delete hooks for a target object.
     * @param target {object} The target object to clear the before delete hook for.
     */
    static clearDeleteBeforeHook(target: object): void {
        const name = JSON.stringify(target) + DELETE_SUFFIX + String(true);
        if (this.hooks.has(name)) {
            this.hooks.delete(name);
        }
    }

    /**
     * @description Clears all after delete hooks for a target object.
     * @param target {object} The target object to clear the after delete hook for.
     */
    static clearDeleteAfterHook(target: object): void {
        const name = JSON.stringify(target) + DELETE_SUFFIX + String(false);
        if (this.hooks.has(name)) {
            this.hooks.delete(name);
        }
    }

    /**
     * @description Clears all before apply hooks for a target function.
     * @param target {Function} The target function to clear the before apply hook for.
     */
    static clearApplyBeforeHook(target: Function): void {
        const name = target.name + APPLY_SUFFIX + String(true);
        if (this.hooks.has(name)) {
            this.hooks.delete(name);
        }
    }

    /**
     * @description Clears all after apply hooks for a target function.
     * @param target {Function} The target function to clear the after apply hook for.
     */
    static clearApplyAfterHook(target: Function): void {
        const name = target.name + APPLY_SUFFIX + String(false);
        if (this.hooks.has(name)) {
            this.hooks.delete(name);
        }
    }

    /**
     * @description Clears all hooks for a target object or function.
     * @param target {object | Function} The target object or function to clear all hooks for.
     */
    static clearTargetHooks(target: object | Function): void {
        if( typeof target === 'function') {
            this.clearApplyBeforeHook(target);
            this.clearApplyAfterHook(target);
        }else{
            this.clearGetBeforeHook(target);
            this.clearGetAfterHook(target);
            this.clearSetBeforeHook(target);
            this.clearSetAfterHook(target);
            this.clearDeleteBeforeHook(target);
            this.clearDeleteAfterHook(target);
        }
    }

    static getHookName(target: object | Function, type: string): string {
        if (typeof target === 'function') {
            return target.name + type;
        } else {
            return JSON.stringify(target) + type;
        }
    }
}