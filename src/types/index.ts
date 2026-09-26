export type ShareType = "ONE_TIME" | "TIME_BASED";
export type AccessType = "PUBLIC" | "PASSWORD_PROTECTED";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  createdAt: Date | string;
}

export interface ShareLinkResponse {
  id: string;
  shareUrl: string;
  shareType: ShareType;
  accessType: AccessType;
  accessKey?: string;
  expiresAt: string | Date;
  consumedAt?: string | Date | null;
  revokedAt?: string | Date | null;
  viewCount: number;
  createdAt: string | Date;
}

export interface NoteDetailResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  shareLinks: Array<{
    id: string;
    shareUrl?: string;
    shareType: ShareType;
    accessType: AccessType;
    status: "ACTIVE" | "CONSUMED" | "EXPIRED" | "REVOKED";
    expiresAt: string | Date;
    consumedAt: string | Date | null;
    revokedAt: string | Date | null;
    viewCount: number;
    createdAt: string | Date;
  }>;
}

export interface SharedNoteResponse {
  isProtected: boolean;
  accessType?: AccessType;
  shareType?: ShareType;
  title?: string;
  content?: string;
  expiresAt: string | Date;
}
