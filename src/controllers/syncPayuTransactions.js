const { PayData } = require('../../payu.config.js');
const { supabase, supabaseAdmin } = require('../Supabase/supabase.js');

exports.syncPayuTransactions = async (req, res) => {
  try {
    const { startDate: startDateParam } = req.body;
    const clientUrl = process.env.CLIENT_URL;
    console.log('=== PAYU TRANSACTIONS SYNC STARTED ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request Method:', req.method);
    console.log('Request Body:', req.body);

    // Validate required environment variables
    if (!process.env.CLIENT_URL) {
      console.error('CLIENT_URL environment variable is not set');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error - CLIENT_URL not set',
      });
    }

    // Parse and calculate date range
    let startDate, endDate;

    if (startDateParam) {
      // If startDate is provided, parse it and calculate endDate as startDate + 7 days
      try {
        // Parse date in 'DD-MMM-YYYY' format (e.g., '01-jan-2025')
        const dateParts = startDateParam.toLowerCase().split('-');
        const day = parseInt(dateParts[0]);
        const month = dateParts[1];
        const year = parseInt(dateParts[2]);

        // Month mapping
        const monthMap = {
          jan: 0,
          feb: 1,
          mar: 2,
          apr: 3,
          may: 4,
          jun: 5,
          jul: 6,
          aug: 7,
          sep: 8,
          oct: 9,
          nov: 10,
          dec: 11,
        };

        if (!monthMap[month]) {
          return res.status(400).json({
            success: false,
            error:
              'Invalid month format. Use: jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec',
          });
        }

        const parsedStartDate = new Date(year, monthMap[month], day);

        // Validate the date
        if (isNaN(parsedStartDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid date format. Use DD-MMM-YYYY (e.g., 01-jan-2025)',
          });
        }

        startDate = parsedStartDate.toISOString().split('T')[0];

        // Calculate endDate as startDate + 7 days
        const endDateObj = new Date(parsedStartDate);
        endDateObj.setDate(endDateObj.getDate() + 7);
        endDate = endDateObj.toISOString().split('T')[0];

        console.log('Using provided startDate:', startDateParam);
        console.log('Calculated date range:', startDate, 'to', endDate);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use DD-MMM-YYYY (e.g., 01-jan-2025)',
        });
      }
    } else {
      // If no startDate provided, use last 7 days to today
      endDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
      const startDateObj = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      startDate = startDateObj.toISOString().split('T')[0]; // 7 days ago in YYYY-MM-DD format

      console.log('No startDate provided, using last 7 days');
      console.log('Calculated date range:', startDate, 'to', endDate);
    }
    const transactionPayuData = await PayData.payuClient.getTransactionDetails(
      startDate,
      endDate
    );

    console.log('Transaction Data retrieved successfully');
    const payuResponse = {
      hasData: !!transactionPayuData.Transaction_details,
      transactionData: transactionPayuData,
      hasTransactionDetails: !!transactionPayuData?.Transaction_details,
      transactionCount: transactionPayuData?.Transaction_details?.length || 0,
    };

    // Check if the response has the expected structure
    if (!transactionPayuData || !transactionPayuData.Transaction_details) {
      console.error('Invalid PayU response structure:', transactionPayuData);
      return res.status(500).json({
        success: false,
        msg:
          'Invalid PayU response structure ' +
          new Date(Date.now()).toISOString() +
          ' ' +
          toString(payuResponse),
        error: 'Transaction_details not found in response',
      });
    }

    const fetchedTransactions = transactionPayuData.Transaction_details;

    // Sync transactions to Supabase
    console.log(
      'Starting Supabase sync for',
      fetchedTransactions.length,
      'transactions'
    );

    let syncedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const transaction of fetchedTransactions) {
      try {
        // Map PayU fields to Supabase fields
        const paymentStatus =
          transaction.status === 'captured'
            ? 'success'
            : transaction.status === 'failed'
              ? 'failed'
              : transaction.status === 'userCancelled'
                ? 'cancelled'
                : 'pending';

        // Get user_id from profiles table based on email
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', transaction.email)
          .single();

        if (userError || !userData) {
          console.error('User not found for email:', transaction.email);
          errorCount++;
          continue;
        }
        const transactionData = {
          txnid: transaction.txnid,
          amount: parseFloat(transaction.amount) || 0,
          status: paymentStatus,
          project_name: transaction.productinfo || null,
          payureference_id: transaction.id || null,
          transaction_mode: transaction.mode || null,
          addedon: transaction.addedon || null,
          email: transaction.email || null,
          phone: transaction.phone || null,
          status_reason: transaction.field9 || null,
          user_id: userData.user_id,
          last_synced_on: new Date().toISOString(),
        };

        // Check if transaction already exists using combination of txnid and payureference_id
        const { data: existingTransaction, error: checkError } = await supabase
          .from('transactions')
          .select('id, txnid, payureference_id, status')
          .eq('txnid', transaction.txnid)
          .eq('payureference_id', transaction.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new transactions
          console.error('Error checking existing transaction:', checkError);
          errorCount++;
          continue;
        }

        if (existingTransaction) {
          // Update existing transaction only if status is different or if this is a more recent update
          const shouldUpdate =
            existingTransaction.status !== paymentStatus ||
            existingTransaction.payureference_id !== transaction.id;

          if (shouldUpdate) {
            const { error: updateError } = await supabase
              .from('transactions')
              .update(transactionData)
              .eq('txnid', transaction.txnid)
              .eq('payureference_id', transaction.id);

            if (updateError) {
              console.error('Error updating transaction:', updateError);
              errorCount++;
            } else {
              updatedCount++;
              console.log(
                'Updated transaction:',
                transaction.txnid,
                'with payureference_id:',
                transaction.id
              );
            }
          } else {
            console.log(
              'Transaction already exists with same status:',
              transaction.txnid,
              'with payureference_id:',
              transaction.id
            );
            updatedCount++;
          }
        } else {
          // Insert new transaction
          const { error: insertError } = await supabase
            .from('transactions')
            .insert(transactionData);

          if (insertError) {
            console.error('Error inserting transaction:', insertError);
            errorCount++;
          } else {
            syncedCount++;
            console.log(
              'Inserted new transaction:',
              transaction.txnid,
              'with payureference_id:',
              transaction.id
            );
          }
        }
      } catch (error) {
        console.error(
          'Error processing transaction:',
          transaction.txnid,
          error
        );
        errorCount++;
      }
    }

    // Update investments table for successful transactions
    console.log(
      'Starting investments table update for successful transactions...'
    );

    let investmentUpdates = 0;
    let investmentErrors = 0;
    let projectErrors = 0;
    let userDataErrors = 0;
    let investmentSyncedCount = 1;

    // Filter only successful transactions (status = 'captured') = success
    const successfulTransactions = fetchedTransactions.filter(
      (txn) => txn.status === 'captured'
    );

    // Clean up investments for failed transactions
    console.log('Cleaning up investments for failed transactions...');
    const failedTransactions = fetchedTransactions.filter(
      (txn) =>
        txn.status === 'failed' ||
        txn.status === 'userCancelled' ||
        txn.status === 'refunded' ||
        txn.status === 'bounced'
    );

    for (const transaction of successfulTransactions) {
      try {
        // Get user_id from profiles table based on email
        const { data: userData, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('email', transaction.email)
          .single();

        if (userError || !userData) {
          console.error('User not found for email:', transaction.email);
          userDataErrors++;
          continue;
        }

        // Get project_id from projects table based on project_name
        const { data: projectData, error: projectError } = await supabaseAdmin
          .from('projects')
          .select('id')
          .eq('project_name', transaction.productinfo)
          .single();

        if (projectError || !projectData) {
          console.error('Project not found for:', transaction.productinfo);
          projectErrors++;
          continue;
        }

        // Prepare investment data
        const investmentData = {
          user_id: userData.user_id,
          project_name: transaction.productinfo,
          project_id: projectData.id,
          amount: parseFloat(transaction.amount) || 0,
          units: (parseFloat(transaction.amount) || 0) / 1000,
          //investment_date: new Date(transaction.addedon).toISOString(),
          transaction_status: 'success',
          payment_mode: transaction.mode || 'Others',
          investment_status: 'Fully Settled',
          transaction_id: transaction.id,
          txnid: transaction.txnid,
          updated_at: new Date().toISOString(),
        };

        console.log(
          'Processing investment for txnid:',
          transaction.txnid,
          'transaction_id:',
          transaction.id,
          'user_id:',
          userData.user_id,
          'project_id:',
          projectData.id
        );

        // Check if investment already exists for this txnid and transaction_id combination
        const { data: existingInvestment, error: checkError } =
          await supabaseAdmin
            .from('investments')
            .select('id, txnid, transaction_id')
            .eq('txnid', transaction.txnid)
            //.eq('transaction_id', transaction.id)
            .maybeSingle(); // Use maybeSingle() instead of single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(
            'Error checking existing investment for txnid:',
            transaction.txnid,
            'transaction_id:',
            transaction.id,
            'Error:',
            checkError
          );
          investmentErrors++;
          continue;
        }

        if (existingInvestment) {
          console.log(
            'Found existing investment for txnid:',
            transaction.txnid,
            'transaction_id:',
            transaction.id,
            'investment_id:',
            existingInvestment.id
          );
          // Update existing investment
          const { error: updateError } = await supabaseAdmin
            .from('investments')
            .update(investmentData)
            .eq('txnid', transaction.txnid);
          //.eq('transaction_id', transaction.id);

          if (updateError) {
            console.error(
              'Error updating investment for txnid:',
              transaction.txnid,
              'transaction_id:',
              transaction.id,
              'Error:',
              updateError
            );
            investmentErrors++;
          } else {
            investmentUpdates++;
            console.log(
              'Updated investment for txnid:',
              transaction.txnid,
              'with transaction_id:',
              transaction.id
            );
          }
        } else {
          console.log(
            'No existing investment found for txnid:',
            transaction.txnid,
            'transaction_id:',
            transaction.id,
            '- creating new investment'
          );
          // Insert new investment for successful transactions
          const { error: insertError } = await supabaseAdmin
            .from('investments')
            .insert(investmentData);

          if (insertError) {
            console.error(
              'Error inserting investment for txnid:',
              transaction.txnid,
              'transaction_id:',
              transaction.id,
              'Error:',
              insertError
            );
            investmentErrors++;
          } else {
            investmentUpdates++;
            console.log(
              'Inserted new investment for txnid:',
              transaction.txnid,
              'with transaction_id:',
              transaction.id
            );
          }
        }
      } catch (error) {
        console.error(
          'Error processing investment for txnid:',
          transaction.txnid,
          error
        );
        investmentErrors++;
      }
    }

    console.log(
      'Investments sync completed - Updated:',
      investmentUpdates,
      'Errors:',
      investmentErrors
    );

    return res.status(200).json({
      success: true,
      msg: 'transactions and investments synced successfully',
      data: {
        payuData: transactionPayuData,
        syncStats: {
          totalTransactions: fetchedTransactions.length,
          newTransactions: syncedCount,
          updatedTransactions: updatedCount,
          errors: errorCount,
          successfulTransactions: successfulTransactions.length,
          investmentUpdates: investmentUpdates,
          investmentErrors: investmentErrors,
          projectErrors: projectErrors,
          userDataErrors: userDataErrors,
          dateRange: {
            startDate,
            endDate,
          },
        },
      },
    });
  } catch (error) {
    console.error('Payment Transactions Listing error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Transactions Listing failed',
      error: error.message || 'Unknown error occurred',
    });
  }
};
