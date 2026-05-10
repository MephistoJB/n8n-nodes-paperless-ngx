import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestPaginated } from '../../transport';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const endpoint = '/custom_fields/';
	const responses = (await apiRequestPaginated.call(this, itemIndex, 'GET', endpoint)) as any[];

	return { json: { results: responses } };
}
