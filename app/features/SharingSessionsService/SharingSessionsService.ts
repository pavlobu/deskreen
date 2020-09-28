interface SharingSessionService {
  sharingSessions: SharingSession[];
  createNewSharingSession: () => SharingSession;
  pollForInactiveSessions: () => void;
  getSharingSessionByID: (id: string) => SharingSession;
}
