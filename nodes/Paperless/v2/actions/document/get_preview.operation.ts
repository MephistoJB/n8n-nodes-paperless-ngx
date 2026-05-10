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
		description: 'The ID of the document for which to retrieve a preview',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['get_preview'],
			},
		},
		hint: 'The ID of the document for which to retrieve a preview',
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
	const endpoint = `/documents/${id}`;
	const preview = (await apiRequest.call(
		this,
		itemIndex,
		'GET',
		`${endpoint}/preview/`,
		undefined,
		undefined,
		{ encoding: null, json: false, resolveWithFullResponse: true },
	)) as any;
	const contentType = String(preview.headers?.['content-type'] ?? 'application/pdf');

	if (contentType.includes('text/html')) {
		throw new NodeOperationError(
			this.getNode(),
			'Paperless returned HTML instead of preview binary.',
			{
				description:
					'Check the Paperless URL in the credentials. It should point to the Paperless API host, not to the frontend HTML route.',
			},
		);
	}

	const filename =
		preview.headers['content-disposition']
			?.match(/filename="(?:b['"])?([^"]+)(?:['"])?"/)?.[1]
			?.replace(/^['"]|['"]$/g, '') ?? `${id}.pdf`;
	const previewBody = Buffer.isBuffer(preview.body) ? preview.body : Buffer.from(preview.body);

	return {
		json: {},
		binary: {
			data: await this.helpers.prepareBinaryData(previewBody, filename, contentType),
		},
	};
}
