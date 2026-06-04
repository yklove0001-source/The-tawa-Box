# Security Specification for The Tawa Box

## 1. Data Invariants
1. **UserProfile Integrity**: A user can only access, create, or modify their own user profile document. The document ID must match their Firebase Auth UID (`request.auth.uid`). Users are forbidden from altering internal RBAC fields or subscription status directly without proper service verification.
2. **Order Authority**: An order must belong to a authenticated user with a UID. Users cannot create orders under other users' names or mismatching UIDs.
3. **Admin Exclusivity**: Only the authorized administrator (`yklove0001@gmail.com`) is allowed to query all orders, sort orders, and update order statuses (e.g. from `pending` to `preparing`).
4. **Order Status Lifecycle**: Once an order reaches a terminal status or is placed, standard users can only cancel their own pending/preparing orders but cannot arbitrary shift status to 'delivered'.

---

## 2. The "Dirty Dozen" Malicious Payloads
Here are 12 malicious payload signatures designed to exploit vulnerabilities if rules are not hardened:

### Payload 1: Profile Theft (Identity Hijack)
An attacker tries to update someone else's user profile with their own data.
`path: /users/attacker_uid, content: { uid: "victim_uid", name: "Attacker Name", email: "victim@email.com" }`

### Payload 2: Self-Appointed VIP Subscription (Privilege Escalation)
A standard user attempts to write themselves a lifetime pro monthly subscription.
`path: /users/user_uid, content: { subscription: { plan: "monthly_pro", status: "active", expiresAt: "2030-12-31" } }`

### Payload 3: Spoofed Order Placement (Identity Forgery)
A user signs in as `user_uid` but submits an order with `userId: "victim_uid"`.
`path: /orders/order_123, content: { userId: "victim_uid", items: [...], totalAmount: 500 }`

### Payload 4: Free Food Hack (Price Zeroing)
A user tries to place an order setting the total price to exactly zero or a negative value.
`path: /orders/order_124, content: { userId: "user_uid", totalAmount: -100, status: "pending" }`

### Payload 5: Remote Admin Status Promotion (Privilege Escalation)
A standard user attempts to write themselves as an Admin or bypass the email check.
`path: /users/user_uid, content: { isAdmin: true }`

### Payload 6: Force-Fulfill Order (State Escalation)
A customer tries to change their order status from `pending` directly to `delivered` to falsely claim they received food without paying.
`path: /orders/order_123, patch: { status: "delivered" }`

### Payload 7: Denial of Wallet (ID Poisoning)
An attacker injects a 2MB junk text string as the document ID path variable to consume massive storage/indexing bytes.
`path: /orders/A_VERY_LONG_GARBAGE_STRING_REPEATED_2_THOUSAND_TIMES, content: { ... }`

### Payload 8: Blanket Query Scraping
Unauthenticated guest tries to list all user profiles to harvest active emails.
`path: /users` (list query)

### Payload 9: Hijack Admin Sorting / Order Access
A malicious user tries to list all general orders currently in prepare state.
`path: /orders` (list all query where they filter for status == 'preparing')

### Payload 10: Sibling Document Corruption
A user attempts to batch update their delivery address inside their profile and simultaneously delete a related pending order to escape payment.
`path: batch [delete /orders/order_123, set /users/user_uid]`

### Payload 11: Phantom Date Tampering
A user submits an order setting the order time to a date in the past or far future to bypass fresh cooking rules.
`path: /orders/order_125, content: { createdAt: "1970-01-01T00:00:00Z" }`

### Payload 12: Injected Ghost Field (Metadata Exploit)
An attacker tries to write unrecognized fields (e.g. `isStaffDiscountApplied`) inside their order payload.
`path: /orders/order_126, content: { isStaffDiscountApplied: true, userId: "user_uid", ... }`

---

## 3. Test Runner Design Blueprint (`firestore.rules.test.ts`)
```typescript
import { assertFails } from '@firebase/rules-unit-testing';

describe('The Tawa Box Firestore Fortress Constraints', () => {
  it('rejects Payload 1: Profile Theft', async () => {
    const maliciousPayload = { uid: "victim_uid", name: "Attacker", email: "victim@email.com" };
    const db = getContext({ uid: 'attacker_uid' }).firestore();
    await assertFails(db.doc('users/victim_uid').set(maliciousPayload));
  });

  it('rejects Payload 2: Self-Appointed Subscription', async () => {
    const maliciousPayload = { subscription: { plan: "monthly_pro", status: "active" } };
    const db = getContext({ uid: 'user_uid' }).firestore();
    await assertFails(db.doc('users/user_uid').update(maliciousPayload));
  });

  it('rejects Payload 3: Spoofed Order Placement', async () => {
    const maliciousPayload = { userId: "victim_uid", totalAmount: 200, status: "pending" };
    const db = getContext({ uid: 'user_uid' }).firestore();
    await assertFails(db.doc('orders/order_123').set(maliciousPayload));
  });

  it('rejects Payload 5: Remote Admin Status Promotion', async () => {
    const db = getContext({ uid: 'user_uid' }).firestore();
    await assertFails(db.doc('users/user_uid').update({ isAdmin: true }));
  });
});
```
