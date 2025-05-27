const axios = require("axios");
const otpGenerator = require("otp-generator");
const { supabaseAdmin } = require("../Supabase/supabase");
const jwt = require("jsonwebtoken");

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const { data: existingUser, error: userError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (userError) {
      console.error("Error fetching user:", userError);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

    const user = existingUser?.users?.find((u) => u.phone === phone);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not registered with us" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const currentTime = new Date().toISOString();

    // Delete any existing OTP for this phone number
    await supabaseAdmin.from("otps").delete().eq("phone", phone);

    // Insert new OTP
    const { error: insertError } = await supabaseAdmin
      .from("otps")
      .insert([{ phone, otp, generate_datetime: currentTime }]);

    if (insertError) {
      console.error("Error saving OTP:", insertError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to save OTP" });
    }

    const smsUrl = `http://cloud.smsindiahub.in/api/mt/SendSMS?APIKey=${
      process.env.SMS_API_KEY
    }&senderid=PMATTS&channel=Trans&DCS=0&flashsms=0&number=91${phone}&text=${encodeURIComponent(
      `Dear Customer, Your one-time password for verification is ${otp}. Thanks and Regards -PMATTS INNOVATIVE`
    )}&route=4&PEId=1101254130000084996&TemplateId=1101254130000084996`;

    const response = await fetch(smsUrl);
    const result = await response.json();

    if (result.ErrorCode !== "000") {
      console.error("SMS Sending Failed:", result);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP" });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    let { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone & OTP required" });
    }

    // Ensure phone and otp are numbers for accurate comparison
    phone = Number(phone);
    otp = Number(otp);

    // Fetch the latest OTP for the phone number
    const { data: storedOtp, error: otpError } = await supabaseAdmin
      .from("otps")
      .select("otp, generate_datetime")
      .eq("phone", phone)
      .order("generate_datetime", { ascending: false })
      .limit(1)
      .single();

    if (otpError || !storedOtp) {
      console.error("Error fetching OTP:", otpError);
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const { data: existingUser, error: userError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (userError) {
      return res
        .status(500)
        .json({ success: false, message: "Error fetching users" });
    }

    const user = existingUser?.users?.find((u) => Number(u.phone) === phone);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Delete OTP after successful verification
    await supabaseAdmin.from("otps").delete().eq("phone", phone);

    const tokenPayload = {
      sub: user.id,
      phone: user.phone,
      role: "authenticated",
    };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      email: user.email,
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

module.exports = { sendOtp, verifyOtp };
