import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GmailService {
  private gapiLoaded = false;

  async loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client:auth2', async () => {
          await gapi.client.init({
            apiKey: '',
            clientId: '',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
            scope: 'https://www.googleapis.com/auth/gmail.readonly'
          });
          this.gapiLoaded = true;
          resolve();
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async signIn(): Promise<void> {
    if (!this.gapiLoaded) {
      await this.loadGapi();
    }
    await gapi.auth2.getAuthInstance().signIn();
  }

  async listEmailsWithAttachments(): Promise<any[]> {
    const response = await gapi.client.gmail.users.messages.list({
      userId: 'me',
      q: 'has:attachment filename:csv'
    });
    return response.result.messages || [];
  }

  async getAttachment(messageId: string): Promise<Blob> {
    const message = await gapi.client.gmail.users.messages.get({ userId: 'me', id: messageId });
    const parts = message.result.payload?.parts || [];
    const attachmentPart = parts.find(part => part.filename?.endsWith('.csv') && part.body?.attachmentId);

    if (!attachmentPart) throw new Error('No CSV attachment found.');

    if (!attachmentPart.body?.attachmentId) throw new Error('No attachment ID found.');

    const attachment = await gapi.client.gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentPart.body.attachmentId
    });

    if (!attachment.result.data) throw new Error('No attachment data found.')

    const byteCharacters = atob(attachment.result.data.replace(/-/g, '+').replace(/_/g, '/'));
    const byteArray = new Uint8Array([...byteCharacters].map(c => c.charCodeAt(0)));

    return new Blob([byteArray], { type: 'text/csv' });
  }
}
