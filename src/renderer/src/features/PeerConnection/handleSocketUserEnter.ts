export default (
	peerConnection: PeerConnection,
	payload: { users: PartnerPeerUser[] },
): void => {
	const filteredPartner = payload.users.filter((user: PartnerPeerUser) => {
		return peerConnection.user.username !== user.username;
	});

	if (filteredPartner[0] === undefined) return;

	[peerConnection.partner] = filteredPartner;

	if (peerConnection.partner.username !== '') {
		peerConnection.toggleLockRoom(true);
		peerConnection.emitUserEnter();
	}
};
