import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Filters, Emails, Message, Attachment } from '@models';
import { AuthGoogleService } from './auth-google.service';
import { ErrorHandlerService } from './error-handler.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class GmailService {
  constructor(
    private authGoogleService: AuthGoogleService,
    private http: HttpClient,
    private utilityService: UtilityService,
    private errorHandlerService: ErrorHandlerService) {}

  /**
   * this endpoint only lists 100 messages at a time
   * @returns
   * @apidoc https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list
   */
  async getEmails(filters: Filters): Promise<Emails> {
    try {
      const after = this.utilityService.formatDate(filters.startDate, 'YYYY/MM/dd');
      const before = this.utilityService.formatDate(this.utilityService.addDays(filters.endDate, 1), 'YYYY/MM/dd');
      const params = new HttpParams({
        fromObject: {
          // can use in:drafts if needing to search within folder
          q: `from:hazzaria@outlook.com subject:Daily Sales Report after:${after} before:${before}`
        }
      });
      const apiUrl = 'https://www.googleapis.com/gmail/v1/users/me/messages';
      const headers = { Authorization: `Bearer ${this.authGoogleService.getAccessToken}` };

      return await firstValueFrom(this.http.get<Emails>(apiUrl, { headers, params }));
    } catch (error) {
      this.errorHandlerService.throwError('Failed to fetch emails.', error);
    }
  }

  /**
   *
   * @param messageId
   * @returns
   * @apidoc https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get
   */
  async getMessageDetails(messageId: string): Promise<Message> {
    try {
      const apiUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
      const headers = { Authorization: `Bearer ${this.authGoogleService.getAccessToken}` };

      return await firstValueFrom(this.http.get<Message>(apiUrl, { headers }));
    } catch (error) {
      this.errorHandlerService.throwError('Failed to fetch message details.', error);
    }
  }

  /**
   *
   * @param message
   * @returns
   * @apidoc https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages.attachments/get
   */
  async getAttachment(message: Message): Promise<Attachment> {
    try {
      const attachmentPart = message.payload.parts.find(part => part.filename && part.filename.startsWith('Sales_History') && part.filename.endsWith('.csv'));

      if (!attachmentPart) throw new Error('No Sales_History CSV attachment found.');

      const attachmentId = attachmentPart.body?.attachmentId;

      if (!attachmentId) throw new Error('No attachment ID found.');

      const apiUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}/attachments/${attachmentId}`;
      const headers = { Authorization: `Bearer ${this.authGoogleService.getAccessToken}` };

      const messagePartBody = await firstValueFrom(this.http.get<Attachment>(apiUrl, { headers }))

      if (!messagePartBody?.data) throw new Error('No report data found for message subject.');

      return messagePartBody;
    } catch (error) {
      this.errorHandlerService.throwError('Failed to fetch message attachment.', error);
    }
  }
}
