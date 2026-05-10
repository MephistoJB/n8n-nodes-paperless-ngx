import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestPaginated } from '../../transport';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const endpoint = '/documents/';
	const responses = (await apiRequestPaginated.call(this, itemIndex, 'GET', endpoint)) as unknown[];

	return { json: { results: responses } };
}
