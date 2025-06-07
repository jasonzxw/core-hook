# CoreHook - Advanced Proxy Hooks Utility

## Overview
CoreHook is a powerful TypeScript utility that enables intercepting operations on objects and functions using JavaScript's Proxy API. It allows developers to inject custom logic before or after:

- Property access (`get`)
- Property assignment (`set`)
- Property deletion (`deleteProperty`)
- Function invocation (`apply`)

Key features:
- 🛡️ Memory-safe implementation using WeakMap
- ⚡ Lightweight and performant
- 🔍 Support for both objects and functions
- 🧩 Modular hook registration
- 🧹 Automatic garbage collection
- 🔧 Full TypeScript support

## Installation
```bash
npm install core-hook-utils
```

```typescript
import { CoreHook } from 'core-hook-utils';
```

## API Reference

### `registerGetHook()`
Registers hooks for property access operations.

```typescript
static registerGetHook<T extends object>(
  target: T,
  callbackList: Array<(target: T, key: string | symbol) => void>,
  before: boolean = true
): T
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| target | `object` | Yes | - | Target object to monitor |
| callbackList | `Function[]` | Yes | - | Array of callback functions |
| before | `boolean` | No | `true` | Trigger before operation |

**Returns:**  
Proxy object with get hooks applied

---

### `registerSetHook()`
Registers hooks for property assignment operations.

```typescript
static registerSetHook<T extends object>(
  target: T,
  callbackList: Array<(target: T, key: string | symbol, value: any) => void>,
  before: boolean = true
): T
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| target | `object` | Yes | - | Target object to monitor |
| callbackList | `Function[]` | Yes | - | Array of callback functions |
| before | `boolean` | No | `true` | Trigger before operation |

**Returns:**  
Proxy object with set hooks applied

---

### `registerDeleteHook()`
Registers hooks for property deletion operations.

```typescript
static registerDeleteHook<T extends object>(
  target: T,
  callbackList: Array<(target: T, key: string | symbol) => void>,
  before: boolean = true
): T
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| target | `object` | Yes | - | Target object to monitor |
| callbackList | `Function[]` | Yes | - | Array of callback functions |
| before | `boolean` | No | `true` | Trigger before operation |

**Returns:**  
Proxy object with delete hooks applied

---

### `registerApplyHook()`
Registers hooks for function invocation operations.

```typescript
static registerApplyHook<T extends Function>(
  target: T,
  callbackList: Array<(target: T, thisArg: any, args: any[]) => void>,
  before: boolean = true
): T
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| target | `Function` | Yes | - | Target function to monitor |
| callbackList | `Function[]` | Yes | - | Array of callback functions |
| before | `boolean` | No | `true` | Trigger before operation |

**Returns:**  
Proxy function with apply hooks applied

---

### `clearTargetHooks()`
Removes all hooks associated with a target.

```typescript
static clearTargetHooks(target: object | Function): void
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| target | `object | Function` | Target to clear hooks from |

---

### `getTargetHooks()`
Retrieves all hooks registered for a target.

```typescript
static getTargetHooks(
  target: object | Function
): Map<string, Function[]> | undefined
```

**Returns:**  
Map of hook types and their callbacks, or `undefined` if no hooks exist

## Usage Examples

### 1. Property Access Logging
```typescript
const user = { name: 'Alice', age: 30 };

const monitoredUser = CoreHook.registerGetHook(user, [
  (target, key) => console.log(`Accessed property: ${String(key)}`)
], true);

console.log(monitoredUser.name);
// Output: Accessed property: name
//         Alice
```

### 2. Input Validation
```typescript
const config = { apiKey: '' };

const validatedConfig = CoreHook.registerSetHook(config, [
  (target, key, value) => {
    if (key === 'apiKey' && value.length < 10) {
      throw new Error('API key must be at least 10 characters');
    }
  }
], true);

validatedConfig.apiKey = '1234567890';  // Success
validatedConfig.apiKey = 'short';       // Throws error
```

### 3. Function Performance Monitoring
```typescript
function processData(data: string) {
  return data.toUpperCase();
}

const timedFunction = CoreHook.registerApplyHook(processData, [
  (target, thisArg, args) => console.time('processData'),
  (target, thisArg, args) => console.timeEnd('processData')
], false);

timedFunction('test');
// Output: processData: 0.102ms
```

### 4. Automatic Resource Cleanup
```typescript
const resource = { connection: null };

const managedResource = CoreHook.registerDeleteHook(resource, [
  (target, key) => {
    if (key === 'connection' && target.connection) {
      console.log('Closing connection...');
      target.connection.close();
    }
  }
], true);

managedResource.connection = { close: () => console.log('Closed') };
delete managedResource.connection;
// Output: Closing connection...
//         Closed
```

## Best Practices

### 1. Lifecycle Management
```typescript
class SecureService {
  private data: any = {};
  private dataProxy: any;

  constructor() {
    this.dataProxy = CoreHook.registerSetHook(this.data, [
      this.validateData.bind(this)
    ], true);
  }

  private validateData(target: any, key: string, value: any) {
    // Validation logic
  }

  cleanup() {
    CoreHook.clearTargetHooks(this.data);
  }
}
```

### 2. Performance Monitoring
```typescript
function withPerfMonitoring<T extends Function>(fn: T): T {
  return CoreHook.registerApplyHook(fn, [
    (target, thisArg, args) => console.time(target.name),
    (target, thisArg, args) => console.timeEnd(target.name)
  ], false);
}

const monitoredFn = withPerfMonitoring(myFunction);
```

### 3. Debugging Utilities
```typescript
function debugHooks(target: object | Function) {
  const hooks = CoreHook.getTargetHooks(target);
  if (hooks) {
    console.log(`Target has ${hooks.size} hook types:`);
    for (const [type, callbacks] of hooks) {
      console.log(`- ${type}: ${callbacks.length} callbacks`);
    }
  }
}
```

### 4. Asynchronous Operations
```typescript
CoreHook.registerApplyHook(asyncFunction, [
  async (target, thisArg, args) => {
    await preProcess();
    console.log('Pre-processing complete');
  }
], true);
```

## Important Notes

1. **Proxy Chains**  
   Multiple registrations on the same target create proxy chains. Use `getRawTarget()` to access the original object.

2. **Symbol Properties**  
   Symbol keys are preserved in their original form during hook notifications.

3. **Error Handling**  
   Hook errors are caught and logged but don't interrupt main execution:
   ```
   Hook execution error: [Error message]
   ```

4. **Memory Management**  
   Unused targets are automatically garbage collected via WeakMap.

5. **Function Identifiers**  
   Anonymous functions are assigned unique identifiers using Symbols.

6. **Performance Considerations**  
   For high-frequency operations, minimize hook complexity and:
   - Use `before: false` for non-critical operations
   - Avoid deep object inspection in hooks
   - Use `clearTargetHooks()` when hooks are no longer needed

7. **Type Safety**  
   The API maintains strict TypeScript typing throughout operations.