import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(request: Request) {
  const { accessToken, data } = await request.json();

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const sheets = google.sheets({
      version: "v4",
      auth: oauth2Client,
    });

    // Create spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Product Export ${new Date().toLocaleDateString()}`,
        },
      },
    });

    // Update values
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheet.data.spreadsheetId!,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: data,
      },
    });

    return NextResponse.json({
      url: `https://docs.google.com/spreadsheets/d/${spreadsheet.data.spreadsheetId}`,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("API Error:", error.message);
      return NextResponse.json(
        { error: error.message || "Failed to create spreadsheet" },
        { status: 500 }
      );
    }
    console.error("Unknown error", error);
    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}