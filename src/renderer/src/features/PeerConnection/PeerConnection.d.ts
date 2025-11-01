// use import() to prevent cycle import!
// From here: https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts
type PeerConnection = import('./index').default;
