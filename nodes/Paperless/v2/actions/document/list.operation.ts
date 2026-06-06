import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameterResourceLocator,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequestPaginated } from '../../transport';

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
];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const endpoint = '/documents/';
	const filters = this.getNodeParameter('filters', itemIndex, {}) as {
		document_type?: INodeParameterResourceLocator;
		tags?: { values?: Array<{ tag: INodeParameterResourceLocator }> };
		title?: string;
	};
	const query: IDataObject = {};

	if (filters.title) {
		query.title__icontains = filters.title;
	}

	if (filters.document_type?.value) {
		query.document_type__id = filters.document_type.value;
	}

	const tagIds = filters.tags?.values?.map(({ tag }) => tag.value).filter(Boolean);
	if (tagIds?.length) {
		query.tags__id__all = tagIds.join(',');
	}

	const responses = (await apiRequestPaginated.call(
		this,
		itemIndex,
		'GET',
		endpoint,
		undefined,
		query,
	)) as unknown[];

	return { json: { results: responses } };
}
