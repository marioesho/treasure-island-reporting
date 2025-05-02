export interface Emails {
  messages: MessageKey[];
  resultSizeEstimate: number;
}
export interface Message extends MessageKey {
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: MessagePart;
  sizeEstimate: number;
}

export interface MessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: { name: string; value: string }[];
  body: Exclude<MessagePartBody, 'data'>;
  parts: MessagePart[];
}

export type Attachment = Exclude<MessagePartBody, 'attachmentId'>

interface MessageKey {
  id: string;
  threadId: string;
}

interface MessagePartBody {
  attachmentId: string;
  size: number;
  data: string;
}
