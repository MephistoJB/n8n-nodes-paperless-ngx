export function getDocumentId(value: unknown): string {
	const documentId = String(value);
	const urlMatch = documentId.match(/\/documents\/(\d+)(?:\/|$)/);

	return urlMatch?.[1] ?? documentId;
}
