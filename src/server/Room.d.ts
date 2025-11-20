interface Room {
	id: string;
	users: User[];
	isLocked: boolean;
	createdAt: number;
}
