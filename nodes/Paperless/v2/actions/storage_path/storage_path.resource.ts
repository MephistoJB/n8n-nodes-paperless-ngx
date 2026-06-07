import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as get from './get.operation';
import * as list from './list.operation';
import * as remove from './remove.operation';
import * as update from './update.operation';

export { create, get, list, remove, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		default: 'list',
		displayOptions: {
			show: { resource: ['storage_path'] },
		},
		noDataExpression: true,
		options: [
			{
				name: 'Create a Storage Path',
				value: 'create',
				action: 'Create a new storage path',
			},
			{
				name: 'Delete a Storage Path',
				value: 'remove',
				action: 'Delete a storage path',
			},
			{
				name: 'Get a Storage Path',
				value: 'get',
				action: 'Get a storage path',
			},
			{
				name: 'List Storage Paths',
				value: 'list',
				action: 'List all storage paths',
			},
			{
				name: 'Update a Storage Path',
				value: 'update',
				action: 'Update a storage path',
			},
		],
		type: 'options',
	},
	...create.description,
	...get.description,
	...list.description,
	...remove.description,
	...update.description,
];
