import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthGoogleService } from './auth-google.service';

@Injectable({
  providedIn: 'root'
})
export class GmailService {
  constructor(private authGoogleService: AuthGoogleService, private http: HttpClient, @Inject(LOCALE_ID) private locale: string) {}

  /**
   *
   * @returns
   * @apidoc https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list
   */
  async getEmails(): Promise<{ messages: { id: string, threadId: string }[], resultSizeEstimate: number }> {
    // this endpoint only lists 100 messages at a time
    const after = formatDate(new Date('4/25/25'), 'YYYY/MM/dd', this.locale);
    const before = formatDate(new Date('4/29/25'), 'YYYY/MM/dd', this.locale);
    const params = new HttpParams({
      fromObject: {
        // can use in:drafts if needing to search within folder
        q: `from:hazzaria@outlook.com subject:Daily Sales Report after:${after} before:${before}`
      }
    });
    const apiUrl = 'https://www.googleapis.com/gmail/v1/users/me/messages';
    const headers = { Authorization: `Bearer ${this.authGoogleService.getAccessToken}` };

    return firstValueFrom(this.http.get<{ messages: { id: string, threadId: string }[], resultSizeEstimate: number }>(apiUrl, { headers, params }));
  }

  /**
   *
   * @param messageId
   * @returns
   * @apidoc https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get
   */
  async getMessageDetails(messageId: string): Promise<object> {
    const apiUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
    const headers = { Authorization: `Bearer ${this.authGoogleService.getAccessToken}` };

    return firstValueFrom(this.http.get(apiUrl, { headers }));
  }

  /**
   *
   * @param message
   * @returns
   * @apidoc https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages.attachments/get
   */
  async getAttachment(message: any): Promise<string> {
    const attachmentPart = message.payload.parts.find((part: any) => part.filename && part.filename.startsWith('Sales_History') && part.filename.endsWith('.csv'));

    if (!attachmentPart) throw new Error(`No CSV attachments found for message subject: ${this.extractSubject(message.payload.headers)}.`);

    const attachmentId = attachmentPart.body?.attachmentId;

    if (!attachmentId) throw new Error(`No attachment ID found for message subject: ${this.extractSubject(message.payload.headers)}.`);

    const apiUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}/attachments/${attachmentId}`;
    const headers = { Authorization: `Bearer ${this.authGoogleService.getAccessToken}` };

    const messagePartBody = await firstValueFrom(this.http.get<{
      "attachmentId": string,
      "size": number,
      "data": string
    }>(apiUrl, { headers }));

    if (!messagePartBody.data) throw new Error(`No attachment data found for message subject: ${this.extractSubject(message.payload.headers)}.`)

    return atob(messagePartBody.data.replace(/-/g, '+').replace(/_/g, '/'));
  }

  private extractSubject(headers: any[]): string {
    const header = headers.find((header) => header.name === 'Subject');
    return header?.value ?? '';
  }
}
