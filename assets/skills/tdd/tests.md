# Good and Bad Tests

## Good Tests

**Integration-style**：通过真实的 interfaces 进行测试，而不是 mock 内部部件。

```typescript
// GOOD: Tests observable behavior
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

Characteristics（特征）：

- 测试 users/callers 真正关心的 behaviour
- 仅使用 public API
- 能够经受住内部 refactors
- 描述 WHAT，而非 HOW
- 每个 test 包含一个逻辑上的 assertion

## Bad Tests

**Implementation-detail tests**：与内部结构紧密耦合。

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```
Red flags（警示信号）：

- Mock 内部协作者（internal collaborators）
- 测试 private methods
- 断言调用次数或调用顺序（call counts/order）
- 在没有 behaviour 变更的情况下，refactoring 会导致 test 失败
- Test 命名描述的是 HOW 而不是 WHAT
- 通过外部手段而非 interface 来验证结果

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

**Tautological tests**：Expected value 只是重述了 implementation，导致 test 在构造上必然通过。

```typescript
// BAD: Expected value is recomputed the way the code computes it
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  const expected = items.reduce((sum, i) => sum + i.price, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: Expected value is an independent, known literal
test("calculateTotal sums line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```
