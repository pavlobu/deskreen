class SocketsIPService {
	private static instance: SocketsIPService;

	idToIpMap: Map<string, string>;

	ipToIdMap: Map<string, string>;

	constructor() {
		this.idToIpMap = new Map<string, string>();
		this.ipToIdMap = new Map<string, string>();
	}

	setIPOfSocketID(id: string, ip: string): void {
		this.idToIpMap.set(id, ip);
		this.ipToIdMap.set(ip, id);
	}

	setSocketIDOfIP(ip: string, id: string): void {
		this.idToIpMap.set(id, ip);
		this.ipToIdMap.set(ip, id);
	}

	getSocketIPByID(id: string): string | undefined {
		return this.idToIpMap.get(id);
	}

	getSocketIDByIP(ip: string): string | undefined {
		return this.ipToIdMap.get(ip);
	}

	isIPExists(ip: string): boolean {
		return this.ipToIdMap.has(ip);
	}

	static getInstance(): SocketsIPService {
		if (!this.instance) {
			this.instance = new SocketsIPService();
		}
		return this.instance;
	}
}

export default SocketsIPService.getInstance();
