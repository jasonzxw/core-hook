const GET_SUFFIX = '_get';
const SET_SUFFIX = '_set';
const DELETE_SUFFIX = '_delete';
const APPLY_SUFFIX = '_apply';

/**
 * CoreHook is an advanced proxy utility for adding hooks before/after object operations and function calls
 * Features: Intercept property access (get), property setting (set), property deletion (delete), and function invocation (apply)
 */
class CoreHook {
    // Use WeakMap to store hooks to prevent memory leaks
    private static hooks = new WeakMap<object | Function, Map<string, Function[]>>();
    
    // Map proxies to their original targets
    private static proxyToTarget = new WeakMap<object | Function, object | Function>();

    /**
     * Register hooks for property access (get) operations
     * @param target Target object
     * @param callbackList Array of callback functions
     * @param before Whether to trigger before operation (default: true)
     * @returns Proxy object
     */
    static registerGetHook<T extends object>(
        target: T,
        callbackList: Array<(target: T, key: string | symbol) => void>,
        before: boolean = true
    ): T {
        this.validateTarget(target, 'object');
        this.validateCallbacks(callbackList);
        
        const suffixName = `${GET_SUFFIX}${before}`;
        this.saveHooks(target, callbackList, suffixName);
        
        return this.createProxy(target, {
            get(obj, prop) {
                if (before) {
                    CoreHook.notifyHooks(target, suffixName, obj, prop);
                }
                
                const result = Reflect.get(obj, prop, obj);
                
                if (!before) {
                    CoreHook.notifyHooks(target, suffixName, obj, prop);
                }
                
                return result;
            }
        });
    }

    /**
     * Register hooks for property setting (set) operations
     * @param target Target object
     * @param callbackList Array of callback functions
     * @param before Whether to trigger before operation (default: true)
     * @returns Proxy object
     */
    static registerSetHook<T extends object>(
        target: T,
        callbackList: Array<(target: T, key: string | symbol, value: any) => void>,
        before: boolean = true
    ): T {
        this.validateTarget(target, 'object');
        this.validateCallbacks(callbackList);
        
        const suffixName = `${SET_SUFFIX}${before}`;
        this.saveHooks(target, callbackList, suffixName);
        
        return this.createProxy(target, {
            set(obj, prop, value) {
                if (before) {
                    CoreHook.notifyHooks(target, suffixName, obj, prop, value);
                }
                
                const success = Reflect.set(obj, prop, value, obj);
                
                if (!before && success) {
                    CoreHook.notifyHooks(target, suffixName, obj, prop, value);
                }
                
                return success;
            }
        });
    }

    /**
     * Register hooks for property deletion (delete) operations
     * @param target Target object
     * @param callbackList Array of callback functions
     * @param before Whether to trigger before operation (default: true)
     * @returns Proxy object
     */
    static registerDeleteHook<T extends object>(
        target: T,
        callbackList: Array<(target: T, key: string | symbol) => void>,
        before: boolean = true
    ): T {
        this.validateTarget(target, 'object');
        this.validateCallbacks(callbackList);
        
        const suffixName = `${DELETE_SUFFIX}${before}`;
        this.saveHooks(target, callbackList, suffixName);
        
        return this.createProxy(target, {
            deleteProperty(obj, prop) {
                if (before) {
                    CoreHook.notifyHooks(target, suffixName, obj, prop);
                }
                
                const success = Reflect.deleteProperty(obj, prop);
                
                if (!before && success) {
                    CoreHook.notifyHooks(target, suffixName, obj, prop);
                }
                
                return success;
            }
        });
    }

    /**
     * Register hooks for function invocation (apply) operations
     * @param target Target function
     * @param callbackList Array of callback functions
     * @param before Whether to trigger before operation (default: true)
     * @returns Proxy function
     */
    static registerApplyHook<T extends Function>(
        target: T,
        callbackList: Array<(target: T, thisArg: any, args: any[]) => void>,
        before: boolean = true
    ): T {
        this.validateTarget(target, 'function');
        this.validateCallbacks(callbackList);
        
        const suffixName = `${APPLY_SUFFIX}${before}`;
        this.saveHooks(target, callbackList, suffixName);
        
        return this.createProxy(target, {
            apply(fn, thisArg, args) {
                if (before) {
                    CoreHook.notifyHooks(target, suffixName, fn, thisArg, args);
                }
                
                const result = Reflect.apply(fn, thisArg, args);
                
                if (!before) {
                    CoreHook.notifyHooks(target, suffixName, fn, thisArg, args);
                }
                
                return result;
            }
        }) as T;
    }

