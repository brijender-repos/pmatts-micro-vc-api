const { PayData } = require('../../payu.config.js');
const { supabase, supabaseAdmin } = require('../Supabase/supabase.js');

exports.verifyPayment = async (req, res) => {
  try {
    const { txnid } = req.params;
    const clientUrl = process.env.CLIENT_URL;

    const verifiedData = await PayData.payuClient.verifyPayment(txnid);
    console.log('Verified Data:', verifiedData);

    if (!verifiedData.transaction_details) {
      return res.status(500).json({
        msg: 'Missing transaction details from PayU',
        response: verifiedData,
      });
    }

    const data = verifiedData.transaction_details[txnid];

    if (!data) {
      return res.status(400).json({
        msg: 'Transaction ID not found in PayU response',
        txnid,
        response: verifiedData,
      });
    }

    const paymentStatus =
      data.status === 'captured'
        ? 'success'
        : data.status === 'failed'
          ? 'failure'
          : data.status === 'userCancelled'
            ? 'cancelled'
            : 'pending';

    const transactionMode = data.mode || null;
    const payUReferenceId = data.id || null;

    // Check if transaction exists with the combination of txnid and payureference_id
    const { data: transactionData, error: txnError } = await supabase
      .from('transactions')
      .select('id')
      .eq('txnid', txnid)
      .eq('payureference_id', payUReferenceId)
      .single();

    if (txnError || !transactionData) {
      return res.redirect(`${clientUrl}/payment/failure`);
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: paymentStatus,
        transaction_mode: transactionMode,
        payureference_id: payUReferenceId,
      })
      .eq('txnid', txnid)
      .eq('payureference_id', payUReferenceId);

    if (updateError) {
      return res.status(500).json({
        msg: 'Failed to update transaction status',
        error: updateError.message,
      });
    }

    // Only process investments for successful transactions
    if (paymentStatus === 'success') {
      // Check if investment exists
      const { data: existingInvestment, error: checkError } =
        await supabaseAdmin
          .from('investments')
          .select('id')
          .eq('txnid', txnid)
          .eq('transaction_id', payUReferenceId)
          .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing investment:', checkError);
        return res.status(500).json({
          msg: 'Failed to check investment status',
          error: checkError.message,
        });
      }

      if (existingInvestment) {
        // Update existing investment for successful transaction
        const { error: investmentUpdateError } = await supabaseAdmin
          .from('investments')
          .update({
            transaction_status: paymentStatus,
            investment_status: 'Fully Settled',
            updated_at: new Date().toISOString(),
          })
          .eq('txnid', txnid)
          .eq('transaction_id', payUReferenceId);

        if (investmentUpdateError) {
          return res.status(500).json({
            msg: 'Failed to update investment status',
            error: investmentUpdateError.message,
          });
        }
      } else {
        // Insert new investment for successful transaction
        // Get user_id and project_id first
        const { data: userData, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('email', data.email)
          .single();

        if (userError || !userData) {
          console.error('User not found for email:', data.email);
          return res.status(500).json({
            msg: 'User not found for investment creation',
            error: 'User not found',
          });
        }

        const { data: projectData, error: projectError } = await supabaseAdmin
          .from('projects')
          .select('id')
          .eq('project_name', data.productinfo)
          .single();

        if (projectError || !projectData) {
          console.error('Project not found for:', data.productinfo);
          return res.status(500).json({
            msg: 'Project not found for investment creation',
            error: 'Project not found',
          });
        }

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

        const { error: insertError } = await supabaseAdmin
          .from('investments')
          .insert(investmentData);

        if (insertError) {
          return res.status(500).json({
            msg: 'Failed to create investment',
            error: insertError.message,
          });
        }
      }
    } else {
      // For failed/cancelled transactions, remove any existing investment
      const { error: deleteError } = await supabaseAdmin
        .from('investments')
        .delete()
        .eq('txnid', txnid)
        .eq('transaction_id', payUReferenceId);

      if (deleteError && deleteError.code !== 'PGRST116') {
        console.error('Error deleting failed investment:', deleteError);
        // Don't return error here as this is cleanup operation
      }
    }

    res.redirect(`${clientUrl}/payment/${paymentStatus}`);
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ msg: 'Verification failed', error: error.message });
    return res.redirect(`${clientUrl}/payment/failure`);
  }
};
