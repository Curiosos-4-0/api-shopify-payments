require("dotenv/config");

var express = require("express");
var app = express();
var axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

var fs = require("fs");
const { Pool } = require("pg");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/token_payment", function (req, res) {
  GPO_URL = process.env.GPO_URL;
  TOKEN = process.env.TOKEN;
  BASE_URL = process.env.BASE_URL;
  ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
  ENVIRONMENT = process.env.GPO_ENVIRONMENT;
  reference = req.query.reference;
  amount = req.query.amount;

  axios
    .post(
      GPO_URL + "v1/store_payments",
      {
        reference: reference,
        amount: amount,
        mobile: "PAYMENT",
        card: "DISABLED",
        callback_url: BASE_URL + "/wook_payment",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + TOKEN,
          ENV: ENVIRONMENT,
          // Add more headers as needed
        },
      }
    )
    .then(function (response) {
      res.set("access-control-allow-origin", ALLOWED_ORIGIN);
      res.send({
        id: response.data.id,
        env: ENVIRONMENT,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.get("/validate_payment", async function (req, res) {
  ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
  id = req.query.id;
  const purshases = await prisma.purshase.findMany({
    where: {
      gpo_id: {
        equals: id,
      },
    },
  });

  res.set("access-control-allow-origin", ALLOWED_ORIGIN);
  if (purshases.length === 0) {
    res.send({ status: "REJECTED" });
  } else {
    res.send({ status: purshases[0].status });
  }
});

app.post("/wook_payment", async function (req, res) {
  API_PASS_STORE = process.env.API_PASS_STORE;
  const user = await prisma.purshase.create({
    data: {
      gpo_id: "" + req.body.id,
      amount: "" + req.body.amount,
      pos: "" + req.body.pointOfSale.id,
      reference: "" + req.body.merchantReferenceNumber,
      status: "" + req.body.status,
    },
  });

  if (req.body.status == "ACCEPTED") {
    axios
      .post(
        API_PASS_STORE +
          "/orders/" +
          req.body.merchantReferenceNumber +
          "/transactions.json",
        {
          transaction: {
            currency: "AOA",
            amount: req.body.amount,
            kind: "capture",
          },
        }
      )
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  res.sendStatus(200);
});

app.post("/reference_wook_payment", async function (req, res) {
  API_PASS_STORE = process.env.API_PASS_STORE;

  const referenceReq = req.body.reference_id
  const updatereference = await prisma.reference.update({
    where: {
      reference: referenceReq,
    },
    data: {
      status: "PAYED",
    },
  });

  if (!updatereference) {
    return res.status(400).json({ error: "Error updatereference" });
  }

  const reference = await prisma.purshase.findUnique({
    where: {
      reference: referenceReq,
    },
  });

  if (!reference) {
    return res.status(400).json({ error: "Error finding reference" });
  }

  if (reference != null && reference.status == "PAYED") {
    axios
      .post(
        API_PASS_STORE +
          "/orders/" +
          reference.order_id +
          "/transactions.json",
        {
          transaction: {
            currency: "AOA",
            amount: req.body.amount,
            kind: "capture",
          },
        }
      )
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  console.log("Reference "+referenceReq+" payed");

  res.sendStatus(200);
});

// Function to get current date plus 3 days in ISO format
const getEndDateTime = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split("T")[0];
};

app.get("/reference_token_payment", async (req, res) => {
  const { amount, reference } = req.query;

  if (!amount || !reference) {
    return res.status(400).json({ error: "Amount and reference are required" });
  }

  try {
    const endDateTime = getEndDateTime();
    const referenceFromProxyPay = await generateReference();
    await saveReferenceData(
      reference,
      referenceFromProxyPay,
      amount,
      endDateTime
    );

    const response = await axios.put(
      `${process.env.PROXYPAY_API_BASE_URL}/references/${referenceFromProxyPay}`,
      {
        amount: amount,
        end_datetime: endDateTime,
        custom_fields: {
          callback_url: process.env.CALLBACK_URL,
        },
      },
      {
        headers: {
          Authorization: `Token ${process.env.PROXYPAY_API_TOKEN}`,
          Accept: "application/vnd.proxypay.v2+json",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Reference "+referenceFromProxyPay+" created");
    res.status(200).json({
      reference: referenceFromProxyPay,
      end_datetime: endDateTime,
      amount: amount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while creating the payment reference",
    });
  }
});

// Auxiliary method to generate a reference
const generateReference = async () => {
  try {
    const response = await axios.post(
      `${process.env.PROXYPAY_API_BASE_URL}/reference_ids`,
      {},
      {
        headers: {
          Authorization: `Token ${process.env.PROXYPAY_API_TOKEN}`,
          Accept: "application/vnd.proxypay.v2+json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating reference:", error);
    throw new Error("Could not generate reference");
  }
};

// Auxiliary method to save reference data
const saveReferenceData = async (order_id, reference, amount, endDateTime) => {
  try {
    // Save to PostgreSQL using Prisma
    await prisma.reference.create({
      data: {
        order_id: order_id,
        reference: reference + "",
        amount: amount,
        endDateTime: endDateTime,
        status: "CREATED",
      },
    });
  } catch (error) {
    console.error("Error saving reference data:", error);
    throw new Error("Could not save reference data");
  }
};

var server = app.listen(process.env.PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at http://%s:%s", host, port);
});