    /**
     * Save hooks to storage
     * @param target Target object or function
     * @param callbacks Array of callback functions
     * @param type Hook type identifier
     */
    private static saveHooks(target: object | Function, callbacks: Function[], type: string): void {
        let typeMap = this.hooks.get(target);
        
        if (!typeMap) {
            typeMap = new Map<string, Function[]>();
            this.hooks.set(target, typeMap);
        }
        
        if (!typeMap.has(type)) {
            typeMap.set(type, []);
        }
        
        typeMap.get(type)!.push(...callbacks);
    }

    /**
     * Trigger hook notifications
     * @param target Target object or function
     * @param type Hook type identifier
     * @param args Arguments for callback functions
     */
    private static notifyHooks(target: object | Function, type: string, ...args: any[]): void {
        try {
            const typeMap = this.hooks.get(target);
            if (!typeMap) return;
            
            const hooks = typeMap.get(type);
            if (!hooks) return;
            
            for (const callback of hooks) {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Hook execution error: ${error}`);
                }
            }
        } catch (error) {
            console.error(`Hook notification error: ${error}`);
        }
    }

    /**
     * Create proxy wrapper
     * @param target Target object or function
     * @param handler Proxy handler configuration
     * @returns Proxy instance
     */
    private static createProxy<T extends object | Function>(
        target: T,
        handler: ProxyHandler<T>
    ): T {
        // Use raw target if already a proxy
        const rawTarget = this.getRawTarget(target);
        
        // Create new proxy
        const proxy = new Proxy(rawTarget, handler);
        
        // Store proxy-to-target mapping
        this.proxyToTarget.set(proxy, rawTarget);
        
        return proxy;
    }

    /**
     * Get original target (unwraps proxies)
     * @param target Potential proxy object
     * @returns Original target object
     */
    private static getRawTarget<T>(target: T): T {
        let current = target;
        while (this.proxyToTarget.has(current as object | Function)) {
            current = this.proxyToTarget.get(current as object | Function) as T;
        }
        return current;
    }

    /**
     * Validate target type
     * @param target Target to validate
     * @param expectedType Expected type ('object' or 'function')
     */
    private static validateTarget(target: any, expectedType: 'object' | 'function'): void {
        if (!target) {
            throw new TypeError('Target cannot be null or undefined');
        }
        
        if (expectedType === 'object' && (typeof target !== 'object' && typeof target !== 'function')) {
            throw new TypeError('Target must be an object');
        }
        
        if (expectedType === 'function' && typeof target !== 'function') {
            throw new TypeError('Target must be a function');
        }
    }

    /**
     * Validate callback list
     * @param callbackList Callbacks to validate
     */
    private static validateCallbacks(callbackList: any): void {
        if (!Array.isArray(callbackList)) {
            throw new TypeError('Callback list must be an array');
        }
        
        if (callbackList.length === 0) {
            throw new TypeError('Callback list cannot be empty');
        }
        
        for (const cb of callbackList) {
            if (typeof cb !== 'function') {
                throw new TypeError('Callback list must contain only functions');
            }
        }
    }

    /**
     * Clear all hooks for a target
     * @param target Target object or function
     */
    static clearTargetHooks(target: object | Function): void {
        const rawTarget = this.getRawTarget(target);
        this.hooks.delete(rawTarget);
    }

    /**
     * Get all hooks for a target
     * @param target Target object or function
     * @returns Map of hook types and their callbacks
     */
    static getTargetHooks(target: object | Function): Map<string, Function[]> | undefined {
        const rawTarget = this.getRawTarget(target);
        return this.hooks.get(rawTarget);
    }
}