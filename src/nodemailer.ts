"use strict";
import nodemailer from "nodemailer";
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;

import * as dotenv from 'dotenv'
dotenv.config()

const to = process.env.TO;

const service = process.env.SERVICE;

const from = process.env.FROM || "Scrapper Notifier <auth.op.ds@gmail.com>";

// create reusable transporter object using the default SMTP transport
let accountTransport = {
  service: service,
  auth: {
    type: "OAuth2",
    user: process.env.USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    accessToken: "",
  },
};

// async..await is not allowed in global scope, must use a wrapper
export async function sender({
  subject = "",
  html = "",
  attachments = [] as any,
}) {
  // Configure the OAuth2 client with the credentials and set the redirect URI
  const oauth2Client = new OAuth2(
    accountTransport.auth.clientId,
    accountTransport.auth.clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  // Set the refresh token
  oauth2Client.setCredentials({
    refresh_token: accountTransport.auth.refreshToken,
  });

  // Get the access token
  const { token } = await oauth2Client.getAccessToken();

  // Assign the access token to the accountTransport
  accountTransport.auth.accessToken = token;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(accountTransport as any);

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    attachments,
  });

  console.log("Message sent: %s", info.messageId);
}
