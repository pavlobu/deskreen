const isLinuxWaylandSession =
	process.platform === 'linux' &&
	(process.env.XDG_SESSION_TYPE?.toLowerCase() === 'wayland' ||
		process.env.WAYLAND_DISPLAY != null);

export default isLinuxWaylandSession;
