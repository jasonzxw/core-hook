# core-hook
This is a slicing programming tool class based on front-end objects or functions

# CoreHook API 使用文档

## 目录
- [core-hook](#core-hook)
- [CoreHook API 使用文档](#corehook-api-使用文档)
  - [目录](#目录)
  - [功能概述](#功能概述)
  - [核心概念](#核心概念)
  - [安装与导入](#安装与导入)
  - [API 方法](#api-方法)
    - [registerGetHook](#registergethook)
    - [registerSetHook](#registersethook)
    - [registerDeleteHook](#registerdeletehook)
    - [registerApplyHook](#registerapplyhook)
    - [清理钩子方法](#清理钩子方法)
  - [使用示例](#使用示例)
    - [对象属性访问日志](#对象属性访问日志)
    - [表单字段验证](#表单字段验证)
    - [函数调用监控](#函数调用监控)
    - [资源清理](#资源清理)
  - [注意事项](#注意事项)
  - [最佳实践](#最佳实践)

## 功能概述
`CoreHook` 是一个高级代理工具，允许开发者在对象属性访问(get)、属性设置(set)、属性删除(deleteProperty)和函数调用(apply)操作前后注入自定义逻辑。主要功能包括：

1. **拦截操作**：在对象操作执行前后添加钩子函数
2. **自定义逻辑**：实现日志记录、验证、性能监控等
3. **精细控制**：支持前置(before)和后置(after)钩子
4. **动态管理**：提供钩子的注册、通知和清理机制

## 核心概念
- **钩子(Hook)**：在特定操作前后执行的回调函数
- **前置钩子(Before Hook)**：在操作执行前触发的回调
- **后置钩子(After Hook)**：在操作执行后触发的回调
- **代理对象(Proxy)**：CoreHook返回的对象/函数代理，用于拦截操作

## 安装与导入
```typescript
// 通过npm安装
npm install core-hook-utils

// 在项目中导入
import { CoreHook } from 'core-hook-utils';
```

## API 方法

### registerGetHook
注册属性访问(get)操作的钩子

```typescript
static registerGetHook<T extends object>(
  target: T,
  callbackList: Array<(target: object, key: string | symbol) => void>,
  before: boolean = true
): T
```

**参数：**
| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|---------|------|
| target | object | ✓ | - | 要添加钩子的对象 |
| callbackList | 函数数组 | ✓ | - | 钩子触发时的回调函数 |
| before | boolean | ✗ | true | true=访问前触发，false=访问后触发 |

**返回值：**  
代理后的对象，保留原始对象的所有属性

---

### registerSetHook
注册属性设置(set)操作的钩子

```typescript
static registerSetHook<T extends object>(
  target: T,
  callbackList: Array<(target: object, key: string | symbol, value: any) => void>,
  before: boolean = true
): T
```

**参数：**
| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|---------|------|
| target | object | ✓ | - | 要添加钩子的对象 |
| callbackList | 函数数组 | ✓ | - | 钩子触发时的回调函数 |
| before | boolean | ✗ | true | true=设置前触发，false=设置后触发 |

**回调参数：**  
`(target, key, value)` - value为要设置的新值

**返回值：**  
代理后的对象

---

### registerDeleteHook
注册属性删除(deleteProperty)操作的钩子

```typescript
static registerDeleteHook<T extends object>(
  target: T,
  callbackList: Array<(target: object, key: string | symbol) => void>,
  before: boolean = true
): T
```

**参数：**
| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|---------|------|
| target | object | ✓ | - | 要添加钩子的对象 |
| callbackList | 函数数组 | ✓ | - | 钩子触发时的回调函数 |
| before | boolean | ✗ | true | true=删除前触发，false=删除后触发 |

**返回值：**  
代理后的对象

---

### registerApplyHook
注册函数调用(apply)操作的钩子

```typescript
static registerApplyHook<T extends Function>(
  target: T,
  callbackList: Array<(target: Function, thisArg: any, args: any[]) => void>,
  before: boolean = true
): T
```

**参数：**
| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|---------|------|
| target | Function | ✓ | - | 要添加钩子的函数 |
| callbackList | 函数数组 | ✓ | - | 钩子触发时的回调函数 |
| before | boolean | ✗ | true | true=调用前触发，false=调用后触发 |

**回调参数：**  
`(target, thisArg, args)`  
- thisArg: 函数调用的this值
- args: 函数调用参数数组

**返回值：**  
代理后的函数

---

### 清理钩子方法
| 方法名 | 描述 |
|--------|------|
| `clearGetBeforeHook(target)` | 清除对象的所有前置get钩子 |
| `clearGetAfterHook(target)` | 清除对象的所有后置get钩子 |
| `clearSetBeforeHook(target)` | 清除对象的所有前置set钩子 |
| `clearSetAfterHook(target)` | 清除对象的所有后置set钩子 |
| `clearDeleteBeforeHook(target)` | 清除对象的所有前置delete钩子 |
| `clearDeleteAfterHook(target)` | 清除对象的所有后置delete钩子 |
| `clearApplyBeforeHook(target)` | 清除函数的所有前置apply钩子 |
| `clearApplyAfterHook(target)` | 清除函数的所有后置apply钩子 |
| `clearTargetHooks(target)` | 清除目标的所有钩子 |

## 使用示例

### 对象属性访问日志
```typescript
const config = { 
  apiKey: '12345-ABCDE', 
  endpoint: 'https://api.example.com' 
};

// 添加前置get钩子（访问属性前记录）
const monitoredConfig = CoreHook.registerGetHook(config, [
  (obj, key) => console.log(`[访问] 配置属性: ${String(key)}`)
], true);

console.log(monitoredConfig.apiKey);
// 输出: [访问] 配置属性: apiKey
//       12345-ABCDE
```

### 表单字段验证
```typescript
const userForm = { 
  name: '', 
  email: '', 
  age: 0 
};

// 添加前置set钩子（设置前验证）
const validatedForm = CoreHook.registerSetHook(userForm, [
  (obj, key, value) => {
    if (key === 'email' && !value.includes('@')) {
      throw new Error('无效的邮箱格式');
    }
    if (key === 'age' && (value < 18 || value > 120)) {
      throw new Error('年龄必须在18-120之间');
    }
  }
], true);

validatedForm.email = 'user@example.com'; // 成功
validatedForm.age = 25; // 成功

try {
  validatedForm.email = 'invalid-email'; // 抛出错误
} catch (e) {
  console.error(e.message); // 无效的邮箱格式
}
```

### 函数调用监控
```typescript
function processData(data: string): string {
  console.log('处理数据...');
  return data.toUpperCase();
}

// 添加前置钩子（记录开始时间）
let startTime: number;
const timedProcess = CoreHook.registerApplyHook(processData, [
  (fn, thisArg, args) => {
    console.log(`调用函数: ${fn.name}，参数: ${args}`);
    startTime = performance.now();
  }
], true);

// 添加后置钩子（记录执行时间）
CoreHook.registerApplyHook(timedProcess, [
  (fn, thisArg, args) => {
    const duration = performance.now() - startTime;
    console.log(`函数执行完成，耗时: ${duration.toFixed(2)}ms`);
  }
], false);

const result = timedProcess('hello world');
// 输出: 调用函数: processData，参数: hello world
//       处理数据...
//       函数执行完成，耗时: 2.45ms
console.log(result); // HELLO WORLD
```

### 资源清理
```typescript
const resource = {
  connection: null,
  data: []
};

// 添加delete钩子（删除属性前清理资源）
const managedResource = CoreHook.registerDeleteHook(resource, [
  (obj, key) => {
    if (key === 'connection' && obj.connection) {
      console.log('关闭数据库连接...');
      // 实际清理代码
      obj.connection.close();
    }
  }
], true);

// 使用资源...
managedResource.connection = { close: () => console.log('连接已关闭') };

// 删除属性触发钩子
delete managedResource.connection; 
// 输出: 关闭数据库连接...
//       连接已关闭

// 清理所有钩子
CoreHook.clearTargetHooks(managedResource);
```

## 注意事项
1. **标识限制**：
   - 对象钩子使用`JSON.stringify()`作为标识
   - 函数钩子使用函数名作为标识
   - 匿名函数可能导致冲突

2. **性能考虑**：
   - 代理操作引入额外开销
   - 避免在高频操作中使用
   - 保持钩子函数轻量级

3. **错误处理**：
   - 钩子内的错误会传播到主操作
   - 使用try/catch处理关键操作

4. **序列化限制**：
   - 包含循环引用的对象无法被正确序列化
   - Symbol属性会被转换为字符串

5. **多层代理**：
   - 对同一目标多次添加钩子会创建多层代理
   - 可能导致意外行为

## 最佳实践
1. **监控与调试**：
   ```typescript
   // 添加后置钩子记录操作
   CoreHook.registerSetHook(obj, [
     (t, k, v) => console.log(`属性 ${k} 已更新: ${v}`)
   ], false);
   ```

2. **数据验证**：
   ```typescript
   // 前置钩子验证输入
   CoreHook.registerSetHook(formData, [
     (t, k, v) => validateField(k, v)
   ], true);
   ```

3. **资源管理**：
   ```typescript
   // 删除属性前释放资源
   CoreHook.registerDeleteHook(resource, [
     (t, k) => cleanupResource(k)
   ], true);
   ```

4. **性能优化**：
   ```typescript
   // 使用后及时清理钩子
   function tempMonitoring(obj) {
     const proxy = CoreHook.registerGetHook(obj, [...]);
     // 监控操作...
     CoreHook.clearTargetHooks(proxy);
   }
   ```

5. **错误边界**：
   ```typescript
   // 钩子内添加错误处理
   CoreHook.registerApplyHook(fn, [
     (target, thisArg, args) => {
       try {
         // 敏感操作
       } catch (e) {
         console.error('钩子执行失败', e);
       }
     }
   ]);
   ```
