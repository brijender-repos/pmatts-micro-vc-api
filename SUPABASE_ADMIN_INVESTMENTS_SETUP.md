# Supabase Admin Role for Investments Table Operations

## Overview

All investment table operations (INSERT, UPDATE, DELETE, SELECT) are performed using the **Supabase Admin role** (`supabaseAdmin`) to bypass Row Level Security (RLS) policy restrictions.

## Current Implementation

### ✅ **All Operations Use supabaseAdmin**

Both files consistently use `supabaseAdmin` for all investment operations:

#### 1. `src/controllers/syncPayuTransactions.js`

**Investment Operations:**
```javascript
// SELECT - Check existing investment
const { data: existingInvestment, error: checkError } = await supabaseAdmin
  .from('investments')
  .select('id, txnid, transaction_id')
  .eq('txnid', transaction.txnid)
  .eq('transaction_id', transaction.id)
  .maybeSingle();

// UPDATE - Update existing investment
const { error: updateError } = await supabaseAdmin
  .from('investments')
  .update(investmentData)
  .eq('txnid', transaction.txnid)
  .eq('transaction_id', transaction.id);

// INSERT - Create new investment
const { error: insertError } = await supabaseAdmin
  .from('investments')
  .insert(investmentData);
```

#### 2. `src/controllers/verifyPayment.js`

**Investment Operations:**
```javascript
// SELECT - Check existing investment
const { data: existingInvestment, error: checkError } = await supabaseAdmin
  .from('investments')
  .select('id')
  .eq('txnid', txnid)
  .eq('transaction_id', payUReferenceId)
  .maybeSingle();

// UPDATE - Update existing investment
const { error: investmentUpdateError } = await supabaseAdmin
  .from('investments')
  .update({
    transaction_status: paymentStatus,
    investment_status: 'Fully Settled',
    updated_at: new Date().toISOString(),
  })
  .eq('txnid', txnid)
  .eq('transaction_id', payUReferenceId);

// INSERT - Create new investment
const { error: insertError } = await supabaseAdmin
  .from('investments')
  .insert(investmentData);

// DELETE - Remove failed investments (if enabled)
const { error: deleteError } = await supabaseAdmin
  .from('investments')
  .delete()
  .eq('txnid', txnid)
  .eq('transaction_id', payUReferenceId);
```

## Key Benefits of Using supabaseAdmin

### 1. **Bypasses RLS Policies**
- ✅ No Row Level Security restrictions
- ✅ Can access all records regardless of user context
- ✅ No need to set user context or authentication

### 2. **Consistent Access**
- ✅ Same permissions across all environments
- ✅ No dependency on user authentication state
- ✅ Reliable for background/scheduled operations

### 3. **Error Prevention**
- ✅ Avoids "permission denied" errors
- ✅ Consistent behavior regardless of user roles
- ✅ Suitable for server-side operations

## Database Operations Summary

| Operation | File | Uses supabaseAdmin | Status |
|-----------|------|-------------------|--------|
| **SELECT** | `syncPayuTransactions.js` | ✅ Yes | ✅ Correct |
| **SELECT** | `verifyPayment.js` | ✅ Yes | ✅ Correct |
| **INSERT** | `syncPayuTransactions.js` | ✅ Yes | ✅ Correct |
| **INSERT** | `verifyPayment.js` | ✅ Yes | ✅ Correct |
| **UPDATE** | `syncPayuTransactions.js` | ✅ Yes | ✅ Correct |
| **UPDATE** | `verifyPayment.js` | ✅ Yes | ✅ Correct |
| **DELETE** | `verifyPayment.js` | ✅ Yes | ✅ Correct |

## Security Considerations

### ✅ **Proper Implementation**
- All investment operations use `supabaseAdmin`
- No mixed usage of regular `supabase` client for investments
- Consistent across both files

### ✅ **Validation Still Active**
- User existence validation before investment creation
- Project existence validation before investment creation
- Transaction status validation
- Duplicate prevention logic

### ✅ **Error Handling**
- Proper error handling for all operations
- Detailed logging for debugging
- Graceful failure handling

## Configuration Requirements

### 1. **Environment Variables**
Ensure these are properly set:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. **Supabase Client Setup**
The `supabaseAdmin` client should be configured with the service role key:
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

## Testing Recommendations

### 1. **Admin Role Access**
- [ ] Test that all investment operations work with RLS enabled
- [ ] Verify no permission denied errors occur
- [ ] Test operations with different user contexts

### 2. **Data Integrity**
- [ ] Test investment creation with valid data
- [ ] Test investment updates with valid data
- [ ] Test duplicate prevention logic
- [ ] Test error handling for invalid data

### 3. **Policy Bypass**
- [ ] Verify operations work regardless of user authentication
- [ ] Test background/scheduled operations
- [ ] Verify consistent behavior across environments

## Troubleshooting

### Common Issues:

1. **Permission Denied Errors**
   - Ensure using `supabaseAdmin` instead of `supabase`
   - Check service role key is correct
   - Verify environment variables are set

2. **RLS Policy Conflicts**
   - All investment operations should use `supabaseAdmin`
   - No mixed usage of regular client for investments

3. **Authentication Issues**
   - `supabaseAdmin` doesn't require user authentication
   - Service role key provides admin privileges

## Best Practices

1. **Consistent Usage**: Always use `supabaseAdmin` for investment operations
2. **Error Handling**: Implement proper error handling for all operations
3. **Logging**: Add detailed logging for debugging
4. **Validation**: Maintain data validation before operations
5. **Testing**: Test with RLS policies enabled

## Files Modified

- `src/controllers/syncPayuTransactions.js` - Fixed commented lines, ensured proper supabaseAdmin usage
- `src/controllers/verifyPayment.js` - Already properly configured with supabaseAdmin

## Next Steps

1. **Deploy Changes**: Test the updated code in staging
2. **Monitor Logs**: Watch for any permission-related errors
3. **Verify Operations**: Ensure all investment operations work correctly
4. **Update Documentation**: Keep this guide updated with any changes 