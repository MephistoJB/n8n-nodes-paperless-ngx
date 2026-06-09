<!-- trunk-ignore-all(markdownlint/MD041) -->

![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# @mephistojb/n8n-nodes-paperless

<!-- trunk-ignore-begin(markdownlint/MD033) -->
<div align="center">
	<img 
		src="https://raw.githubusercontent.com/MephistoJB/n8n-nodes-paperless-ngx/refs/heads/main/nodes/Paperless/v2/paperless-ngx.svg"
		alt="Paperless Icon"
		height="50px"
	>
</div>
<!-- trunk-ignore-end(markdownlint/MD033) -->

This is an independent n8n community node package. It lets you use [Paperless-ngx](https://docs.paperless-ngx.com/) in your n8n workflows.

Document updates support Paperless searchable content in addition to document metadata.
They also support expression-friendly JSON arrays for tags and custom fields,
including targeted tag removal while preserving all other document tags.

Paperless-ngx is a document management system that transforms your physical documents into a searchable online archive so you can keep your paper documents, but lose the cabinet.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

Install this package in n8n as:

```text
@mephistojb/n8n-nodes-paperless
```

> [!NOTE]
> This node requires the `form-data` package for handling multipart/form-data requests. It will be automatically installed as a dependency if not already present in your n8n installation.

## Operations

The node supports the following resources and operations:

### ASN (Archival Series Number)

- Get next ASN

### Correspondent

- Create/Update/Delete correspondent
- Get a correspondent
- List all correspondents

### Custom Field

- Create/Update/Delete custom field
- Get a custom field
- List all custom fields

### Document

- Create/Update/Delete document
- Get a document, including metadata JSON and the original file as binary data
- Get document history
- Get document metadata
- Get metadata suggestions
- Get document preview and thumbnail as binary data
- Include documents with selected tags, exclude documents carrying any selected tag, and limit queue-sized results
- Get document share links
- List all documents, optionally filtered by title, tags, document type, and storage path

### Document Metadata

- Get metadata suggestions

### Document Note

- Create/Delete document note
- List document notes

### Document Type

- Create/Update/Delete document type
- Get a document type
- List all document types

### Tag

- Create/Update/Delete tag
- Get a tag
- List all tags

### Storage Path

- Create/Update/Delete storage path
- Get a storage path
- List all storage paths

### Task

- Get a task

## AI Tools

This node can also be used to interact with the [AI tools agent](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent/). However, keep in mind that it is currently not officially supported by n8n and needs some changes to the n8n codebase to work. For more details, see [this issue](https://github.com/n8n-io/n8n/issues/12593).

## Credentials

You need to provide the following to authenticate:

- Paperless-ngx instance URL
- API token

The instance URL can be either the Paperless-ngx base URL, such as `http://paperless:8000`, or the API URL, such as `http://paperless:8000/api`.

To get your API token:

1. Login to your Paperless-ngx instance
2. Go to your user settings
3. Create a new API token

## Compatibility

Requires n8n version 1.0.0 or later and Paperless-ngx version 2.14.0 or later. Earlier versions may work but are not officially supported or tested.

## Publishing

The `Publish to npm` workflow runs on every push to `main`, when a stable GitHub release is published, and when manually started from the GitHub Actions page.

1. Configure a trusted GitHub Actions publisher for the package on npmjs.com using repository `MephistoJB/n8n-nodes-paperless-ngx` and workflow `publish-npm.yml`.
2. Push a change to `main`, manually run the workflow, or create a GitHub release whose tag matches the package version.

If the version already exists on npm, push and manual runs automatically increment the patch version before publishing and commit that version back to `main`. Stable releases keep their explicit tag version. The workflow type checks the project, runs the package's prepublish build and lint checks, and publishes the scoped package through npm trusted publishing with automatic provenance.

## Resources

- [GitHub repository](https://github.com/MephistoJB/n8n-nodes-paperless-ngx)
- [npm package](https://www.npmjs.com/package/@mephistojb/n8n-nodes-paperless)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Paperless-ngx documentation](https://docs.paperless-ngx.com/)
- [Paperless-ngx API documentation](https://docs.paperless-ngx.com/api/)

## License

[MIT](./LICENSE.md)
