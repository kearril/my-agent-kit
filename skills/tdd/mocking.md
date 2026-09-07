# When to Mock

仅在 **system boundaries** 处进行 mock：

- 外部 APIs（payment、email 等）
- Databases（视情况而定——优先使用 test DB）
- 时间与随机数（Time/randomness）
- 文件系统（File system，视情况而定）

不要 mock：

- 你自己的 classes/modules
- 内部协作者（Internal collaborators）
- 任何处于你控制范围内的内容

## Designing for Mockability

在 system boundaries 处，设计易于 mock 的 interfaces：

**1. 使用 dependency injection**

通过参数将外部 dependencies 传入，而不是在内部直接创建它们：

```typescript
// Easy to mock
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Hard to mock
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. 优先采用 SDK 风格的 interfaces，而非通用的 fetchers**

为每项外部操作创建具体的 functions，而不是编写一个带有条件分支逻辑的通用 function：

```typescript
// GOOD: Each function is independently mockable
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch('/orders', { method: 'POST', body: data }),
};

// BAD: Mocking requires conditional logic inside the mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

SDK 方式的优势：
- 每个 mock 仅返回一种特定的 shape
- 在 test setup 中无需编写条件逻辑
- 更容易看清某个 test 涉及了哪些 endpoints
- 针对每个 endpoint 提供更优的 type safety
