import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthGoogleService } from './auth-google.service';

@Injectable({
  providedIn: 'root'
})
export class GmailService {
  // private gapiLoaded = false;

  // async loadGapi(): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const script = document.createElement('script');
  //     script.src = 'https://apis.google.com/js/api.js';
  //     script.onload = () => {
  //       gapi.load('client:auth2', async () => {
  //         await gapi.client.init({
  //           apiKey: '',
  //           clientId: '',
  //           discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
  //           scope: 'https://www.googleapis.com/auth/gmail.readonly'
  //         });
  //         this.gapiLoaded = true;
  //         resolve();
  //       });
  //     };
  //     script.onerror = reject;
  //     document.body.appendChild(script);
  //   });
  // }

  // async signIn(): Promise<void> {
  //   if (!this.gapiLoaded) {
  //     await this.loadGapi();
  //   }
  //   await gapi.auth2.getAuthInstance().signIn();
  // }

  // async listEmailsWithAttachments(): Promise<any[]> {
  //   const response = await gapi.client.gmail.users.messages.list({
  //     userId: 'me',
  //     q: 'has:attachment filename:csv'
  //   });
  //   return response.result.messages || [];
  // }

  constructor(private authGoogleService: AuthGoogleService, private http: HttpClient, @Inject(LOCALE_ID) private locale: string) {}

  async getGmailEmails(): Promise<{ messages: { id: string, threadId: string }[], resultSizeEstimate: number }> {
    // this endpoint only lists 100 messages
    // https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list
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

    // .subscribe(
    //   (response: any) => {
    //     // Handle the response and display the emails
    //     console.log('Emails:', response);
    //     const emails = response.messages;
    //     if (emails) {
    //       this.getMessageDetails(emails[0].id);
    //     }
    //   },
    //   (error) => {
    //     console.error('Error retrieving emails', error);
    //   }
    // );
  }

  async getMessageDetails(messageId: string): Promise<object> {
    // https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get
    const apiUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
    const headers = { Authorization: `Bearer ${this.authGoogleService.getAccessToken}` };

    return firstValueFrom(this.http.get(apiUrl, { headers }));


    // .subscribe((message: any) => {
    //   // Extract details like subject, from, body, etc.
    //   const subject = this.extractHeader(message.payload.headers, 'Subject');
    //   const from = this.extractHeader(message.payload.headers, 'From');
    //   console.log('Subject:', subject);
    //   console.log('From:', from);
    // });
  }

  async getAttachment(message: any): Promise<string> {
    // https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages.attachments/get
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
