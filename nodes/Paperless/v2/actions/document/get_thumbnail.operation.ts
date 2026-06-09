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
		description: 'The ID of the document for which to retrieve a thumbnail',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['get_thumbnail'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				placeholder: 'Select a Document...',
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
				placeholder: 'Enter Document ID...',
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
		],
		required: true,
		type: 'resourceLocator',
	},
	{
		displayName: 'Binary Property Name',
		name: 'binary_property_name',
		default: 'data',
		description: 'Name of the binary property that receives the thumbnail',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['get_thumbnail'],
			},
		},
		required: true,
		type: 'string',
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const id = getDocumentId(
		(this.getNodeParameter('id', itemIndex) as INodeParameterResourceLocator).value,
	);
	const binaryPropertyName = this.getNodeParameter('binary_property_name', itemIndex) as string;
	const thumbnail = (await apiRequest.call(
		this,
		itemIndex,
		'GET',
		`/documents/${id}/thumb/`,
		undefined,
		undefined,
		{ encoding: null, json: false, resolveWithFullResponse: true },
	)) as any;
	const contentType = String(thumbnail.headers?.['content-type'] ?? 'image/webp');

	if (contentType.includes('text/html')) {
		throw new NodeOperationError(this.getNode(), 'Paperless returned HTML instead of a thumbnail.');
	}

	const body = Buffer.isBuffer(thumbnail.body) ? thumbnail.body : Buffer.from(thumbnail.body);
	const extension = contentType.includes('png') ? 'png' : contentType.includes('jpeg') ? 'jpg' : 'webp';

	return {
		json: {},
		binary: {
			[binaryPropertyName]: await this.helpers.prepareBinaryData(
				body,
				`${id}-thumbnail.${extension}`,
				contentType,
			),
		},
	};
}
