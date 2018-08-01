import _ from 'lodash';
import PromiseQueue from './request-queue';

let DEFAULT_READ_LIMIT = 100;
let DEFAULT_READ_LIMIT_SECONDS = 60;
let DEFAULT_READ_LIMIT_HEADER = 'x-ratelimit-read';
let DEFAULT_WRITE_LIMIT = 60;
let DEFAULT_WRITE_LIMIT_SECONDS = 60;
let DEFAULT_WRITE_LIMIT_HEADER = 'x-ratelimit-write';

// Rate Limit Options:
// request
// rateLimitRead
// rateLimitReadSeconds
// rateLimitWrite
// rateLimitWriteSeconds
// onRateLimitExceeded
// onRateLimitPause
// onRateLimitResume

module.exports = function rateLimitAdapter(options) {
	let readQueue = new PromiseQueue({
		request: options.request,
		limit: options.rateLimitRead || DEFAULT_READ_LIMIT,
		limitSeconds: options.rateLimitReadSeconds || DEFAULT_READ_LIMIT_SECONDS,
		limitHeader: DEFAULT_READ_LIMIT_HEADER,
		onRateLimitExceeded: _.partial(options.onRateLimitExceeded || _.noop, 'READ'),
		onRateLimitPause: _.partial(options.onRateLimitPause || _.noop, 'READ'),
		onRateLimitResume: _.partial(options.onRateLimitResume || _.noop, 'READ'),
	});

	let writeQueue = new PromiseQueue({
		request: options.request,
		limit: options.rateLimitWrite || DEFAULT_WRITE_LIMIT,
		limitSeconds: options.rateLimitWriteSeconds || DEFAULT_WRITE_LIMIT_SECONDS,
		limitHeader: DEFAULT_WRITE_LIMIT_HEADER,
		onRateLimitExceeded: _.partial(options.onRateLimitExceeded || _.noop, 'WRITE'),
		onRateLimitPause: _.partial(options.onRateLimitPause || _.noop, 'WRITE'),
		onRateLimitResume: _.partial(options.onRateLimitResume || _.noop, 'WRITE'),
	});

	return function rateLimitedRequest(opts) {
		return opts.method === 'GET' ? readQueue.enqueue(opts) : writeQueue.enqueue(opts);
	};
};
