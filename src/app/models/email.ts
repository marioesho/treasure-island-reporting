export interface Emails {
  messages: { id: string; threadId: string }[];
  resultSizeEstimate: number;
}

export interface MessageDetails {

}

export interface MessagePartBody {
  attachmentId: string;
  size: number;
  data: string;
}
