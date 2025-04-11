import { NextResponse } from "next/server";
import { google } from "googleapis";

function getDailySheetName() {
  const today = new Date();
  return `Product Export ${today.toISOString().split("T")[0]}`;
}

export async function POST(request: Request) {
  const { accessToken, data } = await request.json();

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const todaySheetName = getDailySheetName();
    let spreadsheetId: string;
    let isNewSheet = false;

    // Try to find existing spreadsheet
    try {
      const driveResponse = await drive.files.list({
        q: `name='${todaySheetName}' and mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: "files(id, name)",
        spaces: "drive",
      });

      if (driveResponse.data.files?.length) {
        spreadsheetId = driveResponse.data.files[0].id!;
      } else {
        // Create new spreadsheet if not found
        const newSpreadsheet = await sheets.spreadsheets.create({
          requestBody: {
            properties: {
              title: todaySheetName,
            },
          },
        });
        spreadsheetId = newSpreadsheet.data.spreadsheetId!;
        isNewSheet = true;
      }
    } catch (driveError) {
      console.error("Drive API error:", driveError);
      throw new Error("Failed to search for existing spreadsheets");
    }

    // Get sheet title
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties.title",
    });
    const sheetTitle =
      spreadsheet.data.sheets?.[0]?.properties?.title || "Sheet1";

    // Add headers if new sheet
    if (isNewSheet) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetTitle}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [data[0]], // Header row
        },
      });
    }

    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetTitle}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [data[1]], // Append data row
      },
    });

    return NextResponse.json({
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      isNewSheet,
      appendedRows: appendResponse.data.updates?.updatedRows || 0,
    });
  } catch (error: unknown) {
    console.error("Full error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Google API error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

