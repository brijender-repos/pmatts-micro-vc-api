# Investments Table Insert Locations

## Summary

After analyzing the entire codebase, I found **2 main locations** where records are inserted into the "investments" table in Supabase:

## 1. `src/controllers/verifyPayment.js` - Line 153

**Context**: Payment verification endpoint that processes PayU payment callbacks

**Location**: ```153:153:src/controllers/verifyPayment.js
const { error: insertError } = await supabaseAdmin
  .from('investments')
  .insert(investmentData);
```

**Trigger Conditions**:
- ✅ Only for `paymentStatus === 'success'` (successful transactions)
- ✅ Only when `existingInvestment` is not found
- ✅ After user and project validation passes

**Data Structure**:
```javascript
const investmentData = {
  user_id: userData.user_id,
  project_name: data.productinfo,
  project_id: projectData.id,
  amount: parseFloat(data.amount) || 0,
  units: (parseFloat(data.amount) || 0) / 1000,
  transaction_status: 'success',
  payment_mode: data.mode || 'Others',
  investment_status: 'Fully Settled',
  transaction_id: payUReferenceId,
  txnid: txnid,
  updated_at: new Date().toISOString(),
};
```

**Validation Checks**:
- User exists in profiles table (by email)
- Project exists in projects table (by project_name)
- Transaction status is 'success'

## 2. `src/controllers/syncPayuTransactions.js` - Line 384

**Context**: PayU transaction synchronization endpoint that syncs transactions from PayU to Supabase

**Location**: ```384:384:src/controllers/syncPayuTransactions.js
const { error: insertError } = await supabaseAdmin
  .from('investments')
  .insert(investmentData);
```

**Trigger Conditions**:
- ✅ Only for `txn.status === 'captured'` (successful transactions)
- ✅ Only when `existingInvestment` is not found
- ✅ After user and project validation passes

**Data Structure**:
```javascript
const investmentData = {
  user_id: userData.user_id,
  project_name: transaction.productinfo,
  project_id: projectData.id,
  amount: parseFloat(transaction.amount) || 0,
  units: (parseFloat(transaction.amount) || 0) / 1000,
  transaction_status: 'success',
  payment_mode: transaction.mode || 'Others',
  investment_status: 'Fully Settled',
  transaction_id: transaction.id,
  txnid: transaction.txnid,
  updated_at: new Date().toISOString(),
};
```

**Validation Checks**:
- User exists in profiles table (by email)
- Project exists in projects table (by project_name)
- Transaction status is 'captured' (successful)

## Key Observations

### ✅ **Success-Only Insertions**
Both locations only insert investments for **successful transactions**:
- `verifyPayment.js`: `paymentStatus === 'success'`
- `syncPayuTransactions.js`: `txn.status === 'captured'`

### ✅ **Duplicate Prevention**
Both locations check for existing investments before inserting:
- Uses combination of `txnid` and `transaction_id`/`payureference_id`
- Only inserts if no existing investment found

### ✅ **Data Validation**
Both locations perform comprehensive validation:
- User existence check
- Project existence check
- Transaction status validation

### ✅ **Consistent Data Structure**
Both locations use the same investment data structure with:
- User and project references
- Transaction details
- Status set to 'success' and 'Fully Settled'
- Proper timestamps

## Other Files That Reference Investments

### 📧 `src/controllers/email.js`
- **Purpose**: Sends investment portfolio summary emails
- **Operation**: READ-ONLY - only displays investment data
- **No Insertions**: This file does not insert into investments table

### 🧹 Cleanup Operations
**Note**: Cleanup operations have been removed as requested. Failed transactions will no longer automatically delete existing investments.

## Database Operations Summary

| Operation | Location | Condition |
|-----------|----------|-----------|
| **INSERT** | `verifyPayment.js:153` | Successful payment verification |
| **INSERT** | `syncPayuTransactions.js:384` | Successful transaction sync |
| **UPDATE** | `verifyPayment.js:91` | Existing investment update |
| **UPDATE** | `syncPayuTransactions.js:363` | Existing investment update |
| **DELETE** | `verifyPayment.js:165` | ~~Failed transaction cleanup~~ (Removed) |
| **DELETE** | `syncPayuTransactions.js:278` | ~~Failed transaction cleanup~~ (Removed) |

## Recommendations

1. **✅ Current Implementation is Secure**: Both insert locations have proper validation and success-only logic
2. **✅ No Orphaned Insertions**: All insertions are properly validated and conditional
3. **✅ Consistent Data**: Both locations use the same data structure and validation
4. **✅ No Automatic Cleanup**: Failed transactions are not automatically deleted (as requested)

## Testing Checklist

- [ ] Test successful payment verification creates investment
- [ ] Test failed payment verification does NOT create investment
- [ ] Test successful transaction sync creates investment
- [ ] Test failed transaction sync does NOT create investment
- [ ] Test duplicate prevention works correctly
- [ ] Test failed transactions do NOT delete existing investments
- [ ] Test user/project validation prevents invalid insertions 