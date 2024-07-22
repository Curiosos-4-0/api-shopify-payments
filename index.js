require("dotenv/config");

var express = require("express");
var app = express();
var axios = require("axios");
var fs = require("fs");
const { Pool } = require("pg");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    const response = await axios.put(
      `${process.env.PROXYPAY_API_BASE_URL}/references/${referenceFromProxyPay}`,
      {
        amount: amount,
        end_datetime: endDateTime,
      },
      {
        headers: {
          Authorization: `Token ${process.env.PROXYPAY_API_TOKEN}`,
          Accept: "application/vnd.proxypay.v2+json",
          "Content-Type": "application/json",
        },
      }
    );

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

var server = app.listen(process.env.PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at http://%s:%s", host, port);
});
