const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { Readable } = require('node:stream');
const { test } = require('node:test');
const vm = require('node:vm');

const operationPath = path.resolve(__dirname, '../dist/nodes/Paperless/v2/actions/document/create.operation.js');
const operationRequire = createRequire(operationPath);
const payload = Buffer.from([0, 1, 13, 10, 128, 254, 255]);

function loadOperation(apiRequest) {
  const module = { exports: {} };
  const require = (name) => name === '../../transport' ? { apiRequest } : operationRequire(name);
  vm.runInThisContext(`(function(require, module, exports) {\n${fs.readFileSync(operationPath, 'utf8')}\n})`, { filename: operationPath })(require, module, module.exports);
  return module.exports.execute;
}

for (const stored of [false, true]) {
  test(`upload has a calculable length and exact file bytes (${stored ? 'stored binary' : 'inline binary'})`, async () => {
    let requests = 0;
    const taskId = '00000000-0000-4000-8000-000000000001';
    const execute = loadOperation(async function (index, method, endpoint, body, query, options) {
      requests++;
      assert.equal(index, 0);
      assert.equal(method, 'POST');
      assert.equal(endpoint, '/documents/post_document/');
      const length = await new Promise((resolve, reject) => options.formData.getLength((error, length) => error ? reject(error) : resolve(length)));
      const encoded = options.formData.getBuffer();
      assert.equal(length, encoded.length);
      assert.ok(encoded.includes(payload));
      const multipart = encoded.toString('utf8');
      assert.match(multipart, /name="document"; filename="Scan.pdf"/);
      assert.match(multipart, /Content-Type: application\/pdf/);
      assert.match(multipart, /name="title"\r\n\r\nScan upload/);
      assert.match(multipart, /name="archive_serial_number"\r\n\r\n0/);
      assert.match(multipart, /name="correspondent"\r\n\r\n42/);
      assert.doesNotMatch(multipart, /name="created"|name="storage_path"/);
      return taskId;
    });
    const result = await execute.call({
      getNodeParameter(name) {
        if (name === 'binary_property_name') return 'scan';
        return { title: 'Scan upload', archive_serial_number: 0, correspondent: { value: 42 }, created: '' };
      },
      helpers: {
        assertBinaryData(index, name) {
          assert.equal(index, 0);
          assert.equal(name, 'scan');
          return { id: stored ? 'filesystem:stored-scan' : undefined, data: stored ? 'filesystem-v2' : payload.toString('base64'), fileName: 'Scan.pdf', mimeType: 'application/pdf' };
        },
        async getBinaryDataBuffer(index, name) {
          assert.equal(index, 0);
          assert.equal(name, 'scan');
          return payload;
        },
        async getBinaryStream() { return Readable.from([payload]); },
      },
    }, 0);
    assert.equal(requests, 1);
    assert.deepEqual(result, { json: { results: [taskId] } });
  });
}

test('binary read errors propagate without sending a partial upload', async () => {
  const execute = loadOperation(async () => { assert.fail('No request should be sent'); });
  await assert.rejects(execute.call({
    getNodeParameter() { return 'data'; },
    helpers: {
      assertBinaryData() { return { id: 'filesystem:missing', fileName: 'Scan.pdf', mimeType: 'application/pdf' }; },
      async getBinaryDataBuffer() { throw new Error('Stored binary missing'); },
    },
  }, 0), /Stored binary missing/);
});
