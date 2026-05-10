import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
} from 'n8n-workflow';

function getApiBaseUrl(url: string): string {
	const baseUrl = url.replace(/\/$/, '');

	return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	itemIndex: number,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
	option: IRequestOptions = {},
): Promise<unknown> {
	const queryParams = query || {};

	const credentials = await this.getCredentials('paperlessApi');
	const baseUrl = getApiBaseUrl(credentials.url as string);
	const apiKey = credentials.apiKey as string;
	const fullUrl = `${baseUrl}${endpoint}`;
	const options: IRequestOptions = {
		method,
		qs: queryParams,
		url: fullUrl,
		json: true,
		headers: {
			Authorization: `Token ${apiKey}`,
		},
	};

	if (Object.keys(option).length) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length) {
		options.body = body;
	}

	return this.helpers.requestWithAuthentication.call(
		this,
		'paperlessApi',
		options,
		undefined,
		itemIndex,
	);
}

export async function apiRequestPaginated(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	itemIndex: number,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
	option: IRequestOptions = {},
): Promise<unknown[]> {
	query = query || {};

	const credentials = await this.getCredentials('paperlessApi');
	const baseUrl = getApiBaseUrl(credentials.url as string);
	const apiKey = credentials.apiKey as string;
	const fullUrl = `${baseUrl}${endpoint}`;
	const options: IRequestOptions = {
		method,
		qs: query,
		url: fullUrl,
		json: true,
		headers: {
			Authorization: `Token ${apiKey}`,
		},
	};

	if (Object.keys(option).length) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length) {
		options.body = body;
	}

	const results: unknown[] = [];
	let nextUrl: string | null = fullUrl;

	while (nextUrl) {
		const response = (await this.helpers.requestWithAuthentication.call(
			this,
			'paperlessApi',
			{ ...options, url: nextUrl },
			undefined,
			itemIndex,
		)) as { results?: unknown[]; next?: string | null };

		if (Array.isArray(response)) {
			results.push(...response);
		} else if (Array.isArray(response.results)) {
			results.push(...response.results);
		} else {
			results.push(response);
		}

		nextUrl = response.next || null;
	}

	return results;
}
