import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameterResourceLocator,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { getDocumentId } from './utils';

export const description: INodeProperties[] = [
	{
		displayName: 'ID',
		name: 'id',
		default: { mode: 'list', value: '' },
		description: 'ID of the document',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['get'],
			},
		},
		hint: 'The ID of the document',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				placeholder: `Select a Document...`,
				type: 'list',
				typeOptions: {
					searchListMethod: 'documentSearch',
					searchFilterRequired: false,
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				placeholder: `Enter Document ID...`,
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[1-9][0-9]*$',
							errorMessage: 'The ID must be a positive integer',
						},
					},
				],
			},
			{
				displayName: 'By URL',
				name: 'url',
				placeholder: `Enter Document URL...`,
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^(?:http|https)://(?:.+?)/documents/(\\d+)/details$',
							errorMessage:
								'The URL must be a valid Paperless document URL (e.g. https://paperless.example.com/documents/123/details)',
						},
					},
				],
				extractValue: {
					type: 'regex',
					regex: '^(?:http|https)://(?:.+?)/documents/(\\d+)/details$',
				},
			},
		],
		placeholder: 'ID of the document',
		required: true,
		type: 'resourceLocator',
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const id = getDocumentId(
		(this.getNodeParameter('id', itemIndex) as INodeParameterResourceLocator).value,
	);
	const endpoint = `/documents/${id}/`;
	const response = (await apiRequest.call(this, itemIndex, 'GET', endpoint)) as any;

	if (typeof response !== 'object' || response === null || typeof response.id === 'undefined') {
		throw new NodeOperationError(
			this.getNode(),
			`Paperless did not return document metadata for ID "${id}"`,
			{
				description:
					'Check that the credential URL points to the Paperless instance and that the document URL contains a valid document ID.',
			},
		);
	}

	const document = (await apiRequest.call(
		this,
		itemIndex,
		'GET',
		`${endpoint}download/`,
		undefined,
		undefined,
		{
			encoding: null,
			json: false,
			resolveWithFullResponse: true,
		},
	)) as { body: Buffer | string; headers: Record<string, string | undefined> };
	const contentType = document.headers['content-type'] ?? 'application/octet-stream';

	if (contentType.includes('text/html')) {
		throw new NodeOperationError(
			this.getNode(),
			`Paperless returned HTML instead of the document binary for ID "${id}"`,
			{
				description:
					'Check that the credential URL points to the Paperless instance and that the document exists.',
			},
		);
	}

	const filename =
		document.headers['content-disposition']
			?.match(/filename\*=utf-8''([^;]+)|filename="([^"]+)"/)
			?.slice(1)
			.find(Boolean) ??
		response.archived_file_name ??
		response.original_file_name ??
		`${id}.pdf`;

	return {
		json: { results: [response] },
		binary: {
			data: await this.helpers.prepareBinaryData(
				Buffer.isBuffer(document.body) ? document.body : Buffer.from(document.body),
				decodeURIComponent(filename),
				contentType,
			),
		},
	};
}
