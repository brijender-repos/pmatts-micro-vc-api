const { supabase } = require('../Supabase/supabase.js');

exports.payuWebhook = async (req, res) => {
  try {
    const data = req.body;
    console.log('Webhook received:', data);

    const { txnid, status, mode, mihpayid } = data;

    if (!txnid) {
      return res.status(400).json({ msg: 'Missing transaction ID' });
    }

    const paymentStatus =
      status === 'captured'
        ? 'success'
        : status === 'failed'
          ? 'failure'
          : status === 'userCancelled'
            ? 'cancelled'
            : 'pending';

    // Update transaction using combination of txnid and payureference_id for uniqueness
    const { error } = await supabase
      .from('transactions')
      .update({
        status: paymentStatus,
        transaction_mode: mode || null,
        payureference_id: mihpayid || null,
      })
      .eq('txnid', txnid)
      .eq('payureference_id', mihpayid);

    if (error) {
      console.error('Failed to update transaction:', error);
      return res
        .status(500)
        .json({ msg: 'Database update failed', error: error.message });
    }

    console.log(`Transaction ${txnid} updated to ${paymentStatus}`);
    res.status(200).json({ msg: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res
      .status(500)
      .json({ msg: 'Webhook processing failed', error: error.message });
  }
};
