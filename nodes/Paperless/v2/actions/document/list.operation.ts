import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameterResourceLocator,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest, apiRequestPaginated } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		default: {},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['list'],
			},
		},
		placeholder: 'Add Filter',
		options: [
			{
				displayName: 'Document Type',
				name: 'document_type',
				default: { mode: 'list', value: '' },
				description: 'Filter documents by document type',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						placeholder: 'Select a Document Type...',
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
						placeholder: 'Enter Document Type ID...',
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
				displayName: 'Excluded Tags',
				name: 'excluded_tags',
				default: {},
				description: 'Filter out documents that have any selected tag',
				options: [
					{
						displayName: 'Tag',
						name: 'values',
						values: [
							{
								displayName: 'Tag',
								name: 'tag',
								default: { mode: 'list', value: '' },
								description: 'The tag to exclude',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										placeholder: 'Select a Tag...',
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
										placeholder: 'Enter Tag ID...',
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
				placeholder: 'Add Excluded Tag',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
			},
			{
				displayName: 'Storage Path',
				name: 'storage_path',
				default: { mode: 'list', value: '' },
				description: 'Filter documents by storage path',
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						placeholder: 'Select a Storage Path...',
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
						placeholder: 'Enter Storage Path ID...',
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
				description: 'Filter documents that have all selected tags',
				options: [
					{
						displayName: 'Tag',
						name: 'values',
						values: [
							{
								displayName: 'Tag',
								name: 'tag',
								default: { mode: 'list', value: '' },
								description: 'The tag to filter by',
								modes: [
									{
										displayName: 'From List',
										name: 'list',
										placeholder: 'Select a Tag...',
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
										placeholder: 'Enter Tag ID...',
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
				displayName: 'Title',
				name: 'title',
				default: '',
				description: 'Filter documents whose title contains this text',
				type: 'string',
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['list'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const endpoint = '/documents/';
	const filters = this.getNodeParameter('filters', itemIndex, {}) as {
		document_type?: INodeParameterResourceLocator;
		storage_path?: INodeParameterResourceLocator;
		tags?: { values?: Array<{ tag: INodeParameterResourceLocator }> };
		excluded_tags?: { values?: Array<{ tag: INodeParameterResourceLocator }> };
		title?: string;
	};
	const query: IDataObject = {};
	const returnAll = this.getNodeParameter('returnAll', itemIndex, true) as boolean;
	const limit = this.getNodeParameter('limit', itemIndex, 50) as number;

	if (filters.title) {
		query.title__icontains = filters.title;
	}

	if (filters.document_type?.value) {
		query.document_type__id = filters.document_type.value;
	}

	if (filters.storage_path?.value) {
		query.storage_path__id = filters.storage_path.value;
	}

	const tagIds = filters.tags?.values?.map(({ tag }) => tag.value).filter(Boolean);
	if (tagIds?.length) {
		query.tags__id__all = tagIds.join(',');
	}

	const excludedTagIds = filters.excluded_tags?.values?.map(({ tag }) => tag.value).filter(Boolean);
	if (excludedTagIds?.length) {
		query.tags__id__none = excludedTagIds.join(',');
	}

	let responses: unknown[];
	if (!returnAll) {
		query.page_size = limit;
		const response = (await apiRequest.call(this, itemIndex, 'GET', endpoint, undefined, query)) as {
			results?: unknown[];
		};
		responses = response.results?.slice(0, limit) ?? [];
	} else {
		responses = (await apiRequestPaginated.call(
			this,
			itemIndex,
			'GET',
			endpoint,
			undefined,
			query,
		)) as unknown[];
	}

	return { json: { results: responses } };
}
