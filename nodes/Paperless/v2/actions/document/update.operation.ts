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
				operation: ['update'],
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
	{
		displayName: 'Update Fields',
		name: 'update_fields',
		type: 'collection',
		default: {},
		hint: 'All additional fields are automatically added to the document by Paperless if they are not set',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['update'],
			},
		},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'Append Tags',
				name: 'append_tags',
				type: 'boolean',
				default: false,
				description:
					'Whether to append the new tags to the existing ones instead of replacing them',
			},
			{
				displayName: 'Archive Serial Number',
				name: 'archive_serial_number',
				default: '',
				description: 'The archive serial number of the document',
				type: 'number',
			},
			{
				displayName: 'Content',
				name: 'content',
				default: '',
				description: 'The searchable text content of the document',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
			},
			{
				displayName: 'Correspondent',
				name: 'correspondent',
				default: { mode: 'list', value: '' },
				description: 'The correspondent ID of the document',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						placeholder: `Select a Correspondent...`,
						type: 'list',
						typeOptions: {
							searchListMethod: 'correspondentSearch',
							searchFilterRequired: false,
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						placeholder: `Enter Correspondent ID...`,
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
				type: 'resourceLocator',
			},
			{
				displayName: 'Created',
				name: 'created',
				default: '',
				description: 'The date and time the document was created',
				type: 'dateTime',
			},
			{
				displayName: 'Custom Fields',
				name: 'custom_fields',
				default: {},
				description: 'The custom field of the document',
				options: [
					{
						displayName: 'Custom Field',
						name: 'values',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								default: { mode: 'list', value: '' },
								description: 'The custom field ID',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										placeholder: `Select a Custom Field...`,
										type: 'list',
										typeOptions: {
											searchListMethod: 'customFieldSearch',
											searchFilterRequired: false,
											searchable: true,
										},
									},
									{
										displayName: 'By ID',
										name: 'id',
										placeholder: `Enter Custom Field ID...`,
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
								type: 'resourceLocator',
							},
							{
								displayName: 'Value',
								name: 'value',
								default: '',
								description: 'The custom field value',
								type: 'string',
							},
						],
					},
				],
				placeholder: 'Add Custom Field',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
			},
			{
				displayName: 'Custom Fields JSON',
				name: 'custom_fields_json',
				default: '',
				description:
					'JSON array of custom fields. Each entry must contain a field ID and value. Overrides Custom Fields when set.',
				placeholder: '[{"field": 9, "value": "Mobilfunk"}]',
				type: 'json',
			},
			{
				displayName: 'Document Type',
				name: 'document_type',
				default: { mode: 'list', value: '' },
				description: 'The document type ID of the document',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						placeholder: `Select a Document Type...`,
						type: 'list',
						typeOptions: {
							searchListMethod: 'documentTypeSearch',
							searchFilterRequired: false,
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						placeholder: `Enter Document Type ID...`,
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
				type: 'resourceLocator',
			},
			{
				displayName: 'Remove Tags JSON',
				name: 'remove_tags_json',
				default: '',
				description:
					'JSON array of tag IDs to remove while preserving every other existing document tag',
				placeholder: '[1]',
				type: 'json',
			},
			{
				displayName: 'Storage Path',
				name: 'storage_path',
				default: { mode: 'list', value: '' },
				description: 'The storage path ID of the document',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						placeholder: `Select a Storage Path...`,
						type: 'list',
						typeOptions: {
							searchListMethod: 'storagePathSearch',
							searchFilterRequired: false,
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						placeholder: `Enter Storage Path ID...`,
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
				type: 'resourceLocator',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				default: {},
				description: 'The tag IDs of the document',
				options: [
					{
						displayName: 'Tag',
						name: 'values',
						values: [
							{
								displayName: 'Tag',
								name: 'tag',
								default: { mode: 'list', value: '' },
								description: 'The tag ID',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										placeholder: `Select a Tag...`,
										type: 'list',
										typeOptions: {
											searchListMethod: 'tagSearch',
											searchFilterRequired: false,
											searchable: true,
										},
									},
									{
										displayName: 'By ID',
										name: 'id',
										placeholder: `Enter Tag ID...`,
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
								type: 'resourceLocator',
							},
						],
					},
				],
				placeholder: 'Add Tag',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
			},
			{
				displayName: 'Tags JSON',
				name: 'tags_json',
				default: '',
				description: 'JSON array of tag IDs. Overrides Tags when set.',
				placeholder: '[1, 37]',
				type: 'json',
			},
			{
				displayName: 'Title',
				name: 'title',
				default: '',
				description: 'The title of the document',
				type: 'string',
			},
		],
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

	const updateFields = this.getNodeParameter('update_fields', itemIndex, {}) as any;

	const parseJsonArray = (value: unknown, fieldName: string): any[] | undefined => {
		if (value === '' || value === null || value === undefined) return undefined;

		try {
			const parsed = typeof value === 'string' ? JSON.parse(value) : value;
			if (!Array.isArray(parsed)) throw new Error('value is not an array');
			return parsed;
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`${fieldName} must be a valid JSON array: ${error instanceof Error ? error.message : error}`,
				{ itemIndex },
			);
		}
	};

	const tagsJson = parseJsonArray(updateFields.tags_json, 'Tags JSON');
	const removeTags = parseJsonArray(updateFields.remove_tags_json, 'Remove Tags JSON')?.map(Number);
	let tags = tagsJson?.map(Number) ?? updateFields.tags?.values.map((tag: any) => Number(tag.tag.value));

	if ((updateFields.append_tags && tags && tags.length > 0) || removeTags?.length) {
		const currentDocument = (await apiRequest.call(this, itemIndex, 'GET', endpoint)) as any;
		const currentTags: number[] = (currentDocument.tags || []).map((tag: unknown) => Number(tag));
		const combinedTags: number[] = updateFields.append_tags
			? [...currentTags, ...(tags || [])]
			: tags || currentTags;
		tags = [...new Set(combinedTags)].filter((tag) => !removeTags?.includes(tag));
	}

	const customFieldsJson = parseJsonArray(updateFields.custom_fields_json, 'Custom Fields JSON');
	const customFields =
		customFieldsJson?.map((customField: any) => ({
			field: customField.field,
			value: customField.value,
		})) ??
		updateFields.custom_fields?.values.map((customField: any) => ({
			field: customField.field.value,
			value: customField.value,
		}));

	const body = {
		archive_serial_number: updateFields.archive_serial_number,
		correspondent: updateFields.correspondent?.value,
		content: updateFields.content,
		created: updateFields.created,
		custom_fields: customFields,
		document_type: updateFields.document_type?.value,
		storage_path: updateFields.storage_path?.value,
		tags,
		title: updateFields.title,
	};

	const response = (await apiRequest.call(this, itemIndex, 'PATCH', endpoint, body)) as any;

	return { json: { results: [response] } };
}
